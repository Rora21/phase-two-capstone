"use client";

import { useEffect, useState } from "react";
import { db, auth } from "./lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../types";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [followingList, setFollowingList] = useState<string[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsData);
      setFilteredPosts(postsData);
      setLoading(false);
    });

    // Listen to current user
    const unsubAuth = (auth as any).onAuthStateChanged?.((user: any) => {
      setCurrentUser(user);
      if (user) {
        loadFollowingList(user.uid);
      }
    });

    return () => {
      unsubscribe();
      unsubAuth?.();
    };
  }, []);

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === "") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(post => post.category === category));
    }
  };

  const loadFollowingList = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setFollowingList(userDoc.data().following || []);
      }
    } catch (error) {
      console.error("Error loading following list:", error);
    }
  };

  const toggleFollowFromHome = async (authorEmail: string) => {
    if (!currentUser) return;
    
    try {
      // Find the author's user document
      const authorQuery = query(collection(db, "users"), where("email", "==", authorEmail));
      const authorSnapshot = await getDocs(authorQuery);
      
      if (!authorSnapshot.empty) {
        const authorDoc = authorSnapshot.docs[0];
        const authorId = authorDoc.id;
        
        const currentUserRef = doc(db, "users", currentUser.uid);
        const authorRef = doc(db, "users", authorId);
        
        const isCurrentlyFollowing = followingList.includes(authorId);
        
        if (isCurrentlyFollowing) {
          await updateDoc(currentUserRef, {
            following: arrayRemove(authorId)
          });
          await updateDoc(authorRef, {
            followers: arrayRemove(currentUser.uid)
          });
          setFollowingList(prev => prev.filter(id => id !== authorId));
        } else {
          await updateDoc(currentUserRef, {
            following: arrayUnion(authorId)
          });
          await updateDoc(authorRef, {
            followers: arrayUnion(currentUser.uid)
          });
          setFollowingList(prev => [...prev, authorId]);
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
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
                {filteredPosts.map((post, index) => (
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
                        
                        {post.category && (
                          <span className="inline-block px-2 py-1 bg-[#E0D8CC] text-[#3E6B4B] text-xs rounded-full mb-2 capitalize">
                            {post.category}
                          </span>
                        )}
                          
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
                <h3 className="font-bold text-[#1A3D2F] mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => filterByCategory("")}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedCategory === "" 
                        ? "bg-[#3E6B4B] text-white" 
                        : "bg-[#E0D8CC] text-[#3E6B4B] hover:bg-[#D6CBBE]"
                    }`}
                  >
                    All
                  </button>
                  {['technology', 'lifestyle', 'business', 'health', 'travel', 'food', 'general'].map((category) => (
                    <button
                      key={category}
                      onClick={() => filterByCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm transition capitalize ${
                        selectedCategory === category 
                          ? "bg-[#3E6B4B] text-white" 
                          : "bg-[#E0D8CC] text-[#3E6B4B] hover:bg-[#D6CBBE]"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {currentUser && (
                <div className="bg-white rounded-lg p-6 border border-[#E0D8CC]">
                  <h3 className="font-bold text-[#1A3D2F] mb-4">Who to follow</h3>
                  <div className="space-y-3">
                    {posts
                      .filter(post => post.author !== currentUser.email)
                      .slice(0, 3)
                      .map((post) => {
                        const authorUsername = post.author?.split('@')[0] || 'unknown';
                        return (
                          <div key={post.id} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {post.author?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/profile/${authorUsername}`}
                                className="text-sm font-medium text-[#1A3D2F] hover:text-[#3E6B4B] transition"
                              >
                                {authorUsername}
                              </Link>
                            </div>
                            <button 
                              onClick={() => toggleFollowFromHome(post.author)}
                              className="text-sm text-[#3E6B4B] hover:text-[#2D5038] font-medium"
                            >
                              Follow
                            </button>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}