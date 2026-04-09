export const ChatBox = () => {
  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900/90 p-4 flex flex-col shadow-[0_20px_45px_-35px_rgba(0,0,0,0.95)]">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-100">
        ChatBox
      </h2>

      {/* Messages Area */}
      <div className="mt-2 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm text-slate-500">No messages yet...</p>
      </div>

      {/* Chat Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
          placeholder="Type a message..."
        />
        <button className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition-all duration-200 hover:bg-zinc-200">
          Send
        </button>
      </div>
    </div>
  );
};
