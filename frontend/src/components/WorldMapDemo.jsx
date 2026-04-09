import { motion } from "motion/react";
import { WorldMap } from "./ui/world-map.jsx";

export function WorldMapDemo() {
  return (
    <div className="relative w-full bg-transparent py-12">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xl font-bold text-zinc-100 md:text-4xl">
          Skip{" "}
          <span className="text-zinc-400">
            {"the setup".split("").map((letter, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </p>

        <div className="flex justify-center">
          <p className="max-w-2xl py-4 text-sm leading-relaxed text-zinc-400 md:text-lg">
            Skip setup and start coding together instantly. Create rooms and
            collaborate in one click, whether you are building with teammates,
            teaching a friend, or pair programming.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl rounded-3xl border border-zinc-900 bg-zinc-950/70 p-4 shadow-[0_26px_70px_-45px_rgba(0,0,0,0.98)]">
        <WorldMap
          lineColor="#a1a1aa"
          dots={[
            {
              start: { lat: 64.2008, lng: -149.4937 },
              end: { lat: 34.0522, lng: -118.2437 },
            },
            {
              start: { lat: 64.2008, lng: -149.4937 },
              end: { lat: -15.7975, lng: -47.8919 },
            },
            {
              start: { lat: -15.7975, lng: -47.8919 },
              end: { lat: 38.7223, lng: -9.1393 },
            },
            {
              start: { lat: 51.5074, lng: -0.1278 },
              end: { lat: 28.6139, lng: 77.209 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: 43.1332, lng: 131.9113 },
            },
            {
              start: { lat: 28.6139, lng: 77.209 },
              end: { lat: -1.2921, lng: 36.8219 },
            },
          ]}
        />
      </div>
    </div>
  );
}
