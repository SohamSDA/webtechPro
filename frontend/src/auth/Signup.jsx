import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle2, Sparkles, UserPlus } from "lucide-react";
import { validateEmail } from "../../utils/helper.js";
import { Navbar } from "@/components/Navbar";
import { apiUrl } from "@/lib/api";

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Signup successful!");
        navigate("/");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error", err);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-black px-4 pb-10 pt-28 text-zinc-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-12 top-10 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-zinc-500/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(39,39,42,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(39,39,42,0.45)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-3xl border border-zinc-900 bg-zinc-950/90 p-7 shadow-[0_28px_80px_-45px_rgba(0,0,0,1)] md:p-9">
            <div className="mb-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-200 lg:hidden">
                <Sparkles className="h-3.5 w-3.5" />
                Build your collaboration profile
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100">
                Create account
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Join your workspace and start coding with your team.
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
                  USERNAME
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-[0.16em] text-zinc-400">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create password"
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold tracking-[0.16em] text-zinc-400">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all duration-200 focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-500/15"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-200"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </button>
            </form>

            <div className="my-6 h-px w-full bg-zinc-800"></div>

            <p className="text-center text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-white underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </section>

          <section className="hidden rounded-3xl border border-zinc-900 bg-zinc-950/85 p-10 shadow-[0_28px_80px_-45px_rgba(0,0,0,1)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold tracking-wide text-zinc-200">
                Professional Coding Space
              </p>
              <h3 className="mt-5 text-4xl font-semibold leading-tight text-zinc-100">
                Set up your account and streamline team delivery.
              </h3>
              <p className="mt-4 max-w-md text-zinc-400">
                Rooms, files, real-time chat and execution tools, all in one
                structured workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                <p className="text-sm font-semibold text-zinc-100">
                  Why teams pick CoCode
                </p>
                <div className="mt-3 space-y-3 text-sm text-zinc-400">
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-200" />
                    Room-based collaboration keeps every project organized.
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-200" />
                    Built-in chat and output panel reduce context switching.
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-zinc-200" />
                    Fast setup from signup to first room in under a minute.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-zinc-500">
              Clean interface, focused interactions, better collaboration.
            </p>
          </section>
        </div>
      </div>
    </>
  );
};
