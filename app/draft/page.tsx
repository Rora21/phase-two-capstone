"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";
import { Post } from "../../types";
import { useAuth } from "../hooks/useAuth";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("status", "==", "draft"),
      where("author", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrafts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteDraft = async (id: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-[#5E7B6F]">Please log in to view your drafts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A3D2F]">Your Drafts</h1>
        <Link
          href="/write"
          className="px-4 py-2 bg-[#3E6B4B] text-white rounded-lg hover:bg-[#2D5038] transition"
        >
          New Post
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-pulse text-[#5E7B6F]">Loading drafts...</div>
        </div>
      ) : drafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#5E7B6F] mb-4">No drafts yet.</p>
          <Link
            href="/write"
            className="inline-block px-6 py-3 bg-[#3E6B4B] text-white rounded-lg hover:bg-[#2D5038] transition"
          >
            Write Your First Post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-lg border border-[#E0D8CC] p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#2D5038] mb-2">
                    {draft.title || "Untitled Draft"}
                  </h3>
                  <p className="text-[#5E7B6F] mb-3 line-clamp-2">
                    {draft.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                  </p>
                  <p className="text-sm text-[#5E7B6F]">
                    Last edited: {draft.createdAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    href={`/write?edit=${draft.id}`}
                    className="px-3 py-1 text-sm bg-[#3E6B4B] text-white rounded hover:bg-[#2D5038] transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
