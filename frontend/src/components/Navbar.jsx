import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/')
  }

  return (
    <nav className="w-full bg-[#1A1A1A]/95 backdrop-blur-md shadow-lg px-6 py-4 flex items-center justify-between border-b border-[#1E90FF]/30 fixed top-0 left-0 z-50">
      {/* Left Section - Brand Logo */}
      <div className="flex items-center">
        <Link 
          to="/" 
          className="font-bold text-xl bg-gradient-to-r from-[#00FF85] to-[#1E90FF] bg-clip-text text-transparent hover:from-[#00FF85]/80 hover:to-[#1E90FF]/80 transition-all duration-300 whitespace-nowrap"
        >
          <strong className='text-2xl'>CoCode:</strong> Collaborative Code Editor
        </Link>
      </div>

      {/* Center Section - Navigation Links */}
      <div className="flex items-center gap-8">
        {/* Home link - accessible to all users */}
        <Link 
          to="/" 
          className="text-lg text-[#FFFFFF]/70 hover:text-[#00FF85] transition-all duration-200 font-medium tracking-wide hover:scale-105"
        >
          Home
        </Link>
        
        {/* Protected routes - only show when logged in */}
        {token && (
          <>

            <Link 
              to="/joinroom" 
              className="text-lg text-[#FFFFFF]/70 hover:text-[#00FF85] transition-all duration-200 font-medium tracking-wide hover:scale-105"
            >
              Join Room
            </Link>
          </>
        )}
      </div>

      {/* Right Section - Auth Buttons */}
      <div className="flex items-center gap-4">
        {!token ? (
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm text-[#00FF85] hover:text-[#00FF85]/80 font-medium transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-[#00FF85]/10"
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="text-sm bg-gradient-to-r from-[#00FF85] to-[#1E90FF] text-[#0D0D0D] px-6 py-2.5 rounded-lg font-bold hover:from-[#00FF85]/90 hover:to-[#1E90FF]/90 hover:shadow-lg hover:shadow-[#00FF85]/25 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#FFFFFF]/60 font-medium">
              Welcome!
            </span>
            <button 
              onClick={handleLogout} 
              className="text-sm bg-gradient-to-r from-[#FF0099] to-red-500 text-[#FFFFFF] px-6 py-2.5 rounded-lg font-bold hover:from-[#FF0099]/90 hover:to-red-500/90 hover:shadow-lg hover:shadow-[#FF0099]/25 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar