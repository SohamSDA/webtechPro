export const ChatBox = () => {
    return (
        <div className="w-80 border-l border-[#1E90FF]/30 bg-[#1A1A1A] p-4 flex flex-col shadow-lg">
            <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent tracking-wide">
                💬 ChatBox
            </h2>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-[#0D0D0D] rounded-xl mt-2 p-4 border border-[#1E90FF]/20">
                <p className="text-[#FFFFFF]/40 text-sm">No messages yet...</p>
            </div>

            {/* Chat Input */}
            <div className="mt-4 flex gap-2">
                <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#0D0D0D] border border-[#1E90FF]/50 text-[#FFFFFF] placeholder-[#FFFFFF]/40 focus:outline-none focus:ring-2 focus:ring-[#00FF85] focus:border-[#00FF85] transition-all duration-300"
                    placeholder="Type a message..."
                />
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00FF85] to-[#1E90FF] text-[#0D0D0D] font-bold hover:from-[#00FF85]/90 hover:to-[#1E90FF]/90 hover:shadow-lg hover:shadow-[#00FF85]/25 transform hover:-translate-y-0.5 transition-all duration-300">
                    Send
                </button>
            </div>
        </div>
    );
}