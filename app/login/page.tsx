"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in successfully!");
      // Redirect to home page after successful login
    router.push("/");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F3EDE4] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/90 shadow-xl rounded-2xl p-8 border border-green-100">
        <h1 className="text-2xl font-semibold text-green-800 text-center mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm bg-red-100 p-2 rounded">{error}</p>
          )}

          <div>
            <label className="block text-green-900 font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-green-900 font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white p-3 rounded-xl mt-2 transition font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-green-900 mt-4">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-green-700 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
