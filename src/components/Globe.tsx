"use client";

// This component shows the spinning 3D Earth.
// It must run in the BROWSER (not on the server) because it draws
// live 3D graphics, which need the browser's screen and graphics card.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import { TYPE_COLORS, type NewsEvent } from "@/data/events";

// react-globe.gl uses the browser's `window`, which doesn't exist on the
// server. So we load it lazily and tell Next.js: "only in the browser"
// with ssr: false ("ssr" = server-side rendering).
const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

// Turn a hex color like "#ff3b30" into a see-through "rgba" color.
// alpha 1 = fully solid, 0 = fully invisible. We use this to fade each
// ripple out as it spreads, so it looks like a glow softening into space.
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// The settings (props) this component accepts from its parent.
type GlobeProps = {
  events: NewsEvent[]; // the events to plot on the globe
  onSelect: (event: NewsEvent) => void; // called when a beacon is clicked
};

export default function Globe({ events, onSelect }: GlobeProps) {
  // A "remote control" handle to the globe, so we can tell it to spin.
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  // Remember the current window size so the globe always fills the screen.
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Keep the globe matching the window size (runs once, then on every resize).
  useEffect(() => {
    const updateSize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Start the globe gently spinning. We keep checking every animation frame
  // until the globe's controls exist, then switch on auto-rotation. Because
  // this lives in useEffect, it re-applies on every reload (unlike the
  // one-time onGlobeReady), so the spin never gets "stuck off".
  useEffect(() => {
    let frameId: number;
    const startSpinning = () => {
      const globe = globeRef.current;
      if (globe && globe.controls()) {
        const controls = globe.controls();
        controls.autoRotate = true; // spin by itself
        controls.autoRotateSpeed = 0.8; // calm, clearly-visible speed
        controls.enableZoom = true; // let the user scroll to zoom
        globe.pointOfView({ altitude: 2.4 }); // starting zoom level
      } else {
        // Not ready yet — try again on the next frame.
        frameId = requestAnimationFrame(startSpinning);
      }
    };
    startSpinning();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <GlobeGL
      ref={globeRef}
      width={size.width}
      height={size.height}
      globeImageUrl="/earth-night.jpg" // the Earth's surface (city lights)
      bumpImageUrl="/earth-topology.png" // makes mountains look raised
      backgroundImageUrl="/night-sky.png" // the starry sky behind it
      // The soft blue glow around the planet's edge:
      showAtmosphere={true}
      atmosphereColor="#3a7bd5"
      atmosphereAltitude={0.18}
      // === The glowing news dots ===
      pointsData={events} // the list of events to plot
      pointLat={(d) => (d as NewsEvent).lat} // where (north/south)
      pointLng={(d) => (d as NewsEvent).lng} // where (east/west)
      pointColor={(d) => hexToRgba(TYPE_COLORS[(d as NewsEvent).type], 0.5)} // soft glow
      pointAltitude={0.01} // flat on the surface — no lines sticking out
      pointRadius={(d) => 0.5 + (d as NewsEvent).severity * 0.18} // bigger glow = worse
      pointResolution={24} // smooth, round glowing patch
      onPointClick={(point) => onSelect(point as NewsEvent)} // report the click up
      pointLabel={(d) => (d as NewsEvent).city} // tooltip on hover
      // === The pulsing ripples (the "breathing" effect) ===
      ringsData={events} // one set of ripples per event
      ringLat={(d) => (d as NewsEvent).lat}
      ringLng={(d) => (d as NewsEvent).lng}
      // Each ripple starts bright and fades to invisible as it grows (t: 0→1).
      ringColor={(d) => {
        const color = TYPE_COLORS[(d as NewsEvent).type];
        return (t: number) => hexToRgba(color, 1 - t);
      }}
      ringMaxRadius={(d) => 3 + (d as NewsEvent).severity * 0.7} // bigger halo = worse
      ringPropagationSpeed={2} // how fast each ripple spreads
      // More severe events pulse more often (smaller gap between ripples).
      ringRepeatPeriod={(d) => 2200 - (d as NewsEvent).severity * 130}
    />
  );
}
