"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    bio: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.displayName
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        displayName: formData.displayName,
        bio: formData.bio,
        joinedAt: serverTimestamp(),
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A3D2F] mb-2">Join Aurie Medium</h1>
          <p className="text-[#5E7B6F]">Create an account to start writing and reading amazing stories.</p>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-[#E0D8CC]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A3D2F] mb-2">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                className="w-full px-4 py-3 border border-[#E0D8CC] rounded-lg focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
                placeholder="Your name"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A3D2F] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-[#E0D8CC] rounded-lg focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A3D2F] mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 border border-[#E0D8CC] rounded-lg focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A3D2F] mb-2">
                Bio (Optional)
              </label>
              <textarea
                name="bio"
                rows={3}
                className="w-full px-4 py-3 border border-[#E0D8CC] rounded-lg focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent resize-none"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A3D2F] text-white py-3 rounded-lg font-medium hover:bg-[#2D5038] transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#5E7B6F]">
              Already have an account?{" "}
              <Link href="/login" className="text-[#3E6B4B] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
