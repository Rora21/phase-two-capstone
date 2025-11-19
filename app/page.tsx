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
  setDoc,
  serverTimestamp,
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
  const [followingEmails, setFollowingEmails] = useState<string[]>([]);

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
        const following = userDoc.data().following || [];
        setFollowingList(following);
        
        if (following.length > 0) {
          const followingUsersData = await Promise.all(
            following.map(async (followingId: string) => {
              const followingUserDoc = await getDoc(doc(db, "users", followingId));
              return followingUserDoc.exists() ? followingUserDoc.data().email : null;
            })
          );
          setFollowingEmails(followingUsersData.filter(Boolean));
        } else {
          setFollowingEmails([]);
        }
      }
    } catch (error) {
      console.error("Error loading following list:", error);
    }
  };

  const toggleFollowFromHome = async (authorEmail: string) => {
    if (!currentUser || !authorEmail) {
      alert("Please login to follow users.");
      return;
    }
    
    try {
      const usersRef = collection(db, "users");
      const authorQuery = query(usersRef, where("email", "==", authorEmail));
      const authorSnapshot = await getDocs(authorQuery);
      
      if (!authorSnapshot.empty) {
        const authorDoc = authorSnapshot.docs[0];
        const authorId = authorDoc.id;
        
        const currentUserRef = doc(db, "users", currentUser.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        
        if (!currentUserDoc.exists()) {
          await setDoc(currentUserRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0],
            followers: [],
            following: [],
            joinedAt: serverTimestamp()
          });
        }
        
        const currentFollowing = currentUserDoc.exists() ? (currentUserDoc.data().following || []) : [];
        const authorRef = doc(db, "users", authorId);
        const isCurrentlyFollowing = currentFollowing.includes(authorId);
        
        if (isCurrentlyFollowing) {
          await updateDoc(currentUserRef, {
            following: arrayRemove(authorId)
          });
          await updateDoc(authorRef, {
            followers: arrayRemove(currentUser.uid)
          });
          setFollowingList(prev => prev.filter(id => id !== authorId));
          setFollowingEmails(prev => prev.filter(email => email !== authorEmail));
        } else {
          await updateDoc(currentUserRef, {
            following: arrayUnion(authorId)
          });
          await updateDoc(authorRef, {
            followers: arrayUnion(currentUser.uid)
          });
          setFollowingList(prev => [...prev, authorId]);
          setFollowingEmails(prev => [...prev, authorEmail]);
        }
        
        await loadFollowingList(currentUser.uid);
        
      } else {
        console.log("Author not found in users collection. Creating author profile...");
        const newAuthorRef = doc(collection(db, "users"));
        await setDoc(newAuthorRef, {
          email: authorEmail,
          displayName: authorEmail.split('@')[0],
          followers: [currentUser.uid],
          following: [],
          joinedAt: serverTimestamp()
        });
        
        const currentUserRef = doc(db, "users", currentUser.uid);
        await updateDoc(currentUserRef, {
          following: arrayUnion(newAuthorRef.id)
        });
        
        setFollowingList(prev => [...prev, newAuthorRef.id]);
        setFollowingEmails(prev => [...prev, authorEmail]);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("Error following user. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Human<br />stories & ideas
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              A place to read, write, and deepen your understanding
            </p>
            <Link
              href="/write"
              className="inline-block bg-white text-black px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition shadow-lg"
            >
              Start writing
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8 overflow-x-auto pb-4">
                <button
                  onClick={() => filterByCategory("")}
                  className={`whitespace-nowrap pb-4 border-b-2 transition text-sm ${
                    selectedCategory === "" 
                      ? "border-black text-black" 
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  For you
                </button>
                {['technology', 'lifestyle', 'business', 'health', 'travel', 'food', 'general'].map((category) => (
                  <button
                    key={category}
                    onClick={() => filterByCategory(category)}
                    className={`whitespace-nowrap pb-4 border-b-2 transition text-sm capitalize ${
                      selectedCategory === category 
                        ? "border-black text-black" 
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading stories...</div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No stories yet.</p>
                <Link
                  href="/write"
                  className="inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition"
                >
                  Write the first story
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredPosts.map((post, index) => (
                  <article key={post.id} className="group pb-8 border-b border-gray-100 last:border-b-0">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {post.author?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <Link 
                            href={`/profile/${post.author?.split('@')[0] || 'unknown'}`}
                            className="text-sm text-gray-800 hover:text-black transition font-medium"
                          >
                            {post.author?.split('@')[0] || 'Unknown'}
                          </Link>
                          <span className="text-gray-400">·</span>
                          <span className="text-sm text-gray-500">
                            {calculateReadTime(post.content)} min read
                          </span>
                        </div>
                        
                        <Link href={`/post/${post.id}`}>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-black transition mb-2 cursor-pointer line-clamp-2">
                            {post.title}
                          </h2>
                        </Link>
                        
                        <Link href={`/post/${post.id}`}>
                          <p className="text-gray-600 mb-4 line-clamp-2 cursor-pointer">
                            {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                          </p>
                        </Link>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {post.category && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                {post.category}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-sm text-gray-500">
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
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden cursor-pointer">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={96}
                              height={96}
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
              {currentUser && (
                <div className="bg-white border border-gray-200 rounded p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Who to follow</h3>
                  <div className="space-y-4">
                    {posts
                      .filter(post => post.author && post.author !== currentUser.email)
                      .reduce((unique, post) => {
                        if (!unique.find(p => p.author === post.author)) {
                          unique.push(post);
                        }
                        return unique;
                      }, [])
                      .slice(0, 3)
                      .map((post) => {
                        const authorUsername = post.author?.split('@')[0] || 'unknown';
                        const isFollowingAuthor = followingEmails.includes(post.author);
                        
                        return (
                          <div key={post.author} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {post.author?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1">
                              <Link 
                                href={`/profile/${authorUsername}`}
                                className="text-sm font-medium text-gray-900 hover:text-black transition"
                              >
                                {authorUsername}
                              </Link>
                            </div>
                            <button 
                              onClick={() => toggleFollowFromHome(post.author)}
                              className={`px-3 py-1 text-xs rounded-full transition ${
                                isFollowingAuthor 
                                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                                  : "bg-black text-white hover:bg-gray-800"
                              }`}
                            >
                              {isFollowingAuthor ? "Following" : "Follow"}
                            </button>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              )}
              
              <div className="bg-white border border-gray-200 rounded p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recommended topics</h3>
                <div className="flex flex-wrap gap-2">
                  {['Technology', 'Programming', 'Data Science', 'Machine Learning', 'Design', 'Productivity'].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition"
                    >
                      {topic}
                    </span>
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