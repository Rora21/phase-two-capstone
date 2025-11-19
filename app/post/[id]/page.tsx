"use client";

import { useEffect, useState, use } from "react";
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
import Link from "next/link";
import Image from "next/image";

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!db || !auth) {
      console.warn('Firebase not initialized');
      return;
    }

    const unsubAuth = (auth as any).onAuthStateChanged?.((u: any) => setUser(u));
    const pDoc = doc(db, "posts", id);
    const unsubPost = onSnapshot(pDoc, (d) => setPost(d.exists() ? { id: d.id, ...d.data() } : null));

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

  if (!post) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-500">Loading story...</div>
    </div>
  );

  const isLiked = user && Array.isArray(post.likes) && post.likes.includes(user.email);

  const toggleLike = async () => {
    if (!user || !db) {
      alert("Please sign in to like stories.");
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
    if (!user || !db) {
      alert("Please sign in to comment.");
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

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-medium">
              {post.author?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <Link 
                href={`/profile/${post.author?.split('@')[0] || 'unknown'}`}
                className="text-gray-900 font-medium hover:text-black transition"
              >
                {post.author?.split('@')[0] || 'Unknown'}
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{calculateReadTime(post.content)} min read</span>
                <span>·</span>
                <span>{post.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-6 py-4 border-y border-gray-200">
            <button
              onClick={toggleLike}
              className={`flex items-center gap-2 text-sm transition ${
                isLiked ? "text-red-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {post.likes?.length || 0}
            </button>
            
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.126-.275l-3.5 3.5A1 1 0 016 22V18.5c-2.485-1.485-4-4.142-4-7 0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              {comments.length}
            </button>
          </div>
        </header>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-12">
            <Image
              src={post.imageUrl}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-auto rounded"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-12 text-gray-900 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Category */}
        {post.category && (
          <div className="mb-12">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {post.category}
            </span>
          </div>
        )}
      </article>

      {/* Comments Section */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Responses ({comments.length})
          </h3>

          {/* Comment Form */}
          {user ? (
            <div className="mb-12">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button 
                      onClick={submitComment} 
                      disabled={loadingComment || !newComment.trim()}
                      className="px-6 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingComment ? "Publishing..." : "Respond"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-12 p-6 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Sign in to join the conversation.</p>
              <Link 
                href="/login"
                className="inline-block px-6 py-2 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No responses yet. Be the first to respond.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {comment.author?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author?.split('@')[0] || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {comment.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}