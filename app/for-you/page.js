"use client";

import "../globals.css";
import { useAuth } from "@/app/context/AuthContext";
import { useBooks } from "@/app/context/BookContext";
import { useSidebar } from "../context/SidebarContext";
import BookCarousel from "@/app/components/BookCarousel";
import { MdOutlineLock } from "react-icons/md";
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
    const { user, authLoading } = useAuth();
    const { loading, error, selectedBook, recommendedBooks, suggestedBooks } =
        useBooks();
    const { isOpen, open, close, toggle } = useSidebar();
    const router = useRouter();

    if (authLoading || loading) {
        return (
            <div className="flex flex-col max-w-6xl mx-auto gap-12 p-2 w-full">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Selected Just For You
                    </h2>
                </div>
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Recommended For You
                    </h2>
                    <h3 className="text-gray-500 text-sm">
                        We think you will these
                    </h3>
                </div>
                <div>
                    <div className="h-8 w-56 bg-gray-300 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Suggested For You
                    </h2>
                    <h3 className="text-gray-500 text-sm">Browse</h3>
                </div>
                <div>
                    <div className="h-8 w-44 bg-gray-300 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-8 animate-pulse"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    if (!user) {
        return (
            <div className="w-full min-h-[75vh] flex flex-col justify-center items-center">
                {/* 2. Inner wrapper handles the perfect centering inside the remaining space */}
                <div className="flex flex-col justify-center gap-4 w-full">
                    <img className="mx-auto w-3/4" src="/login.png" alt="" />
                    <h1 className="text-center font-bold text-3xl">
                        Log in to your account to enter the library
                    </h1>
                    <Link
                        href="/login"
                        className="mx-auto bg-blue-500 text-white p-2 rounded-2xl cursor-pointer w-56 animate-pulse flex justify-center items-center"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    const safeSelectedBook = Array.isArray(selectedBook)
        ? selectedBook
        : selectedBook
          ? [selectedBook]
          : [];

    return (
        <div className="w-full space-y-6 pb-6">
            {/* 1. Selected for You Section Row */}
            <BookCarousel
                title="Selected Just For You"
                subtitle=""
                books={safeSelectedBook}
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
        </div>
    );
}
