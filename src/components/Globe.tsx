"use client";

// This component shows the spinning 3D Earth.
// It must run in the BROWSER (not on the server) because it draws
// live 3D graphics, which need the browser's screen and graphics card.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";

// react-globe.gl uses the browser's `window`, which doesn't exist on the
// server. So we load it lazily and tell Next.js: "only in the browser"
// with ssr: false ("ssr" = server-side rendering).
const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function Globe() {
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
      // When the globe is ready, start it gently spinning and set the zoom.
      onGlobeReady={() => {
        if (!globeRef.current) return;
        const controls = globeRef.current.controls();
        controls.autoRotate = true; // spin by itself
        controls.autoRotateSpeed = 0.6; // slow, calm speed
        controls.enableZoom = true; // let the user scroll to zoom
        globeRef.current.pointOfView({ altitude: 2.4 }); // starting zoom level
      }}
    />
  );
}
