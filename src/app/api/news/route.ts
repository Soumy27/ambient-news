// Server endpoint at "/api/news": returns the latest raw headlines.
import { fetchArticles } from "@/lib/news";

export async function GET() {
  const articles = await fetchArticles();
  return Response.json({ count: articles.length, articles });
}
