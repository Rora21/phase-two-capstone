"use client";

import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-5xl font-extrabold leading-tight text-[#1A3D2F]">
          Ideas & Stories <br />
          from Aurie’s Community
        </h1>
        <p className="text-xl text-[#3D5A48] mt-3">
          Explore powerful articles written by the community.
        </p>
      </header>

      {/* Feed in rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.length === 0 ? (
          <p className="text-gray-500 col-span-2">No articles yet.</p>
        ) : (
          posts.map((post) => (
          <Link
  key={post.id}
  href={`/post/${post.id}`}
  className="flex flex-col h-full bg-white rounded-xl p-4 border border-[#E0D8CC] hover:shadow-md transition"
>
  {post.imageUrl ? (
    <div className="h-48 mb-3 overflow-hidden rounded">
      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="h-48 mb-3 bg-[#E0D8CC] rounded flex items-center justify-center text-[#5E7B6F]">
      No Image
    </div>
  )}

  <h2 className="text-xl font-semibold text-[#2D5038] line-clamp-2">{post.title}</h2>
  <p className="text-[#5E7B6F] mt-2 line-clamp-3">
    {post.content.replace(/<[^>]+>/g, "").slice(0, 120)}...
  </p>
</Link>

          ))
        )}
      </div>
    </div>
  );
}
