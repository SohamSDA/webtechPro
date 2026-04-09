import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail } from "../../utils/helper.js";
import { toast } from "react-toastify";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (submitError) {
      console.error("Login error:", submitError);
      setError("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-black px-4 pb-10 pt-28 text-zinc-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-8 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-zinc-400/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(39,39,42,0.5)_1px,transparent_1px)] bg-[size:22px_22px]"></div>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden rounded-3xl border border-zinc-900 bg-zinc-950/85 p-10 shadow-[0_28px_80px_-45px_rgba(0,0,0,1)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-200">
                Secure Collaboration Workspace
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-zinc-100">
                Welcome back to your team coding cockpit.
              </h1>
              <p className="mt-4 max-w-md text-zinc-400">
                Access rooms, coordinate with collaborators, and ship faster
                with a cleaner workflow.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-zinc-200" />
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Protected Sessions
                  </p>
                  <p className="text-sm text-zinc-400">
                    Keep your rooms authenticated and activity tracked.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-black p-4">
                <Users className="mt-0.5 h-5 w-5 text-zinc-200" />
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    Team Presence
                  </p>
                  <p className="text-sm text-zinc-400">
                    See who is active and editing in real time.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-500">
              Trusted by student teams for clean, fast code collaboration.
            </p>
          </section>

          <section className="rounded-3xl border border-zinc-900 bg-zinc-950/90 p-7 shadow-[0_28px_80px_-45px_rgba(0,0,0,1)] md:p-9">
            <div className="mb-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 lg:hidden">
                <Sparkles className="h-3.5 w-3.5" />
                Collaborative coding, refined
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Continue to your rooms and ongoing sessions.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-[0.16em] text-zinc-400">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-[0.16em] text-zinc-400">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
              >
                Login <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-6 h-px w-full bg-zinc-800"></div>

            <p className="text-center text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-white underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
              >
                Create one
              </Link>
            </p>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Quick Tip
              </p>
              <p className="mt-2 text-sm text-zinc-400">
                Use your room dashboard to create dedicated files per feature
                for cleaner pair programming sessions.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
