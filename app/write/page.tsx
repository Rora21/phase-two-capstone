"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "../../types";
import { UseAuth } from "../hooks/useAuth";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const editor = useRef<any>(null);
  const { user, loading: authLoading } = UseAuth();

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit story" : "Write a story"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setStatus("draft");
                handleSave();
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              disabled={loading}
            >
              {loading && status === "draft" ? "Saving..." : "Save draft"}
            </button>
            <button
              onClick={() => {
                setStatus("published");
                handleSave();
              }}
              className="px-6 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading && status === "published" ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-6">
          <input
            className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Choose a topic</option>
            <option value="technology">Technology</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="business">Business</option>
            <option value="health">Health</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="general">General</option>
          </select>

          <div className="min-h-96">
            <JoditEditor 
              ref={editor} 
              value={content} 
              onChange={setContent}
              config={{
                readonly: false,
                placeholder: 'Tell your story...',
                minHeight: 400,
                showCharsCounter: false,
                showWordsCounter: false,
                showXPathInStatusbar: false,
                toolbarAdaptive: false,
                buttons: [
                  'bold', 'italic', 'underline', '|',
                  'ul', 'ol', '|',
                  'link', 'image', '|',
                  'align', '|',
                  'undo', 'redo'
                ]
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
