"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("status", "==", "draft"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrafts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold mb-6 text-[#3E6B4B]">
        Your Drafts
      </h2>

      {drafts.length === 0 ? (
        <p className="text-gray-500">No drafts yet.</p>
      ) : (
        drafts.map((post) => (
          <Link key={post.id} href={`/edit/${post.id}`}>
            <div className="p-4 border rounded mb-4 hover:bg-[#F3F2E7] cursor-pointer">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-gray-500">
                Click to continue writing
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
