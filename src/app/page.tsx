// The homepage of Ambient News.
// It shows the spinning 3D globe full-screen, with the title floating on top.

import AmbientMap from "@/components/AmbientMap";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* The globe + clickable beacons + sliding info panel. */}
      <AmbientMap />

      {/* The title floats in the top-left, on top of the globe (z-10). */}
      <div className="absolute left-6 top-6 z-10">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Ambient News
        </h1>
        <p className="text-sm text-zinc-400">The world as a living map.</p>
      </div>
    </main>
  );
}
