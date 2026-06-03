// Shared helper for fetching news from free RSS feeds.
// Both /api/news and /api/events use this, so the logic lives in one place.

import { XMLParser } from "fast-xml-parser";

const FEEDS = [
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { source: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
];

export type Article = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

const parser = new XMLParser();

async function fetchFeed(source: string, url: string): Promise<Article[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const xml = await res.text();
    const data = parser.parse(xml);
    const items = data?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items];

    return list.map((item: Record<string, unknown>) => ({
      title: String(item.title ?? "").trim(),
      link: String(item.link ?? "").trim(),
      source,
      publishedAt: String(item.pubDate ?? "").trim(),
    }));
  } catch {
    return [];
  }
}

// Fetch all feeds at once and return one combined list of articles.
export async function fetchArticles(): Promise<Article[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));
  return results.flat().filter((a) => a.title.length > 0);
}
