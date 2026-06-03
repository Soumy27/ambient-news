// Server endpoint at "/api/events": the full pipeline, now with caching.
// 1) fetch raw headlines  2) ask the AI to place + classify them
// 3) return events in the shape the globe already understands.
//
// To stay fast and protect our free Gemini allowance, we remember the result
// for 10 minutes and reuse it instead of re-running the AI every visit.

import { fetchArticles } from "@/lib/news";
import { classifyHeadlines } from "@/lib/classify";
import type { NewsEvent } from "@/data/events";

const MAX_HEADLINES = 24; // how many headlines to send the AI at once
const CACHE_MS = 10 * 60 * 1000; // remember the result for 10 minutes

// The saved copy: the events and the time we made them (null = none yet).
let cache: { at: number; events: NewsEvent[] } | null = null;
// If a build is already running, this holds it so others can wait for it
// instead of starting a second (duplicate) AI call.
let inFlight: Promise<NewsEvent[]> | null = null;

// The actual work: fetch news, classify with AI, format for the globe.
async function buildEvents(): Promise<NewsEvent[]> {
  const articles = (await fetchArticles()).slice(0, MAX_HEADLINES);
  const titles = articles.map((a) => a.title);
  const classified = await classifyHeadlines(titles);

  return classified.map((c, i) => {
    const article = articles[c.index - 1]; // index is 1-based
    return {
      id: i,
      city: c.city,
      country: c.country,
      lat: c.lat,
      lng: c.lng,
      type: c.type,
      severity: Math.min(10, Math.max(1, Math.round(c.severity))), // keep 1–10
      headline: c.summary,
      link: article?.link,
      source: article?.source,
    };
  });
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
  const events = await inFlight;

  // 3) Save the fresh result for next time.
  cache = { at: now, events };

  return Response.json({ count: events.length, events, cached: false });
}
