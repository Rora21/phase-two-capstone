"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const editor = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title || !content) {
      alert("Title & content required!");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        status,
        imageUrl: imageUrl || "",
        author: auth.currentUser?.email || "Unknown",
        createdAt: serverTimestamp(),
        likes: [], // initialize likes array
      });

      // reset
      setTitle("");
      setContent("");
      setImageUrl("");

      if (status === "published") {
        router.push("/");
      } else {
        router.push("/drafts");
      }
    } catch (err) {
      console.error("Publish error:", err);
      alert("Could not save post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-[#3E6B4B] mb-6">Write your story</h2>

      <input
        className="w-full p-3 border rounded mb-4"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Image URL (preferred) */}
      <input
        type="url"
        className="w-full p-3 border rounded mb-4"
        placeholder="Cover image URL (paste a .jpg/.png link here)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />

      {/* Editor */}
      <JoditEditor ref={editor} value={content} onChange={setContent} />

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            setStatus("draft");
            handleSave();
          }}
          className="px-6 py-3 bg-gray-300 rounded hover:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>

        <button
          onClick={() => {
            setStatus("published");
            handleSave();
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
