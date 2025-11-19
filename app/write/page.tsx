"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "../../types";
import { useAuth } from "../hooks/useAuth";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const editor = useRef<any>(null);
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (editId && user) {
      setIsEditing(true);
      loadPost(editId);
    }
  }, [editId, user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-pulse text-[#5E7B6F] text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A3D2F] mb-4">Authentication Required</h1>
          <p className="text-[#5E7B6F] mb-6">You need to be logged in to write a blog post.</p>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-[#3E6B4B] text-white rounded-lg hover:bg-[#2D5038] transition"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/signup')}
              className="px-6 py-3 border border-[#3E6B4B] text-[#3E6B4B] rounded-lg hover:bg-[#E0D8CC] transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  const loadPost = async (postId: string) => {
    try {
      const postDoc = await getDoc(doc(db, "posts", postId));
      if (postDoc.exists()) {
        const postData = postDoc.data() as Post;
        setTitle(postData.title);
        setContent(postData.content);
        setCategory(postData.category || "");
      }
    } catch (error) {
      console.error("Error loading post:", error);
      alert("Could not load post for editing.");
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please login to save posts.");
      router.push('/login');
      return;
    }

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
        category: category || "general",
        author: user.email || "Unknown",
        authorId: user.uid || "",
        updatedAt: serverTimestamp(),
      };

      if (isEditing && editId) {
        await updateDoc(doc(db, "posts", editId), postData);
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          createdAt: serverTimestamp(),
          likes: [],
        });
      }

      // reset
      setTitle("");
      setContent("");
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

      <select
        className="w-full p-3 border rounded mb-4 focus:ring-2 focus:ring-[#3E6B4B] focus:border-transparent"
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
        <option value="general">General</option>
      </select>

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
