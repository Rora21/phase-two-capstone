"use client";
import { UseAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = UseAuth();
  const router = useRouter();

  if (loading) return <p>Loading...</p>;

  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
}
