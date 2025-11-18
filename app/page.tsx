"use client";

import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

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
    <div className="max-w-3xl mx-auto py-12">

      <h1 className="text-5xl font-extrabold mb-8 text-[#1A3D2F]">
        Latest Stories
      </h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No articles yet.</p>
      ) : (
        posts.map((post) => (
          <Link key={post.id} href={`/post/${post.id}`}>
            <div className="p-6 bg-white shadow rounded-xl mb-6 border border-[#E0D8CC] cursor-pointer hover:bg-[#FAF8F3]">
              <h2 className="text-2xl font-bold text-[#2D5038]">{post.title}</h2>
              <p className="text-[#5E7B6F] mt-2 line-clamp-2">
                {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
