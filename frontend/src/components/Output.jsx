import { useState } from "react";

export const OutputConsole = ({ code, language }) => {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      setOutput(data.output);
    } catch {
      setOutput("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/85 via-zinc-900/70 to-zinc-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.94)] backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-zinc-100 md:text-lg">
          Output Console
        </h2>
        <button
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
            loading
              ? "cursor-not-allowed border border-zinc-700 bg-zinc-900 text-zinc-500"
              : "bg-white text-black hover:bg-zinc-200"
          }`}
          onClick={runCode}
          disabled={loading}
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>

      <div className="mt-4 h-[145px] overflow-y-auto rounded-xl border border-zinc-800/80 bg-zinc-900/85 p-3 font-mono text-sm text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:h-[160px]">
        {output ? (
          <pre className="whitespace-pre-wrap break-words">{output}</pre>
        ) : (
          <p className="text-zinc-500">
            No output yet. Run your code to see results.
          </p>
        )}
      </div>
    </div>
  );
};
