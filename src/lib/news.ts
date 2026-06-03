// Shared helper for fetching news from free RSS feeds.
// Both /api/news and /api/events use this, so the logic lives in one place.

import { XMLParser } from "fast-xml-parser";

// A spread of free world feeds, including BBC's regional editions so we get
// news from every part of the globe (not just the big Western headlines).
const FEEDS = [
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
  { source: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { source: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { source: "The Guardian", url: "https://www.theguardian.com/world/rss" },
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

// Fetch all feeds at once, then return one combined list with duplicates
// removed (the same story often appears in several feeds).
export async function fetchArticles(): Promise<Article[]> {
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));

  const seen = new Set<string>();
  return results.flat().filter((a) => {
    if (a.title.length === 0) return false;
    const key = a.title.toLowerCase();
    if (seen.has(key)) return false; // skip a title we've already kept
    seen.add(key);
    return true;
  });
}
