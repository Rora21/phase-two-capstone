"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans">
        
        {/* NAVBAR */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-black">
                Medium
              </Link>
              
              <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
                <Link href="/" className="hover:text-black transition">Home</Link>
                {user && <Link href="/write" className="hover:text-black transition">Write</Link>}
                {user && <Link href="/draft" className="hover:text-black transition">Stories</Link>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/profile/${user.email?.split("@")[0]}`}
                    className="text-sm text-gray-600 hover:text-black transition"
                  >
                    {user.email?.split("@")[0]}
                  </Link>

                  <button
                    onClick={() => signOut(auth)}
                    className="text-sm text-gray-600 hover:text-black transition"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm text-gray-600 hover:text-black transition">
                    Sign in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-gray-200 bg-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Medium Clone</p>
          </div>
        </footer>
      </body>
    </html>
  );
}