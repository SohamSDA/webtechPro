import Editor from "@monaco-editor/react";
import { Sparkles } from "lucide-react";
import { toast } from "react-toastify";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const Code = ({ code, setCode, language, setLanguage, filename }) => {
  const handleGeminiSuggestion = async () => {
    if (!GEMINI_API_KEY) {
      toast.error(
        "Gemini key is missing. Set VITE_GEMINI_API_KEY in frontend env.",
      );
      return;
    }

    const prompt = `Only return JavaScript code. Do not include explanations. Complete this code:\n\n${code}\n`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        },
      );

      const data = await res.json();
      const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const cleaned = suggestion
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/```/g, "")
        .trim();

      if (cleaned) {
        setCode(cleaned);
      }
    } catch (err) {
      console.error("Gemini suggestion error:", err);
      toast.error("Failed to fetch AI suggestion");
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-900 bg-zinc-950/95 p-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.98)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Language
          </label>
          <select
            className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200 transition-all duration-200 focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-600/20"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <button
          onClick={handleGeminiSuggestion}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-black px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors duration-200 hover:bg-zinc-900"
        >
          <Sparkles className="h-4 w-4" />
          AI Suggestion
        </button>
      </div>

      {filename && (
        <p className="mb-3 text-sm text-zinc-400">
          Editing: <span className="font-medium text-zinc-200">{filename}</span>
        </p>
      )}

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-900 bg-black">
        <Editor
          height="100%"
          theme="hc-black"
          language={language}
          value={code}
          onChange={setCode}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            suggestOnTriggerCharacters: true,
            quickSuggestions: { other: true, comments: false, strings: true },
            wordBasedSuggestions: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
};
