"use client";

import { useEffect, useState } from "react";
import { db } from "./lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1A3D2F] to-[#2D5038] text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Stay curious.
            </h1>
            <p className="text-xl mb-8 text-[#E0D8CC]">
              Discover stories, thinking, and expertise from writers on any topic.
            </p>
            <Link
              href="/write"
              className="inline-block bg-white text-[#1A3D2F] px-8 py-3 rounded-full font-semibold hover:bg-[#E0D8CC] transition"
            >
              Start writing
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-[#5E7B6F] text-lg">Loading stories...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#5E7B6F] text-lg mb-4">No stories yet.</p>
                <Link
                  href="/write"
                  className="inline-block bg-[#3E6B4B] text-white px-6 py-3 rounded-full hover:bg-[#2D5038] transition"
                >
                  Write the first story
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post, index) => (
                  <article key={post.id} className="group">
                    <div className={`flex gap-6 ${index === 0 ? 'pb-8 border-b border-[#E0D8CC]' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {post.author?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <Link 
                            href={`/profile/${post.author?.split('@')[0] || 'unknown'}`}
                            className="text-sm text-[#5E7B6F] hover:text-[#3E6B4B] transition"
                          >
                            {post.author?.split('@')[0] || 'Unknown'}
                          </Link>
                          <span className="text-[#5E7B6F]">·</span>
                          <span className="text-sm text-[#5E7B6F]">
                            {calculateReadTime(post.content)} min read
                          </span>
                        </div>
                          
                        <Link href={`/post/${post.id}`}>
                          <h2 className={`font-bold text-[#1A3D2F] group-hover:text-[#2D5038] transition mb-2 cursor-pointer ${
                            index === 0 ? 'text-2xl' : 'text-xl'
                          }`}>
                            {post.title}
                          </h2>
                        </Link>
                        
                        <Link href={`/post/${post.id}`}>
                          <p className="text-[#5E7B6F] mb-4 line-clamp-2 cursor-pointer">
                            {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                          </p>
                        </Link>
                          
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-[#5E7B6F]">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {post.imageUrl && (
                        <Link href={`/post/${post.id}`}>
                          <div className={`flex-shrink-0 overflow-hidden rounded cursor-pointer ${
                            index === 0 ? 'w-32 h-32' : 'w-24 h-24'
                          }`}>
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={index === 0 ? 128 : 96}
                              height={index === 0 ? 128 : 96}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg p-6 border border-[#E0D8CC] mb-6">
                <h3 className="font-bold text-[#1A3D2F] mb-4">Recommended topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'Lifestyle', 'Business', 'Health', 'Travel', 'Food'].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-[#E0D8CC] text-[#3E6B4B] rounded-full text-sm hover:bg-[#D6CBBE] cursor-pointer transition"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-[#E0D8CC]">
                <h3 className="font-bold text-[#1A3D2F] mb-4">Who to follow</h3>
                <div className="space-y-3">
                  {posts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {post.author?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="flex-1">
                        <Link 
                          href={`/profile/${post.author?.split('@')[0] || 'unknown'}`}
                          className="text-sm font-medium text-[#1A3D2F] hover:text-[#3E6B4B] transition"
                        >
                          {post.author?.split('@')[0] || 'Unknown'}
                        </Link>
                      </div>
                      <button className="text-sm text-[#3E6B4B] hover:text-[#2D5038] font-medium">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}