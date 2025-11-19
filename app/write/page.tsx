"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "../../types";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const editor = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      loadPost(editId);
    }
  }, [editId]);

  const loadPost = async (postId: string) => {
    try {
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (postDoc.exists()) {
        const postData = postDoc.data() as Post;
        setTitle(postData.title);
        setContent(postData.content);
        setImageUrl(postData.imageUrl || "");
        setTags(postData.tags?.join(", ") || "");
        setCategory(postData.category || "");
      }
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Could not load post for editing.");
    }
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert("Title & content required!");
      return;
    }

    setLoading(true);

    try {
      const postData = {
        title,
        content,
        status,
        imageUrl: imageUrl || "",
        author: auth.currentUser?.email || "Unknown",
        authorId: auth.currentUser?.uid || "",
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        category: category || undefined,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && editId) {
        await updateDoc(doc(db, "posts", editId), postData);
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          likes: [],
          views: 0,
        });
      }

      // reset
      setTitle("");
      setContent("");
      setImageUrl("");
      setTags("");
      setCategory("");

      if (status === "published") {
        router.push("/");
      } else {
        router.push("/draft");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Could not save post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-[#3E6B4B] mb-6">
        {isEditing ? "Edit your story" : "Write your story"}
      </h2>

      <input
        className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
        placeholder="Post title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="url"
          className="w-full p-3 border rounded focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
          placeholder="Cover image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <select
          className="w-full p-3 border rounded focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="technology">Technology</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="business">Business</option>
          <option value="health">Health</option>
          <option value="travel">Travel</option>
          <option value="food">Food</option>
          <option value="other">Other</option>
        </select>
      </div>

      <input
        className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
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
