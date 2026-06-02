"use client";

// This is the PARENT that connects the globe and the side panel.
// It remembers which event is currently selected, and shares that:
//   - the Globe reports clicks UP to here
//   - the SidePanel reads the selected event DOWN from here

import { useState } from "react";
import Globe from "./Globe";
import SidePanel from "./SidePanel";
import { type NewsEvent } from "@/data/events";

export default function AmbientMap() {
  // The memory: which event is selected right now (null = none).
  const [selected, setSelected] = useState<NewsEvent | null>(null);

  return (
    <>
      {/* When a beacon is clicked, the globe calls setSelected with that event. */}
      <Globe onSelect={setSelected} />

      {/* The panel shows the selected event; closing it sets selection back to null. */}
      <SidePanel event={selected} onClose={() => setSelected(null)} />
    </>
  );
}
