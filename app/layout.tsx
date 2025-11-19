"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { auth } = await import("./lib/firebase");
        const { onAuthStateChanged } = await import("firebase/auth");
        
        if (auth) {
          const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
          });
          return unsubscribe;
        }
      } catch (error) {
        console.warn('Firebase auth not available:', error);
      }
    };

    let unsubscribe: (() => void) | undefined;
    initAuth().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Aurie - Where Stories Come to Life</title>
        <meta name="description" content="Discover and share compelling stories, ideas, and insights on Aurie. A modern publishing platform for writers and readers." />
        <meta name="keywords" content="writing, blogging, stories, articles, publishing, medium, aurie" />
        <meta name="author" content="Aurie" />
        <meta property="og:title" content="Aurie - Where Stories Come to Life" />
        <meta property="og:description" content="Discover and share compelling stories, ideas, and insights on Aurie." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aurie - Where Stories Come to Life" />
        <meta name="twitter:description" content="Discover and share compelling stories, ideas, and insights on Aurie." />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-white text-gray-900 font-sans">
        
        {/* NAVBAR */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-black">
                Aurie
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
                    onClick={async () => {
                      try {
                        const { auth } = await import("./lib/firebase");
                        const { signOut } = await import("firebase/auth");
                        if (auth) await signOut(auth);
                      } catch (error) {
                        console.error('Sign out failed:', error);
                      }
                    }}
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
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} Aurie. Where stories come to life.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}