// The AI brain. It reads raw headlines and turns the newsworthy ones into
// placed, typed, severity-rated events using free Google Gemini.

import { GoogleGenAI, Type } from "@google/genai";
import type { EventType } from "@/data/events";

// One event as the AI returns it.
export type ClassifiedEvent = {
  index: number; // which headline it came from (1-based)
  city: string;
  country: string;
  lat: number;
  lng: number;
  type: EventType;
  severity: number;
  summary: string;
};

// Set up Gemini using the secret key from .env.local.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// flash-lite is fast and has a generous free daily limit.
const MODEL = "gemini-2.5-flash-lite";

// We tell Gemini the EXACT shape of JSON we want back. This makes its
// answers reliable and easy to read (no guessing or messy text).
const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      index: { type: Type.NUMBER },
      city: { type: Type.STRING },
      country: { type: Type.STRING },
      lat: { type: Type.NUMBER },
      lng: { type: Type.NUMBER },
      type: { type: Type.STRING, enum: ["conflict", "economy", "nature"] },
      severity: { type: Type.NUMBER },
      summary: { type: Type.STRING },
    },
    required: [
      "index",
      "city",
      "country",
      "lat",
      "lng",
      "type",
      "severity",
      "summary",
    ],
  },
};

export async function classifyHeadlines(
  titles: string[],
): Promise<ClassifiedEvent[]> {
  if (titles.length === 0) return [];

  // Number each headline so the AI can tell us which one each event is from.
  const numbered = titles.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const prompt = `You are a news geographer for a live world map.
For each headline below, choose the BEST-FITTING of these categories:
- "conflict": war, violence, attacks, unrest, crime, politics, elections,
  protests, security, diplomacy, human rights
- "economy": markets, business, trade, jobs, money, technology, energy,
  companies, infrastructure
- "nature": weather, disasters, climate, earthquakes, environment, wildlife,
  health, science, space

Be generous: most world news fits one of these. Only SKIP pure sport,
celebrity gossip, or opinion pieces with no real-world location. Prefer a
wide spread of countries. For each headline you keep, return:
- index: the headline's number
- city + country: the single most relevant place
- lat + lng: that place's coordinates (decimal degrees)
- type: conflict, economy, or nature
- severity: 1 (minor) to 10 (catastrophic)
- summary: one short, plain-English sentence

Headlines:
${numbered}`;

  // Try up to 3 times. If the AI is briefly rate-limited, wait and retry;
  // if it ultimately fails, return an empty list so the map still works.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
        },
      });

      const parsed = JSON.parse(res.text ?? "[]") as ClassifiedEvent[];
      return parsed.filter(
        (e) =>
          typeof e.lat === "number" &&
          typeof e.lng === "number" &&
          ["conflict", "economy", "nature"].includes(e.type),
      );
    } catch {
      // Wait a bit longer each retry (2s, then 4s) before trying again.
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  }

  return []; // gave up on this chunk; don't crash the whole map
}
