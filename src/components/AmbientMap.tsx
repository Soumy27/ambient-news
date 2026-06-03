"use client";

// This is the PARENT that connects the globe and the side panel.
// It also FETCHES the live AI events when the page loads.

import { useEffect, useState } from "react";
import Globe from "./Globe";
import SidePanel from "./SidePanel";
import { EVENTS as SAMPLE_EVENTS, type NewsEvent } from "@/data/events";

export default function AmbientMap() {
  // The events to show on the globe (starts empty).
  const [events, setEvents] = useState<NewsEvent[]>([]);
  // Whether we're still loading the live news.
  const [loading, setLoading] = useState(true);
  // Which event is currently selected (null = none).
  const [selected, setSelected] = useState<NewsEvent | null>(null);

  // When the page first loads, fetch the live AI-placed events.
  useEffect(() => {
    let active = true; // guard against updating after the page is gone

    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (!active) return;
        // If the AI returned events, use them; otherwise fall back to samples.
        setEvents(data.events?.length ? data.events : SAMPLE_EVENTS);
      } catch {
        if (active) setEvents(SAMPLE_EVENTS); // network/AI failed: show samples
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <Globe events={events} onSelect={setSelected} />
      <SidePanel event={selected} onClose={() => setSelected(null)} />

      {/* A gentle loading message while the AI reads the world. */}
      {loading && (
        <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex justify-center">
          <span className="animate-pulse rounded-full bg-white/10 px-4 py-2 text-sm text-zinc-300 backdrop-blur">
            Reading the world…
          </span>
        </div>
      )}
    </>
  );
}
