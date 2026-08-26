"use client";

import { useBooks } from "@/app/context/BookContext";
import { useAuth } from "@/app/context/AuthContext";
import { MdBookmarkBorder, MdOutlineStarBorder } from "react-icons/md";
import { FiClock, FiMic } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";
import { LuBookOpenText } from "react-icons/lu";
import { useParams } from "next/navigation";
import { useSidebar } from "../../../context/SidebarContext";
import clsx from "clsx";
import AddToLibrary from "@/app/components/AddToLibrary";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import AudioDuration from "@/app/components/AudioDuration";
import StringToParagraph from "@/app/components/StringToParagraph";

export default function BookPage() {
    const { isOpen } = useSidebar();
    const params = useParams();
    const { bookId } = params;
    const router = useRouter();

    const { user, authLoading } = useAuth();
    const {
        selectedBook,
        recommendedBooks,
        suggestedBooks,
        loading: booksLoading,
    } = useBooks();
    const pathname = usePathname();

    const isPageLoading = authLoading || booksLoading;

    const book =
        recommendedBooks.find((b) => b.id === bookId) ||
        suggestedBooks.find((b) => b.id === bookId) ||
        selectedBook.find((b) => b.id === bookId);

    const proAccess =
        user && user.subscribed && ["Premium Plus"].includes(user.subscribed);

    useEffect(() => {
        if (!isPageLoading && !proAccess) {
            router.push(
                `/choose-plan?redirectTo=${encodeURIComponent(pathname)}`,
            );
        }
    }, [proAccess, router, isPageLoading]);

    if (isPageLoading) {
        return (
            <div className="flex min-h-screen">
                <h1>Loading the book page</h1>
                <div className="flex flex-col flex-1">
                    <main className="flex-col max-w-svw m-auto flex gap-4 text-center w-full p-4">
                        <div className="flex flex-row justify-between gap-6">
                            {/* Left Column Skeleton */}
                            <div className="basis-3/4 text-left animate-pulse">
                                {/* Title and Metadata */}
                                <div className="h-9 w-2/3 bg-gray-200 rounded mb-4"></div>
                                <div className="h-5 w-1/3 bg-gray-200 rounded mb-4"></div>
                                <div className="h-7 w-1/2 bg-gray-200 rounded mb-4"></div>

                                <div className="border-t-2 border-gray-200 my-4"></div>

                                {/* Specs Grid */}
                                <div className="grid grid-cols-2 grid-rows-2 gap-4 mt-4 mb-4">
                                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                </div>

                                <div className="border-t-2 border-gray-200 my-4"></div>

                                {/* Action Buttons */}
                                <div className="flex gap-4">
                                    <div className="h-14 w-30 bg-gray-200 rounded-2xl"></div>
                                    <div className="h-14 w-30 bg-gray-200 rounded-2xl"></div>
                                </div>

                                {/* Library button */}
                                <div className="h-8 w-44 bg-gray-200 rounded my-4"></div>

                                {/* Description sections */}
                                <div className="h-5 w-32 bg-gray-200 rounded mb-4 mt-6"></div>
                                <div className="flex gap-4 mb-4">
                                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                                    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            {/* Right Column Skeleton (Book Art Placement) */}
                            <div className="basis-1/4 animate-pulse flex justify-end">
                                <div className="w-50 h-75 bg-gray-200 rounded-lg mt-1"></div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!proAccess) return null;

    if (!book) {
        return <p className="p-6 text-red-600">Book Not Found.</p>;
    }

    const handleBookClick = (bookId) => {
        router.push(`/player/${bookId}`);
    };

    return (
        <div className={clsx("flex min-h-screen")}>
            <div className="flex flex-col flex-1">
                {" "}
                {/* Container */}
                <main className="flex-col max-w-svw m-auto flex gap-4 text-center">
                    <div className="flex flex-row justify-between gap-6">
                        <div className="basis-3/4 text-left">
                            <h1 className="mb-4 font-bold text-3xl">
                                {book.title}
                            </h1>
                            <h2 className="mb-4 font-bold text">
                                {book.author}
                            </h2>
                            <h3 className="mb-4 font-light text-gray-800 text-xl">
                                {book.subTitle}
                            </h3>
                            <div className="border-y-2 border-gray-200 py-4 mb-6 ">
                                <div className="grid md:grid-cols-2 md:grid-rows-2 w-2/3 gap-4 text-left font-bold text-sm">
                                    <div>
                                        <MdOutlineStarBorder className="inline" />{" "}
                                        {book.averageRating} ({book.totalRating}{" "}
                                        ratings)
                                    </div>
                                    <div>
                                        <FiClock className="inline" />{" "}
                                        <AudioDuration
                                            audioUrl={book.audioLink}
                                        />
                                    </div>
                                    <div>
                                        <FiMic className="inline" /> {book.type}
                                    </div>
                                    <div>
                                        <HiOutlineLightBulb className="inline" />{" "}
                                        {book.keyIdeas} Key Ideas
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-start">
                                <button
                                    onClick={() => handleBookClick(bookId)}
                                    className="bg-black text-white rounded-lg w-30 mr-2 hover:cursor-pointer"
                                >
                                    <LuBookOpenText className="inline mr-2 text-2xl" />{" "}
                                    Read{" "}
                                </button>{" "}
                                <button
                                    onClick={() => handleBookClick(bookId)}
                                    className="bg-black text-white rounded-lg w-30 ml-2 py-2 hover:cursor-pointer"
                                >
                                    <FiMic className="inline mr-2 text-2xl" />{" "}
                                    Listen{" "}
                                </button>
                            </div>
                            <div className="py-4 font-bold w-64">
                                <div className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
                                    <MdBookmarkBorder className="inline" />
                                    <AddToLibrary book={book} />
                                </div>
                            </div>
                            <h4 className="font-bold mb-4">What's it about?</h4>
                            <div className="flex gap-4 mb-4">
                                {book.tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-300 rounded-lg p-3 font-semibold text-sm bg-gray-200"
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <StringToParagraph text={book.summary} />
                            </div>

                            <h4 className="pt-5 pb-2 font-semibold ">
                                {" "}
                                About the author
                            </h4>

                            <div>
                                <StringToParagraph
                                    text={book.authorDescription}
                                />
                            </div>
                        </div>
                        <div className="basis-1/4">
                            <img
                                className="w-200 mt-1"
                                src={book.imageLink}
                            ></img>
                        </div>
                    </div>
                </main>
                <br />
                <br />
            </div>
        </div>
    );
}
