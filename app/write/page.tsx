"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#1A3322]">
      {/* HERO SECTION */}
      <section className="px-8 py-16 border-b border-[#d8d2c3] bg-[#F0E7D8]">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-semibold leading-tight">
            Discover stories, thinking, and expertise —  
            <span className="text-[#3E6B4B] font-bold"> from creators like you.</span>
          </h1>

          <p className="mt-4 text-lg text-[#4b4b4b] max-w-xl">
            Explore fresh ideas, follow your favorite authors, and write your own articles with ease.
          </p>

          <Link
            href="/write"
            className="inline-block mt-6 px-6 py-3 bg-[#3E6B4B] text-white rounded-md shadow hover:bg-[#2c5236]"
          >
            Start writing
          </Link>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <section className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">

        {/* LEFT — FEED */}
        <div>
          {/* SEARCH BAR */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-[#c9c3b6] rounded-md bg-white outline-none focus:ring-2 focus:ring-[#3E6B4B]"
            />
          </div>

          {/* POSTS FEED — STATIC FOR NOW */}
          <div className="space-y-8">
            {[1, 2, 3].map((post) => (
              <div
                key={post}
                className="bg-white border border-[#e0d9c9] p-5 rounded-md shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-2xl font-semibold text-[#1A3322]">
                  Sample Article Title {post}
                </h2>

                <p className="text-[#4b4b4b] mt-2">
                  This is a short preview of the article. Once we connect Firebase,
                  these will load dynamically…
                </p>

                <Link
                  href={`/post/${post}`}
                  className="inline-block mt-3 text-[#3E6B4B] font-medium hover:underline"
                >
                  Read more →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — SIDEBAR */}
        <aside className="space-y-8">
          {/* TAGS */}
          <div className="p-5 bg-white rounded-md border border-[#e0d9c9] shadow">
            <h3 className="text-xl font-semibold mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["Tech", "Life", "Design", "Business", "Coding", "Self-Growth"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[#F0E7D8] text-[#3E6B4B] rounded-full text-sm cursor-pointer hover:bg-[#e9dfcc]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* SIDEBAR BOX */}
          <div className="p-5 bg-white rounded-md border border-[#e0d9c9] shadow">
            <h3 className="text-xl font-semibold">Why write on Our Medium?</h3>
            <p className="text-[#4b4b4b] mt-2">
              Share your knowledge, grow your audience, and build your writing portfolio.
            </p>
            <Link
              href="/write"
              className="inline-block mt-3 text-[#3E6B4B] font-medium hover:underline"
            >
              Start writing →
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
