import { Compare } from "@/components/ui/compare";
import { useNavigate } from "react-router-dom";

export function CompareDemo() {
  const navigate = useNavigate();

  return (
    <div className="relative border-t border-zinc-900 bg-black px-6 py-12 md:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/4 top-1/2 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 h-72 w-72 rounded-full bg-zinc-400/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <Compare
          firstImage="https://assets.aceternity.com/code-problem.png"
          secondImage="https://assets.aceternity.com/code-solution.png"
          firstImageClassName="object-cover object-left-top"
          secondImageClassName="object-cover object-left-top"
          className="mx-auto h-[260px] w-[220px] rounded-2xl border border-zinc-800 shadow-[0_26px_70px_-45px_rgba(0,0,0,0.98)] sm:h-[420px] sm:w-[380px] lg:h-[500px] lg:w-[500px]"
          slideMode="hover"
        />

        <div className="flex w-full flex-col items-start py-2 text-left lg:items-end lg:text-right">
          <h2 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-100 md:text-5xl">
            Debugging alone is{" "}
            <span className="text-zinc-400">character-building.</span>
          </h2>

          <p className="py-3 text-2xl font-light text-zinc-200 md:text-3xl">
            Code with your crew instead.
          </p>

          <p className="max-w-2xl py-5 text-sm leading-relaxed text-zinc-400 md:text-base">
            Tired of sending 200 screenshots just to explain one bug? Open a
            shared room, code together in real time, and solve issues while you
            are in the same context. No setup drama, no back-and-forth chaos,
            just focused collaboration with your team.
          </p>

          <button
            className="mt-4 rounded-xl bg-white px-8 py-3 text-lg font-semibold tracking-wide text-black transition-all duration-200 hover:bg-zinc-200"
            onClick={() => navigate("/joinroom")}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
