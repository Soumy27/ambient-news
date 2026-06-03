// Server endpoint at "/api/events": the full pipeline.
// 1) fetch raw headlines  2) ask the AI to place + classify them
// 3) return events in the shape the globe already understands.

import { fetchArticles } from "@/lib/news";
import { classifyHeadlines } from "@/lib/classify";
import type { NewsEvent } from "@/data/events";

// How many headlines to send to the AI at once. Smaller = faster + cheaper.
const MAX_HEADLINES = 24;

export async function GET() {
  // 1) Get the latest articles and take the first batch.
  const articles = (await fetchArticles()).slice(0, MAX_HEADLINES);
  const titles = articles.map((a) => a.title);

  // 2) Let the AI place and classify them.
  const classified = await classifyHeadlines(titles);

  // 3) Turn each AI result into a NewsEvent, attaching the original
  //    article's link and source using the index the AI gave us.
  const events: NewsEvent[] = classified.map((c, i) => {
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

  return Response.json({ count: events.length, events });
}
