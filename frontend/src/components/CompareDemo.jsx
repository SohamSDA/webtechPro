import React from "react";
import { Compare } from "@/components/ui/compare";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export function CompareDemo() {
  const navigate = useNavigate();
  
  return (
    <div className="p-8 bg-[#0D0D0D] border-t border-[#1E90FF]/30 px-8 flex gap-8 items-center relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#00FF85] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#1E90FF] rounded-full blur-3xl"></div>
      </div>

      <Compare
        firstImage="https://assets.aceternity.com/code-problem.png"
        secondImage="https://assets.aceternity.com/code-solution.png"
        firstImageClassName="object-cover object-left-top"
        secondImageClassName="object-cover object-left-top"
        className="ml-10 my-7 h-[250px] w-[200px] md:h-[500px] md:w-[500px] rounded-xl border border-[#1E90FF]/30 shadow-lg relative z-10"
        slideMode="hover"
      />
      
      <div className="w-[60%] py-6 mr-10 flex flex-col items-end relative z-10">
        <h2 className="text-5xl text-right font-bold bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent mb-4">
          Debugging alone is character-building.
        </h2>
        
        <p className="text-3xl text-right text-[#FFFFFF]/80 py-4 font-light">
          Code with your crew instead.
        </p>
        
        <p className="text-base text-right text-[#FFFFFF]/60 py-6 leading-relaxed font-light">
          Tired of sending 200 screenshots just to explain one bug? Same.<br />
          Welcome to the future of coding—where you and your chaos crew <br />
          can hop into a room, write (or break) code together in real time,<br />
          and pretend you know what you're doing. Whether you're building <br />
          the next big thing or just fixing that one semicolon, our online compiler's <br />
          got you. No setup. No judgment. Just vibes, bugs, and instant <br />
          collab energy. Compile, cry, repeat—with friends.
        </p>
        
        <button 
          className="ml-auto mt-6 px-8 py-3 text-lg rounded-xl bg-gradient-to-r from-[#00FF85] to-[#1E90FF] text-[#0D0D0D] font-bold hover:from-[#00FF85]/90 hover:to-[#1E90FF]/90 hover:shadow-lg hover:shadow-[#00FF85]/25 transform hover:-translate-y-1 transition-all duration-300 tracking-wide"
          onClick={() => navigate('/joinroom')}
        >
          GET STARTED
        </button>
      </div>
    </div>
  );
}