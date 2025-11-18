"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // ⭐ using URL instead
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title || !content) {
      alert("Title & content required!");
      return;
    }

    setLoading(true);

    await addDoc(collection(db, "posts"), {
      title,
      content,
      status,
      imageUrl: imageUrl || "", // ⭐ saved as plain string
      author: auth.currentUser?.email || "Unknown",
      createdAt: serverTimestamp(),
    });

    setLoading(false);

    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-[#3E6B4B] mb-6">Write your story</h2>

      {/* Title */}
      <input
        className="w-full p-3 border rounded mb-4"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* ⭐ NEW: Image URL Input */}
      <input
        className="w-full p-3 border rounded mb-4"
        placeholder="Paste image URL here..."
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {/* Editor */}
      <JoditEditor value={content} onChange={setContent} />

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            setStatus("draft");
            handlePublish();
          }}
          className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>

        <button
          onClick={() => {
            setStatus("published");
            handlePublish();
          }}
          className="px-6 py-3 bg-[#3E6B4B] text-white rounded hover:bg-[#2D5038]"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  );
}
