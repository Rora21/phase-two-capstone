"use client";

import { useEffect, useState, use } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { auth } from "../../lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { Post } from "../../../types";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stories");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);

  useEffect(() => {
    loadUserProfile();
    loadUserPosts();
    
    // Listen to current user
    const unsubAuth = (auth as any).onAuthStateChanged?.((u: any) => {
      setCurrentUser(u);
      if (u && user) {
        checkFollowStatus(u.uid, user.uid);
      }
    });
    
    return () => unsubAuth?.();
  }, [username, user]);

  const loadUserProfile = async () => {
    try {
      // For simplicity, we'll use email as username
      const email = `${username}@gmail.com`;
      const q = query(collection(db, "users"), where("email", "==", email));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const userData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          setUser(userData);
          loadFollowersAndFollowing(userData);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error loading user profile:", error);
      setLoading(false);
    }
  };

  const checkFollowStatus = async (currentUserId: string, profileUserId: string) => {
    try {
      const currentUserDoc = await getDoc(doc(db, "users", currentUserId));
      if (currentUserDoc.exists()) {
        const following = currentUserDoc.data().following || [];
        setIsFollowing(following.includes(profileUserId));
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser || !user) return;
    
    try {
      const currentUserRef = doc(db, "users", currentUser.uid);
      const profileUserRef = doc(db, "users", user.uid);
      
      if (isFollowing) {
        // Unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(user.uid)
        });
        await updateDoc(profileUserRef, {
          followers: arrayRemove(currentUser.uid)
        });
        setIsFollowing(false);
      } else {
        // Follow
        await updateDoc(currentUserRef, {
          following: arrayUnion(user.uid)
        });
        await updateDoc(profileUserRef, {
          followers: arrayUnion(currentUser.uid)
        });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const loadFollowersAndFollowing = async (userData: any) => {
    try {
      // Load followers
      if (userData.followers && userData.followers.length > 0) {
        const followersData = await Promise.all(
          userData.followers.map(async (followerId: string) => {
            const followerDoc = await getDoc(doc(db, "users", followerId));
            return followerDoc.exists() ? { id: followerId, ...followerDoc.data() } : null;
          })
        );
        setFollowers(followersData.filter(Boolean));
      }

      // Load following
      if (userData.following && userData.following.length > 0) {
        const followingData = await Promise.all(
          userData.following.map(async (followingId: string) => {
            const followingDoc = await getDoc(doc(db, "users", followingId));
            return followingDoc.exists() ? { id: followingId, ...followingDoc.data() } : null;
          })
        );
        setFollowing(followingData.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading followers/following:", error);
    }
  };

  const loadUserPosts = () => {
    const email = `${username}@gmail.com`;
    const q = query(
      collection(db, "posts"),
      where("author", "==", email),
      where("status", "==", "published")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post)));
    });

    return () => unsubscribe();
  };

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="animate-pulse text-[#5E7B6F] text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1A3D2F] mb-2">User not found</h1>
          <p className="text-[#5E7B6F]">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Profile Header */}
      <div className="bg-white border-b border-[#E0D8CC]">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#1A3D2F] mb-2">
                {user.displayName || username}
              </h1>
              
              {user.bio && (
                <p className="text-lg text-[#5E7B6F] mb-4 max-w-2xl">
                  {user.bio}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-[#5E7B6F]">
                <span>{posts.length} Stories</span>
                <button 
                  onClick={() => setActiveTab("followers")}
                  className="hover:text-[#3E6B4B] transition"
                >
                  {user.followers?.length || 0} Followers
                </button>
                <button 
                  onClick={() => setActiveTab("following")}
                  className="hover:text-[#3E6B4B] transition"
                >
                  {user.following?.length || 0} Following
                </button>
              </div>
              
              {currentUser && currentUser.uid !== user.uid && (
                <div className="mt-6">
                  <button 
                    onClick={toggleFollow}
                    className={`px-6 py-2 rounded-full transition ${
                      isFollowing 
                        ? "bg-gray-200 text-[#5E7B6F] hover:bg-gray-300" 
                        : "bg-[#3E6B4B] text-white hover:bg-[#2D5038]"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-[#E0D8CC] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("stories")}
              className={`py-4 border-b-2 transition ${
                activeTab === "stories"
                  ? "border-[#3E6B4B] text-[#1A3D2F] font-medium"
                  : "border-transparent text-[#5E7B6F] hover:text-[#1A3D2F]"
              }`}
            >
              Stories
            </button>
            <button
              onClick={() => setActiveTab("followers")}
              className={`py-4 border-b-2 transition ${
                activeTab === "followers"
                  ? "border-[#3E6B4B] text-[#1A3D2F] font-medium"
                  : "border-transparent text-[#5E7B6F] hover:text-[#1A3D2F]"
              }`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`py-4 border-b-2 transition ${
                activeTab === "following"
                  ? "border-[#3E6B4B] text-[#1A3D2F] font-medium"
                  : "border-transparent text-[#5E7B6F] hover:text-[#1A3D2F]"
              }`}
            >
              Following
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 border-b-2 transition ${
                activeTab === "about"
                  ? "border-[#3E6B4B] text-[#1A3D2F] font-medium"
                  : "border-transparent text-[#5E7B6F] hover:text-[#1A3D2F]"
              }`}
            >
              About
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "stories" && (
          <div>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#5E7B6F] text-lg mb-4">No stories published yet.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {posts.map((post) => (
                  <article key={post.id} className="group">
                    <Link href={`/post/${post.id}`} className="block">
                      <div className="flex gap-6">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-[#1A3D2F] group-hover:text-[#2D5038] transition mb-2">
                            {post.title}
                          </h2>
                          
                          <p className="text-[#5E7B6F] mb-4 line-clamp-2">
                            {post.content.replace(/<[^>]+>/g, "").slice(0, 200)}...
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-[#5E7B6F]">
                            <span>{calculateReadTime(post.content)} min read</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {post.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                        
                        {post.imageUrl && (
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "followers" && (
          <div>
            <h3 className="text-xl font-bold text-[#1A3D2F] mb-6">Followers ({followers.length})</h3>
            {followers.length === 0 ? (
              <p className="text-[#5E7B6F]">No followers yet.</p>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#E0D8CC]">
                    <div className="w-12 h-12 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white font-bold">
                      {follower.displayName?.charAt(0)?.toUpperCase() || follower.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${follower.email?.split('@')[0] || 'unknown'}`}
                        className="font-medium text-[#1A3D2F] hover:text-[#3E6B4B] transition"
                      >
                        {follower.displayName || follower.email?.split('@')[0] || 'Unknown'}
                      </Link>
                      {follower.bio && (
                        <p className="text-sm text-[#5E7B6F] mt-1">{follower.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div>
            <h3 className="text-xl font-bold text-[#1A3D2F] mb-6">Following ({following.length})</h3>
            {following.length === 0 ? (
              <p className="text-[#5E7B6F]">Not following anyone yet.</p>
            ) : (
              <div className="space-y-4">
                {following.map((followedUser) => (
                  <div key={followedUser.id} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#E0D8CC]">
                    <div className="w-12 h-12 bg-[#3E6B4B] rounded-full flex items-center justify-center text-white font-bold">
                      {followedUser.displayName?.charAt(0)?.toUpperCase() || followedUser.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <Link 
                        href={`/profile/${followedUser.email?.split('@')[0] || 'unknown'}`}
                        className="font-medium text-[#1A3D2F] hover:text-[#3E6B4B] transition"
                      >
                        {followedUser.displayName || followedUser.email?.split('@')[0] || 'Unknown'}
                      </Link>
                      {followedUser.bio && (
                        <p className="text-sm text-[#5E7B6F] mt-1">{followedUser.bio}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg p-8 border border-[#E0D8CC]">
              <h3 className="text-xl font-bold text-[#1A3D2F] mb-4">About {user.displayName || username}</h3>
              
              {user.bio ? (
                <p className="text-[#5E7B6F] mb-6 leading-relaxed">{user.bio}</p>
              ) : (
                <p className="text-[#5E7B6F] mb-6 italic">No bio available.</p>
              )}
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#5E7B6F]">Joined:</span>
                  <span className="text-[#1A3D2F]">
                    {user.joinedAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#5E7B6F]">Stories:</span>
                  <span className="text-[#1A3D2F]">{posts.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}