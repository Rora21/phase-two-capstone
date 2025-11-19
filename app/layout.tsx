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
      <body className="bg-[#F5F1E8] text-[#1A3D2F]">
        
        {/* NAVBAR */}
        <header className="border-b border-[#D6CBBE] bg-[#F5F1E8] sticky top-0 z-50">
          <nav className="flex items-center justify-between px-10 py-4">
            <Link href="/" className="text-2xl font-bold text-[#1A3D2F]">
              Aurie Medium
            </Link>

            <div className="flex gap-6 text-[#1A3D2F] items-center">

              <Link href="/" className="hover:underline">Home</Link>
              {user && <Link href="/write" className="hover:underline">Write</Link>}
              {user && <Link href="/draft" className="hover:underline">Drafts</Link>}

              {/* IF USER LOGGED IN → SHOW NAME + LOGOUT */}
              {user ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href={`/profile/${user.email?.split("@")[0]}`}
                    className="font-semibold hover:underline"
                  >
                    {user.email?.split("@")[0]}
                  </Link>

                  <button
                    onClick={() => signOut(auth)}
                    className="px-3 py-1 bg-[#1A3D2F] text-[#F5F1E8] rounded hover:bg-[#254735]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="hover:underline">Login</Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 bg-[#3E6B4B] text-white rounded-lg hover:bg-[#2D5038] transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </header>

        {/* PAGE CONTENT */}
        <main className="px-10 py-10">{children}</main>

        {/* FOOTER */}
        <footer className="mt-20 bg-[#1A3D2F] text-[#F5F1E8] py-10 text-center">
          <p>Aurie Medium © {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
