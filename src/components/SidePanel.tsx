"use client";

// The panel that slides in from the right when you click a beacon.
// It shows the details of the selected event.

import { type NewsEvent, type EventType, TYPE_COLORS } from "@/data/events";

// Friendly display names for each event type.
const TYPE_LABELS: Record<EventType, string> = {
  conflict: "Conflict",
  economy: "Economy",
  nature: "Natural Event",
};

// The settings this component accepts from its parent.
type SidePanelProps = {
  event: NewsEvent | null; // the selected event, or null if nothing is selected
  onClose: () => void; // called when the user closes the panel
};

export default function SidePanel({ event, onClose }: SidePanelProps) {
  return (
    <aside
      // The panel is always on the page, but slides off-screen (translate-x-full)
      // when nothing is selected, and slides into view (translate-x-0) when it is.
      className={`fixed right-0 top-0 z-20 h-screen w-full max-w-sm transform border-l border-white/10 bg-zinc-900/80 p-6 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 ${
        event ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Close button in the top-right corner. */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 text-2xl text-zinc-400 hover:text-white"
      >
        ✕
      </button>

      {/* Only show details if an event is actually selected. */}
      {event && (
        <div className="mt-8">
          {/* A colored badge showing the event type. */}
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: `${TYPE_COLORS[event.type]}22`, // faint tint
              color: TYPE_COLORS[event.type], // full color text
            }}
          >
            {TYPE_LABELS[event.type]}
          </span>

          {/* The location. */}
          <h2 className="mt-4 text-3xl font-bold">{event.city}</h2>
          <p className="text-zinc-400">{event.country}</p>

          {/* The severity, shown as a number and a colored bar. */}
          <div className="mt-6">
            <div className="mb-1 flex justify-between text-sm text-zinc-400">
              <span>Severity</span>
              <span>{event.severity}/10</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${event.severity * 10}%`,
                  backgroundColor: TYPE_COLORS[event.type],
                }}
              />
            </div>
          </div>

          {/* The headline / summary. */}
          <p className="mt-6 text-lg leading-relaxed text-zinc-200">
            {event.headline}
          </p>
        </div>
      )}
    </aside>
  );
}
