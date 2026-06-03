"use client";

// This is the PARENT that connects the globe and the side panel.
// It also FETCHES the live AI events when the page loads.

import { useEffect, useState } from "react";
import Globe from "./Globe";
import SidePanel from "./SidePanel";
import Legend from "./Legend";
import {
  EVENTS as SAMPLE_EVENTS,
  type EventType,
  type NewsEvent,
} from "@/data/events";

export default function AmbientMap() {
  // The events to show on the globe (starts empty).
  const [events, setEvents] = useState<NewsEvent[]>([]);
  // Whether we're still loading the live news.
  const [loading, setLoading] = useState(true);
  // Which event is currently selected (null = none).
  const [selected, setSelected] = useState<NewsEvent | null>(null);
  // When we last refreshed the news (null until the first load finishes).
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Which event types are currently switched on in the filter.
  const [active, setActive] = useState<Record<EventType, boolean>>({
    conflict: true,
    economy: true,
    nature: true,
  });

  // Flip one type on or off when its filter chip is clicked.
  function toggleType(type: EventType) {
    setActive((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  // Only show events whose type is currently switched on.
  const visibleEvents = events.filter((e) => active[e.type]);

  // Fetch the live AI events on load, then refresh every 5 minutes.
  useEffect(() => {
    let isMounted = true; // guard against updating after the page is gone

    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (!isMounted) return;
        // If the AI returned events, use them; otherwise fall back to samples.
        setEvents(data.events?.length ? data.events : SAMPLE_EVENTS);
        setLastUpdated(new Date());
      } catch {
        if (isMounted) setEvents(SAMPLE_EVENTS); // network/AI failed: samples
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvents(); // first load
    // Refresh in the background every 5 minutes to keep the map current.
    const timer = setInterval(loadEvents, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(timer); // stop refreshing when the page goes away
    };
  }, []);

  return (
    <>
      <Globe events={visibleEvents} onSelect={setSelected} />
      <SidePanel event={selected} onClose={() => setSelected(null)} />
      <Legend active={active} onToggle={toggleType} />

      {/* A subtle "live" indicator showing when the news last refreshed. */}
      {lastUpdated && (
        <div className="absolute right-6 top-6 z-10 flex items-center gap-2 text-xs text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          Updated{" "}
          {lastUpdated.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

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
