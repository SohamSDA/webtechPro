import Editor from "@monaco-editor/react";

export const Code = ({ code, setCode, language, setLanguage, filename }) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800/70 bg-gradient-to-b from-zinc-900/85 via-zinc-900/70 to-zinc-950/80 p-4 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.95)] backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300">
            Language
          </label>
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100 transition-all duration-200 focus:border-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-500/20"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        <span className="rounded-full border border-zinc-700/80 bg-zinc-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-300">
          Collaborative session
        </span>
      </div>

      {filename && (
        <p className="mb-3 text-sm text-zinc-400">
          Editing: <span className="font-medium text-zinc-200">{filename}</span>
        </p>
      )}

      <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
        <Editor
          height="100%"
          theme="vs-dark"
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
