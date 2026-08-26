"use client";

import { MdOutlineMenu, MdArrowBackIosNew } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { HiMagnifyingGlass } from "react-icons/hi2";
import "@/app/globals.css";
import { useSidebar } from "@/app/context/SidebarContext";
import { useState, useRef, useEffect } from "react";
import { useBooks } from "@/app/context/BookContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import AudioDuration from "./AudioDuration";

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

export default function Header() {
    const { selectedBook, suggestedBooks, recommendedBooks, loading, error } =
        useBooks();
    const [query, setQuery] = useState("");
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);
    const { open, close } = useSidebar();
    const router = useRouter();
    const { user } = useAuth();
    const isAuthenticated = !!user;
    const handleInputChange = (e) => {
        if (!isAuthenticated) return;
        setQuery(e.target.value);
    };

    const debouncedFilter = debounce((searchTerm) => {
        if (!searchTerm.trim()) {
            setFilteredBooks([]);
            setIsOpen(false);
            return;
        }

        const lowerQuery = searchTerm.toLowerCase();

        const allBooks = [
            ...(selectedBook || {}),
            ...(suggestedBooks || []),
            ...(recommendedBooks || {}),
        ];

        const matches = allBooks.filter((book) => {
            const searchableText = [
                book.title,
                book.subTitle,
                book.summary,
                book.authorDescription,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(lowerQuery);
        });
        setFilteredBooks(matches);
        setIsOpen(true);
    }, 300);

    useEffect(() => {
        debouncedFilter(query);
    }, [query, selectedBook || recommendedBooks || suggestedBooks]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setQuery("");
                setFilteredBooks({});
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBookClick = (bookId) => {
        router.push(`/for-you/book/${bookId}`);
    };

    if (error) return <p className="text-center mt-6 text-red-500">{error}</p>;

    return (
        <div
            className="max-w-full border-b border-gray-300 p-2 relative"
            ref={containerRef}
        >
            <div className="flex flex-1 ">
                <button
                    onClick={() => router.back()}
                    className="flex items-center p-2 rounded-xl text-gray-600 hover:text-black hover:bg-gray-100 transition-all cursor-pointer shrink-0"
                    aria-label="Go back to previous page"
                >
                    <MdArrowBackIosNew className="h-5 w-5" />
                    Go Back
                </button>
                <div className="flex flex-col relative w-full max-w-lg ml-auto mr-5">
                    {/* Search Input Bar */}
                    <div className="flex items-center relative w-full has-:disabled:opacity-60 transition-opacity">
                        <button
                            className="lg:hidden mr-2 shrink-0"
                            onClick={open}
                        >
                            <MdOutlineMenu className="h-6 w-6" />
                        </button>

                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder={
                                    isAuthenticated
                                        ? "Search for a book..."
                                        : "Sign in to search for books..."
                                }
                                value={isAuthenticated ? query : ""}
                                onChange={handleInputChange}
                                disabled={!isAuthenticated}
                                className="w-full bg-gray-200 pl-4 pr-10 py-2 text-gray-600 border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                            />

                            {isAuthenticated &&
                                (query.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery("");
                                            setFilteredBooks([]);
                                            setIsOpen(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                ) : (
                                    <HiMagnifyingGlass className="inline absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-600" />
                                ))}
                        </div>
                    </div>

                    {/* Dropdown Overlay */}
                    {isOpen && filteredBooks.length > 0 && (
                        <div className="absolute w-100  right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                            {filteredBooks.map((book, idx) => (
                                <div
                                    key={book.id}
                                    className={`flex px-4 py-2 items-center cursor-pointer border-b border-gray-300 ${
                                        idx === activeIndex
                                            ? "bg-blue-100"
                                            : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => handleBookClick(book.id)}
                                >
                                    <div>
                                        <img
                                            src={book.imageLink}
                                            className="max-w-25 p-2"
                                        />
                                    </div>
                                    <div className="flex-1 items-center">
                                        <div className="font-semibold">
                                            {book.title}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            By: {book.author}
                                        </div>
                                        <div className="text-sm">
                                            <FiClock className="inline" />{" "}
                                            <AudioDuration
                                                audioUrl={book.audioLink}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {isOpen && filteredBooks.length === 0 && query.trim() && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-gray-500 z-50">
                            No books found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
