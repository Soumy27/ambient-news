"use client";

// The legend + filter bar. Each chip shows what a color means AND can be
// clicked to hide/show that kind of event on the globe.

import { type EventType, TYPE_COLORS } from "@/data/events";

const ITEMS: { type: EventType; label: string }[] = [
  { type: "conflict", label: "Conflict" },
  { type: "economy", label: "Economy" },
  { type: "nature", label: "Nature" },
];

type LegendProps = {
  active: Record<EventType, boolean>; // which types are currently shown
  onToggle: (type: EventType) => void; // called when a chip is clicked
};

export default function Legend({ active, onToggle }: LegendProps) {
  return (
    <div className="absolute bottom-6 left-6 z-10">
      <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
        Filter
      </p>
      <div className="flex gap-2">
        {ITEMS.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              active[type]
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/5 text-zinc-500"
            }`}
          >
            {/* The colored dot = the legend key. */}
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: TYPE_COLORS[type],
                opacity: active[type] ? 1 : 0.3,
              }}
            />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
