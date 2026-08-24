"use client";

import "../globals.css";
import { useAuth } from "@/app/context/AuthContext";
import { useBooks } from "@/app/context/BookContext";
import { useSidebar } from "../context/SidebarContext";
import BookCarousel from "@/app/components/BookCarousel";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import Link from "next/link";

function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-lg shadow p-4 animate-pulse w-full">
      <div className="flex justify-end">
        <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
      </div>
      <div className="mt-2 h-40 w-full bg-gray-300 rounded"></div>
      <div className="mt-4 h-5 w-3/4 bg-gray-300 rounded"></div>
      <div className="mt-2 h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="mt-2 h-3 w-5/6 bg-gray-300 rounded"></div>
      <div className="mt-3 flex space-x-4">
        <div className="h-4 w-12 bg-gray-300 rounded"></div>
        <div className="h-4 w-12 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export default function ForYouPage() {
  const { user } = useAuth();
  const { loading, error, selectedBook, recommendedBooks, suggestedBooks } = useBooks();
  const { isOpen, open, close, toggle } = useSidebar();
  const router = useRouter();

      if (!user) {
        return (
        <div className="font-bold text-red-500 animate-pulse"> You need to sign in for access to the For You page
            <Link href={'/login'} className="bg-blue-600 text-white p-2 rounded-2xl ml-4">Sign Me In</Link>
        </div>
    );
}

  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  if (loading) {
    return (
      <div className={clsx("flex min-h-screen bg-gray-50")}>
        <div className="flex flex-col flex-1">
          <main className="flex flex-col max-w-6xl mx-auto gap-12 p-6 w-full">
            {/* Selected Book Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>
              <div className="w-full max-w-2xl h-32 bg-gray-200 rounded-2xl"></div>
            </div>

            {/* Recommended Section Carousel Skeletons */}
            <div>
              <div className="h-8 w-56 bg-gray-300 rounded mb-1 animate-pulse"></div>
              <div className="h-4 w-40 bg-gray-200 rounded mb-8 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>

            {/* Suggested Section Carousel Skeletons */}
            <div>
              <div className="h-8 w-44 bg-gray-300 rounded mb-1 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-8 animate-pulse"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const safeSelectedBooks = Array.isArray(selectedBook)
    ? selectedBook
    : selectedBook
    ? [selectedBook]
    : [];

  return (
    <div className={clsx("flex min-h-screen bg-gray-50")}>
      <div className="flex flex-col flex-1 py-6 space-y-2">
        <main className="w-full">
          
          {/* 1. Selected for You Section Row */}
          <BookCarousel 
            title="Selected Just For You" 
            subtitle=""
            books={safeSelectedBooks} 
          />

          {/* 2. Recommended for You Section Row */}
          <BookCarousel 
            title="Recommended For You"  
            subtitle="We think you will like these"
            books={recommendedBooks || []} 
          />

          {/* 3. Suggested for You Section Row */}
          <BookCarousel 
            title="Suggested for You"  
            subtitle="Browse these books"
            books={suggestedBooks || []} 
          />

        </main>
      </div>
    </div>
  );
}
