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
For each headline below, decide if it fits ONE of these categories:
- "conflict": war, violence, attacks, unrest, crime
- "economy": markets, business, trade, jobs, money
- "nature": weather, disasters, climate, earthquakes, environment

If a headline does NOT clearly fit one of those (e.g. sport, celebrity,
opinion), SKIP it. For each one you keep, return:
- index: the headline's number
- city + country: the single most relevant place
- lat + lng: that place's coordinates (decimal degrees)
- type: conflict, economy, or nature
- severity: 1 (minor) to 10 (catastrophic)
- summary: one short, plain-English sentence

Headlines:
${numbered}`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  // Gemini hands back JSON text; turn it into a real list and sanity-check it.
  try {
    const parsed = JSON.parse(res.text ?? "[]") as ClassifiedEvent[];
    return parsed.filter(
      (e) =>
        typeof e.lat === "number" &&
        typeof e.lng === "number" &&
        ["conflict", "economy", "nature"].includes(e.type),
    );
  } catch {
    return [];
  }
}
