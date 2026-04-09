import { CompareDemo } from "@/components/CompareDemo";
import { WorldMapDemo } from "@/components/WorldMapDemo";
import { Navbar } from "@/components/Navbar";

export const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-10 h-80 w-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 right-12 h-80 w-80 rounded-full bg-zinc-400/5 blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(39,39,42,0.45)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <Navbar />

      <div className="relative z-10 pt-20">
        <WorldMapDemo />
        <CompareDemo />
      </div>
    </div>
  );
};
