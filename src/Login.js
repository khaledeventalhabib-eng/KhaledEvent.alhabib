import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  "https://zebpzfrsmwgiswoaxxel.supabase.co",
  "sb_publishable_Z0AltV4dRng56zuK4aZMfA_KrcsF9Ie"
);
import { Heart, Lock } from "lucide-react";

const RED = "#A3201E";
const RED_DEEP = "#711512";
const BEIGE = "#F4ECDD";
const BEIGE_DEEP = "#E9DBC1";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setError("Incorrect email or password.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: BEIGE }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
            style={{ backgroundColor: RED_DEEP }}
          >
            <Heart className="text-white w-7 h-7" fill="currentColor" />
          </div>
          <h1 className="text-lg font-bold text-center" style={{ color: RED_DEEP }}>
            Dr. Sulaiman Al Habib Medical Group
          </h1>
          <p className="text-xs text-slate-400 mt-1">KPI Dashboard — Organizer Sign-In</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: BEIGE_DEEP }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: BEIGE_DEEP }}
          />
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-white"
            style={{ backgroundColor: loading ? BEIGE_DEEP : RED }}
          >
            <Lock className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
