// This is the homepage of Ambient News.
// For now it shows a starry space background with the project title.
// In Phase 2 the glowing 3D globe will live right here.

// Build a fixed list of 60 stars with spread-out positions.
// We use simple math (not random) so the stars are the SAME every time
// the page loads — this keeps the website happy and error-free.
const stars = Array.from({ length: 60 }, (_, i) => ({
  top: (i * 47) % 100, // vertical position, 0–100% down the screen
  left: (i * 83) % 100, // horizontal position, 0–100% across
  size: (i % 3) + 1, // star width in pixels: 1, 2, or 3
  delay: (i % 5) * 0.6, // twinkle delay so they don't all blink together
}));

export default function Home() {
  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-black">
      {/* The starfield: draw each star as a tiny glowing dot. */}
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* A soft blue glow behind the title, like a distant planet. */}
      <div className="absolute h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      {/* The title text, sitting on top of everything (z-10). */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Ambient News
        </h1>
        <p className="mt-4 text-lg text-zinc-400 sm:text-xl">
          The world as a living map.
        </p>
      </div>
    </main>
  );
}
