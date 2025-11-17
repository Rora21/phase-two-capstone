"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { db, storage } from "../lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Load editor on client only (fixes Next.js SSR issues)
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  // Image upload handler
  const uploadImage = async (file) => {
    const storageRef = ref(storage, `postImages/${file.name}-${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  // Save post
  const handlePublish = async () => {
    if (!title.trim()) {
      alert("Please add a title");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        createdAt: serverTimestamp(),
        status: "published",
      });

      alert("Post Published!");
      setTitle("");
      setContent("");
    } catch (error) {
      alert("Error publishing post");
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-green-700 mb-6">Write a New Article</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Article title"
        className="w-full p-3 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Rich Text Editor */}
      <JoditEditor
        value={content}
        onChange={(newContent) => setContent(newContent)}
        config={{
          uploader: {
            insertImageAsBase64URI: false,
            upload: async (files) => {
              const url = await uploadImage(files[0]);
              return {
                files: [url],
                path: url,
                baseurl: url,
              };
            },
          },
          height: 400,
          toolbarSticky: false,
        }}
      />

      {/* Publish Button */}
      <button
        onClick={handlePublish}
        disabled={loading}
        className="mt-6 mb-10 w-full p-3 bg-green-700 text-white rounded-lg"
      >
        {loading ? "Publishing..." : "Publish Article"}
      </button>
    </div>
  );
}
