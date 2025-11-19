"use client";

import { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { arrayUnion, arrayRemove, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PostPage({ params }: { params: { id: string } }) {
  const { id } = params ?? ({} as any);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // auth listener
    const unsubAuth = (auth as any).onAuthStateChanged?.((u: any) => setUser(u));
    // post listener
    const pDoc = doc(db, "posts", id);
    const unsubPost = onSnapshot(pDoc, (d) => setPost(d.exists() ? { id: d.id, ...d.data() } : null));

    // comments listener
    const commentsQ = query(collection(db, "posts", id, "comments"), orderBy("createdAt", "asc"));
    const unsubComments = onSnapshot(commentsQ, (snap) =>
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubPost();
      unsubComments();
      if (unsubAuth) unsubAuth();
    };
  }, [id]);

  if (!post) return <div className="p-8">Loading post...</div>;

  const isLiked = user && Array.isArray(post.likes) && post.likes.includes(user.email);

  const toggleLike = async () => {
    if (!user) {
      alert("Please login to like posts.");
      return;
    }
    const pRef = doc(db, "posts", id);
    if (!isLiked) {
      await updateDoc(pRef, { likes: arrayUnion(user.email) });
    } else {
      await updateDoc(pRef, { likes: arrayRemove(user.email) });
    }
  };

  const submitComment = async () => {
    if (!user) {
      alert("Please login to comment.");
      return;
    }
    if (!newComment.trim()) return;
    setLoadingComment(true);
    await addDoc(collection(db, "posts", id, "comments"), {
      author: user.email,
      text: newComment,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
    setLoadingComment(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      )}

      <h1 className="text-3xl font-bold text-[#1A3D2F]">{post.title}</h1>
      <p className="text-sm text-[#3D5A48] mb-6">By {post.author || "Unknown"}</p>

      <article
        className="prose max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="flex items-center gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${isLiked ? "bg-[#2D5038] text-white" : "bg-gray-100"}`}
          onClick={toggleLike}
        >
          {isLiked ? "Unlike" : "Like"} ({Array.isArray(post.likes) ? post.likes.length : 0})
        </button>
      </div>

      <section>
        <h3 className="text-xl font-semibold mb-3">Comments</h3>

        {comments.length === 0 ? (
          <p className="text-gray-500 mb-4">No comments yet.</p>
        ) : (
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="p-3 border rounded">
                <p className="text-sm text-[#3D5A48]"><strong>{c.author}</strong></p>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border p-2 rounded"
          />
          <button onClick={submitComment} disabled={loadingComment} className="px-4 py-2 bg-[#3E6B4B] text-white rounded">
            {loadingComment ? "Sending..." : "Comment"}
          </button>
        </div>
      </section>
    </div>
  );
}
