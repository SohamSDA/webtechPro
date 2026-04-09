import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const Navbar = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  };

  const navClassName = isHomePage
    ? "fixed top-0 left-0 z-50 w-full border-b border-zinc-800/80 bg-black/70 px-5 py-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.85)] backdrop-blur-xl md:px-7"
    : "fixed top-0 left-0 z-50 w-full border-b border-zinc-900 bg-black/95 px-5 py-4 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.98)] backdrop-blur-xl md:px-7";

  const navLinkClassName = (path) => {
    const isActive = location.pathname === path;
    return `rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "border border-zinc-700 bg-zinc-900/90 text-white"
        : "text-zinc-300 hover:bg-zinc-900/70 hover:text-white"
    }`;
  };

  return (
    <nav className={`${navClassName} relative`}>
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-baseline gap-2 whitespace-nowrap text-lg font-semibold tracking-tight md:text-xl"
        >
          <span className="text-white">CoCode</span>
          <span className="hidden text-zinc-500 lg:inline">
            Collaborative Code Editor
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/" className={navLinkClassName("/")}>
            Home
          </Link>
          {token && (
            <Link to="/joinroom" className={navLinkClassName("/joinroom")}>
              Join Room
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {!token ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors duration-200 hover:bg-zinc-900/70 hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={
                  isHomePage
                    ? "rounded-lg border border-zinc-500 bg-zinc-100/90 px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-white"
                    : "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
                }
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              <span className="hidden text-sm font-medium text-zinc-500 sm:block">
                Welcome back
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-200 transition-colors duration-200 hover:bg-zinc-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {token && !isHomePage && (
          <div className="absolute left-0 right-0 -bottom-11 flex justify-center px-5 md:hidden">
            <Link
              to="/joinroom"
              className="w-full max-w-xs rounded-xl border border-zinc-700 bg-black/95 py-2 text-center text-sm font-medium text-zinc-200 shadow-lg"
            >
              Go to Rooms
            </Link>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
      </div>
    </nav>
  );
};

export default Navbar;
