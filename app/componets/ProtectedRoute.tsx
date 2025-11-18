"use client";

import { useAuth } from "../hooks/useauth";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
}
