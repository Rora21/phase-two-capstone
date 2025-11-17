"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Signup successful!");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#F3EFE4] px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">

        <h2 className="text-2xl font-bold text-[#3E6B4B] text-center mb-6">
          Create your account
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#3E6B4B] focus:border-[#3E6B4B]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-[#3E6B4B] focus:border-[#3E6B4B]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#3E6B4B] text-white py-2 rounded-lg font-medium hover:bg-[#355B40] transition"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

        </form>

        <p className="text-center text-sm text-gray-700 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#3E6B4B] font-medium hover:underline">
            Log in
          </Link>
        </p>

      </div>
    </section>
  );
}
