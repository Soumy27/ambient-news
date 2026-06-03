// This is a SERVER program (a "Route Handler"). It runs on the server when
// someone visits the address "/api/news". It fetches real news headlines from
// free RSS feeds and returns them as a clean JSON list.
//
// RSS feeds are just web pages written in XML (a tag-based text format).
// We download each feed's text and read it with fast-xml-parser.

import { XMLParser } from "fast-xml-parser";

// The free news sources we pull from. Add or remove any you like.
const FEEDS = [
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { source: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { source: "NYT", url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
];

// The clean shape we return for each article.
type Article = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
};

// A reusable XML reader.
const parser = new XMLParser();

// Download and read ONE feed. If it fails, we return an empty list instead
// of crashing the whole request.
async function fetchFeed(source: string, url: string): Promise<Article[]> {
  try {
    // cache: "no-store" means "always get fresh news, never a saved copy".
    const res = await fetch(url, { cache: "no-store" });
    const xml = await res.text();
    const data = parser.parse(xml);

    // In RSS, articles live at rss -> channel -> item (a list).
    const items = data?.rss?.channel?.item ?? [];
    const list = Array.isArray(items) ? items : [items]; // handle single item

    return list.map((item: Record<string, unknown>) => ({
      title: String(item.title ?? "").trim(),
      link: String(item.link ?? "").trim(),
      source,
      publishedAt: String(item.pubDate ?? "").trim(),
    }));
  } catch {
    return []; // a broken feed shouldn't break everything
  }
}

// This runs when someone visits "/api/news".
export async function GET() {
  // Fetch all feeds at the same time (faster than one-by-one).
  const results = await Promise.all(FEEDS.map((f) => fetchFeed(f.source, f.url)));

  // Flatten the lists into one, and keep only articles that have a title.
  const articles = results.flat().filter((a) => a.title.length > 0);

  // Hand the list back as JSON.
  return Response.json({ count: articles.length, articles });
}
