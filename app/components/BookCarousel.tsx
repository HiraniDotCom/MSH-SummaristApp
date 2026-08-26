"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { FiChevronLeft, FiChevronRight, FiClock } from "react-icons/fi";
import { MdOutlineStarBorder } from "react-icons/md";
import AudioDuration from "./AudioDuration";

interface Book {
    id: string;
    title: string;
    author?: string;
    subTitle?: string;
    imageLink?: string | null;
    averageRating?: number | string | null;
    totalRating?: number | string | null;
    audioLink?: string | undefined;
    subscriptionRequired: boolean;
}

interface BookCarouselProps {
    title: string;
    subtitle: string;
    books: Book[];
}

export default function BookCarousel({
    title,
    subtitle,
    books,
}: BookCarouselProps) {
    const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(
        null,
    );
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(false);
    const { user, authLoading } = useAuth();
    const pathname = usePathname();
    const isPremiumUser = user?.subscribed === "Premium Plus";
    const updateButtonVisibility = useCallback(
        (container: HTMLDivElement | null) => {
            const target = container || containerNode;
            if (target) {
                const scrollLeft = target.scrollLeft;
                const isScrollable = target.scrollWidth > target.clientWidth;
                const maxScroll = target.scrollWidth - target.clientWidth;

                setShowLeftBtn(isScrollable && scrollLeft > 5);
                setShowRightBtn(isScrollable && scrollLeft < maxScroll - 5);
            }
        },
        [containerNode],
    );
    const carouselRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node !== null) {
                setContainerNode(node);
                updateButtonVisibility(node);
            }
        },
        [updateButtonVisibility],
    );
    const scrollOneCard = (direction: "left" | "right") => {
        if (containerNode) {
            const firstCard = containerNode.firstElementChild as HTMLElement;
            if (firstCard) {
                const cardWidthWithGap = firstCard.offsetWidth + 24;
                containerNode.scrollBy({
                    left:
                        direction === "left"
                            ? -cardWidthWithGap
                            : cardWidthWithGap,
                    behavior: "smooth",
                });
            }
        }
    };

    useEffect(() => {
        updateButtonVisibility(null);
        window.addEventListener("resize", () => updateButtonVisibility(null));
        return () =>
            window.removeEventListener("resize", () =>
                updateButtonVisibility(null),
            );
    }, [books, updateButtonVisibility]);

    if (authLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-6 animate-pulse">
                <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-48 w-full bg-gray-100 rounded-2xl"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6 relative">
            {/* Header Controls Area */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <h3 className="text-gray-500 text-sm">{subtitle}</h3>
                </div>
                <div className="flex gap-2 min-h-10.5">
                    {showLeftBtn && (
                        <button
                            onClick={() => scrollOneCard("left")}
                            className="p-2 rounded-xl bg-black border border-black hover:bg-gray-50 text-white hover:text-black transition-all shadow-sm cursor-pointer"
                            aria-label="Scroll left"
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                    )}
                    {showRightBtn && (
                        <button
                            onClick={() => scrollOneCard("right")}
                            className="p-2 rounded-xl bg-black border border-black hover:bg-gray-50 text-white hover:text-black transition-all shadow-sm cursor-pointer"
                            aria-label="Scroll right"
                        >
                            <FiChevronRight className="text-xl" />
                        </button>
                    )}
                </div>
            </div>

            <div
                ref={carouselRef}
                onScroll={() => updateButtonVisibility(null)}
                className="grid grid-flow-col auto-cols-[calc(100%)] sm:auto-cols-[calc(50%-12px)] md:auto-cols-[calc(33.33%-16px)] lg:auto-cols-[calc(25%-18px)] gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory scroll-smooth"
            >
                {books.map((book) => {
                    const requiresPremium =
                        book.subscriptionRequired === true ||
                        String(book.subscriptionRequired) === "true";
                    const isLocked = requiresPremium && !isPremiumUser;

                    if (isLocked) {
                        return (
                            <Link
                                key={book.id}
                                href={`/choose-plan?redirectTo=${encodeURIComponent(pathname)}`}
                                className="group bg-orange-100 border border-orange-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden snap-start shrink-0 min-h-90"
                            >
                                <div className="flex flex-col gap-3 h-full justify-between">
                                    <div>
                                        <div className="flex justify-end mb-1">
                                            <span className="text-[10px] bg-amber-500 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                                                Premium
                                            </span>
                                        </div>
                                        <div className="w-full aspect-3/4 bg-orange-200/60 rounded-xl overflow-hidden mb-2 flex items-center justify-center text-3xl border border-orange-300/40">
                                            🔒
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-orange-200 rounded w-3/4 animate-pulse"></div>
                                            <div className="h-3 bg-orange-200 rounded w-1/2 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="p-2 w-full bg-green-500 text-white font-bold text-center text-xs rounded-xl shadow-sm group-hover:bg-green-600 transition-colors">
                                        Buy a plan
                                    </div>
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={book.id}
                            href={`/for-you/book/${book.id}`}
                            className={`border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex overflow-hidden snap-start shrink-0 ${
                                title === "Selected Just For You"
                                    ? "flex-col md:flex-row gap-4 w-full md:min-w-130 sm:max-w-90 bg-amber-200 items-center"
                                    : "flex-col justify-between h-95 w-full"
                            }`}
                        >
                            {title === "Selected Just For You" ? (
                                <>
                                    {book.subTitle && (
                                         <p className="text-black text-sm font-normal mt-1 w-full md:w-1/3 text-center">
                                                    {book.subTitle}
                                                </p>
                                            )}
                                    {/* LEFT/TOP COLUMN: Book Cover Image */}
                                    {book.imageLink && (
                                        <div className="w-full md:w-1/3 justify-center shrink-0 rounded-xl overflow-hidden">
                                            <img
                                                src={book.imageLink}
                                                alt={book.title}
                                                className="w-1/2 h-full object-contain group-hover:scale-105 transition-transform duration-300 m-auto"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between w-full md:w-1/2 h-full text-center">
                                        <div>
                                            <div className=" justify-between md:items-start gap-2 mt-2 md:mt-0">
                                                {requiresPremium && (
                                                    <span className="text-[9px] bg-black text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                                                        Premium
                                                    </span>
                                                )}
                                                <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight flex-1">
                                                    {book.title}
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 text-sm font-normal mt-1">
                                                {book.author}
                                            </p>
                                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-600">
                                                <div className="flex items-center">
                                                    <MdOutlineStarBorder className="mr-1 text-base shrink-0" />
                                                    <span>
                                                        {book.averageRating}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <FiClock className="mr-1 text-base shrink-0" />
                                                    <AudioDuration
                                                        audioUrl={
                                                            book.audioLink
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {title !== "Selected Just For You" ? (
                                        <div className="flex flex-col gap-3 h-full justify-center w-full">
                                            <div>
                                                <div className="h-3 w-full flex items-center justify-end">
                                                    {requiresPremium && (
                                                        <span className="text-[8px] bg-black text-white font-normal uppercase p-1 rounded-md">
                                                            Premium
                                                        </span>
                                                    )}
                                                </div>
                                                {book.imageLink && (
                                                    <div className="w-full rounded-xl overflow-hidden m-auto relative">
                                                        <img
                                                            src={book.imageLink}
                                                            alt={book.title}
                                                            className="w-24 md:w-3/4 object-contain group-hover:scale-105 transition-transform duration-300 mt-3"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors leading-4 mt-2">
                                                        {book.title}
                                                    </h3>
                                                    <p className="text-gray-700 text-sm font-normal mt-1">
                                                        {book.author}
                                                    </p>
                                                    <p className="text-black text-xs font-normal mt-1">
                                                        {book.subTitle}
                                                    </p>
                                                </div>
                                            <div className="flex flex-col gap-1 text-xs font-semibold text-gray-600 mt-1">
                                                <div className="flex items-center gap-4 text-gray-600">
                                                    <div className="flex items-center">
                                                        <MdOutlineStarBorder className="mr-1 text-base" />
                                                        <span>
                                                            {book.averageRating}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <FiClock className="mr-1 text-base" />
                                                        <AudioDuration
                                                            audioUrl={
                                                                book.audioLink
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            </div>

                                        </div>
                                    ) : null}
                                </>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
