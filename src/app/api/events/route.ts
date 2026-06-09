// Server endpoint at "/api/events": the full pipeline, now with caching.
// 1) fetch raw headlines  2) ask the AI to place + classify them
// 3) return events in the shape the globe already understands.
//
// To stay fast and protect our free Gemini allowance, we remember the result
// for 10 minutes and reuse it instead of re-running the AI every visit.

import { fetchArticles } from "@/lib/news";
import { classifyHeadlines } from "@/lib/classify";
import type { NewsEvent } from "@/data/events";

const MAX_HEADLINES = 110; // how many headlines to process in total
const CHUNK_SIZE = 22; // headlines per AI call (5 parallel calls) for speed
const CACHE_MS = 30 * 60 * 1000; // remember the result for 30 minutes

// The saved copy: the events and the time we made them (null = none yet).
let cache: { at: number; events: NewsEvent[] } | null = null;
// If a build is already running, this holds it so others can wait for it
// instead of starting a second (duplicate) AI call.
let inFlight: Promise<NewsEvent[]> | null = null;

// The actual work: fetch news, classify with AI (in parallel), format.
async function buildEvents(): Promise<NewsEvent[]> {
  const articles = (await fetchArticles()).slice(0, MAX_HEADLINES);
  const titles = articles.map((a) => a.title);

  // Split the headlines into small chunks so we can ask the AI about all of
  // them AT THE SAME TIME. Several small calls finish far faster than one big.
  const chunks: string[][] = [];
  for (let i = 0; i < titles.length; i += CHUNK_SIZE) {
    chunks.push(titles.slice(i, i + CHUNK_SIZE));
  }
  const chunkResults = await Promise.all(
    chunks.map((chunk) => classifyHeadlines(chunk)),
  );

  // Stitch every chunk's results back to the right original article. Each
  // chunk numbers its headlines from 1, so we add the chunk's offset.
  const events: NewsEvent[] = [];
  chunkResults.forEach((classified, chunkIndex) => {
    const offset = chunkIndex * CHUNK_SIZE;
    classified.forEach((c) => {
      const article = articles[offset + c.index - 1];
      events.push({
        id: events.length,
        city: c.city,
        country: c.country,
        lat: c.lat,
        lng: c.lng,
        type: c.type,
        severity: Math.min(10, Math.max(1, Math.round(c.severity))), // 1–10
        headline: c.summary,
        link: article?.link,
        source: article?.source,
      });
    });
  });

  return events;
}

export async function GET() {
  const now = Date.now();

  // 1) If we have a fresh saved copy, return it instantly.
  if (cache && now - cache.at < CACHE_MS) {
    return Response.json({
      count: cache.events.length,
      events: cache.events,
      cached: true,
    });
  }

  // 2) If a build is already running, wait for that one (don't start another).
  if (!inFlight) {
    inFlight = buildEvents().finally(() => {
      inFlight = null;
    });
  }

  let events: NewsEvent[] = [];
  try {
    events = await inFlight;
  } catch {
    events = []; // build failed entirely
  }

  // 3) If we got real results, save and return them.
  if (events.length > 0) {
    cache = { at: now, events };
    return Response.json({ count: events.length, events, cached: false });
  }

  // 4) Build failed/empty: serve the old copy if we have one (better than
  //    nothing), otherwise an empty list (the client shows sample events).
  if (cache) {
    return Response.json({
      count: cache.events.length,
      events: cache.events,
      cached: true,
      stale: true,
    });
  }
  return Response.json({ count: 0, events: [] });
}
