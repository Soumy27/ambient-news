// This file holds our PRETEND news events for now.
// In Phase 3 we'll replace this with real news, but the shape stays the same,
// so the globe won't need to change.

// The three kinds of events our map understands.
export type EventType = "conflict" | "economy" | "nature";

// A "type" is a blueprint describing what every event must contain.
// TypeScript uses this to catch mistakes (e.g. forgetting the latitude).
export interface NewsEvent {
  id: number; // a unique number for each event
  city: string; // where it happened
  country: string;
  lat: number; // latitude: how far north/south (-90 to 90)
  lng: number; // longitude: how far east/west (-180 to 180)
  type: EventType; // conflict, economy, or nature
  severity: number; // how serious, from 1 (minor) to 10 (huge)
  headline: string; // a short summary of the event
}

// The color each event type glows on the map.
export const TYPE_COLORS: Record<EventType, string> = {
  conflict: "#ff3b30", // red
  economy: "#34c759", // green
  nature: "#0a84ff", // blue
};

// Our list of pretend events around the world.
export const EVENTS: NewsEvent[] = [
  {
    id: 1,
    city: "Kyiv",
    country: "Ukraine",
    lat: 50.45,
    lng: 30.52,
    type: "conflict",
    severity: 9,
    headline: "Heavy fighting reported near the capital.",
  },
  {
    id: 2,
    city: "Tokyo",
    country: "Japan",
    lat: 35.68,
    lng: 139.69,
    type: "economy",
    severity: 6,
    headline: "Stock market hits a record high.",
  },
  {
    id: 3,
    city: "Jakarta",
    country: "Indonesia",
    lat: -6.21,
    lng: 106.85,
    type: "nature",
    severity: 7,
    headline: "Major flooding displaces thousands.",
  },
  {
    id: 4,
    city: "New York",
    country: "USA",
    lat: 40.71,
    lng: -74.01,
    type: "economy",
    severity: 5,
    headline: "Tech companies announce big new investments.",
  },
  {
    id: 5,
    city: "Gaza",
    country: "Palestine",
    lat: 31.5,
    lng: 34.47,
    type: "conflict",
    severity: 10,
    headline: "Escalating clashes raise humanitarian concerns.",
  },
  {
    id: 6,
    city: "Reykjavik",
    country: "Iceland",
    lat: 64.15,
    lng: -21.94,
    type: "nature",
    severity: 8,
    headline: "Volcanic eruption prompts evacuations.",
  },
  {
    id: 7,
    city: "Lagos",
    country: "Nigeria",
    lat: 6.52,
    lng: 3.38,
    type: "economy",
    severity: 4,
    headline: "Startups drive a surge in regional growth.",
  },
  {
    id: 8,
    city: "Santiago",
    country: "Chile",
    lat: -33.45,
    lng: -70.67,
    type: "nature",
    severity: 6,
    headline: "Strong earthquake shakes the region.",
  },
];
