# 🌍 Ambient News — The World as a Living Map

Instead of a list of headlines, **Ambient News** shows the world as a glowing,
breathing organism. Each region pulses with what's happening there right now:

- 🔴 **Conflict** — wars, attacks, unrest, politics
- 🟢 **Economy** — markets, business, trade, technology
- 🔵 **Nature** — disasters, weather, climate, health

The brighter and faster a region pulses, the more severe the event. Click any
glowing region to read an AI-written summary and jump to the full story.

## ✨ Features

- **Interactive 3D globe** — a spinning, glowing Earth you can drag and zoom
- **Live news** — pulled from free RSS feeds (BBC regions, Al Jazeera, NYT, The Guardian)
- **AI understanding** — each headline is placed on the map, categorized, and
  rated for severity, with a one-line plain-English summary
- **Breathing visualization** — regions pulse faster the more severe the event
- **Filters & legend** — show/hide conflict, economy, or nature
- **Auto-refresh** — the map quietly updates every few minutes

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl) + three.js for the 3D globe
- [Google Gemini](https://ai.google.dev/) for news geocoding, classification & summaries
- RSS feeds (via `fast-xml-parser`) as the free, unlimited news source

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Add your free Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 3. Run the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Get a free Gemini API key (no credit card) at
[Google AI Studio](https://aistudio.google.com/apikey).

## 🧠 How it works

1. `/api/news` fetches and de-duplicates the latest headlines from several RSS feeds.
2. `/api/events` sends those headlines (in parallel batches) to Gemini, which
   returns each newsworthy item's location, category, severity, and a short
   summary. Results are cached so the map stays fast and stays within free limits.
3. The globe plots each event as a glowing, pulsing region you can click to explore.

## 📄 License

MIT — feel free to learn from it.
