import { CompareDemo } from "@/components/CompareDemo"
import { Button } from "@/components/ui/button"
import { WorldMapDemo } from "@/components/WorldMapDemo"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"

export const Home = () => {
    
    return (
        <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-[#00FF85] rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#1E90FF] rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-[#FF0099] rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <Navbar />
            
            <div className="pt-20 relative z-10">
                <WorldMapDemo/>
                <CompareDemo/> 
            </div>
        </div>
    )
}