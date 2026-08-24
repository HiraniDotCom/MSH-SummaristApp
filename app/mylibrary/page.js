"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/lib/firebase";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    getDocs,
    where,
} from "firebase/firestore";
import { useBooks } from "@/app/context/BookContext";
import Link from "next/link";
import { MdOutlineStarBorder } from "react-icons/md";
import { FiClock, FiCheckCircle, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import AudioDuration from "@/app/components/AudioDuration";

export default function MyLibraryPage() {
    const [firestoreBooks, setFirestoreBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("learning");

    const { user } = useAuth();
    const router = useRouter();
    const {
        selectedBook = [],
        recommendedBooks = [],
        suggestedBooks = [],
    } = useBooks();
    const pathname = usePathname();
    
    if (!user) {
        return (
        <div className="font-bold text-red-500 animate-pulse"> You need to sign in for access to the My Library page
            <Link href={'/login'} className="bg-blue-600 text-white p-2 rounded-2xl ml-4">Sign Me In</Link>
        </div>
    );
}

    useEffect(() => {
        if (!user || !user.email) return;

        let unsubscribeLibrary = null;

        const setupLibraryListener = async () => {
            try {
                const usersRef = collection(db, "users");
                const qUser = query(usersRef, where("email", "==", user.email));
                const userSnapshot = await getDocs(qUser);

                if (!userSnapshot.empty) {
                    const actualDocId = userSnapshot.docs[0].id;
                    const libraryRef = collection(
                        db,
                        "users",
                        actualDocId,
                        "library",
                    );
                    const qLibrary = query(
                        libraryRef,
                        orderBy("addedAt", "desc"),
                    );

                    unsubscribeLibrary = onSnapshot(
                        qLibrary,
                        (snapshot) => {
                            const list = snapshot.docs.map((doc) => ({
                                id: doc.id,
                                ...doc.data(),
                            }));
                            setFirestoreBooks(list);
                            setLoading(false);
                        },
                        (error) => {
                            console.error("Library snapshot failed:", error);
                            setLoading(false);
                        },
                    );
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error setting up library query:", err);
                setLoading(false);
            }
        };

        setupLibraryListener();

        return () => {
            if (unsubscribeLibrary) unsubscribeLibrary();
        };
    }, [user]);

    const hasAccess =
        user &&
        user.subscribed &&
        ["Premium", "Premium Plus"].includes(user.subscribed);

    useEffect(() => {
        if (user === null) {
            setLoading(false);
        }
        if (!loading && !hasAccess) {
            router.replace(
                `/choose-plan?redirectTo=${encodeURIComponent(pathname)}`,
            );
        }
    }, [hasAccess, loading, router, user]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-500 font-medium">
                    Loading your enriched library...
                </p>
            </div>
        );
    }

    if (!hasAccess) return null;

    const learningBooks = firestoreBooks.filter((b) => !b.finished);
    const finishedBooks = firestoreBooks.filter((b) => b.finished);
    const currentBooksToDisplay =
        activeTab === "learning" ? learningBooks : finishedBooks;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user?.displayName
                            ? `${user.displayName}'s Library`
                            : "Your Library"}
                    </h1>

                    {/* Navigation Tabs */}
                    <div className="flex bg-gray-200/80 p-1 rounded-xl self-start sm:self-center">
                        <button
                            onClick={() => setActiveTab("learning")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                                activeTab === "learning"
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-600 hover:text-black"
                            }`}
                        >
                            <FiBookOpen className="text-base" />
                            <span>In Progress</span>
                            <span
                                className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === "learning" ? "bg-black text-white" : "bg-gray-300 text-gray-700"}`}
                            >
                                {learningBooks.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab("finished")}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                                activeTab === "finished"
                                    ? "bg-white text-black shadow-sm"
                                    : "text-gray-600 hover:text-black"
                            }`}
                        >
                            <FiCheckCircle className="text-base" />
                            <span>Finished</span>
                            <span
                                className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${activeTab === "finished" ? "bg-black text-white" : "bg-gray-300 text-gray-700"}`}
                            >
                                {finishedBooks.length}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Empty States */}
                {currentBooksToDisplay.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                        <p className="text-gray-500 text-lg mb-4">
                            {activeTab === "learning"
                                ? "Your library collection is currently empty."
                                : "You haven't finished reading any books yet!"}
                        </p>
                        {activeTab === "learning" && (
                            <Link
                                href="/for-you"
                                className="inline-block bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Explore and Add Books
                            </Link>
                        )}
                    </div>
                ) : (
                    /* Books Grid Layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {currentBooksToDisplay.map((firestoreItem) => {
                            const contextMatch =
                                recommendedBooks.find(
                                    (b) => b.id === firestoreItem.id,
                                ) ||
                                suggestedBooks.find(
                                    (b) => b.id === firestoreItem.id,
                                ) ||
                                (selectedBook?.id === firestoreItem.id
                                    ? selectedBook
                                    : null);

                            const displayBook = {
                                id: firestoreItem.id,
                                title:
                                    contextMatch?.title || firestoreItem.title,
                                author:
                                    contextMatch?.author ||
                                    firestoreItem.author,
                                imageLink: contextMatch?.imageLink || null,
                                averageRating:
                                    contextMatch?.averageRating || null,
                                summary: contextMatch?.summary || "",
                                audioLink: contextMatch?.audioLink || [],
                            };

                            return (
                                <Link
                                    key={displayBook.id}
                                    href={`/for-you/book/${displayBook.id}`}
                                    className="group bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3">
                                        {displayBook.imageLink && (
                                            <div className="w-full aspect-3/4 bg-gray-100 rounded-xl overflow-hidden mb-2 relative">
                                                <img
                                                    src={displayBook.imageLink}
                                                    alt={displayBook.title}
                                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                                {displayBook.title}
                                            </h3>
                                            <p className="text-gray-600 text-xs font-semibold mt-1">
                                                {displayBook.author}
                                            </p>
                                        </div>

                                        <div className="flex flex-row justify-between gap-1 mt-2 text-xs font-base text-gray-600">
                                            {displayBook.averageRating && (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <MdOutlineStarBorder className="text-sm" />
                                                    <span>
                                                        {
                                                            displayBook.averageRating
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {displayBook?.audioLink?.length >
                                                0 && (
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <FiClock className="text-sm" />
                                                    <AudioDuration
                                                        audioUrl={
                                                            displayBook?.audioLink
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Footer Timeline Meta */}
                                    <div className="text-[10px] text-gray-400 mt-4 pt-2 border-t border-gray-100 flex justify-between items-center">
                                        <span>
                                            {firestoreItem.finished
                                                ? "Finished"
                                                : "Added"}
                                        </span>
                                        <span>
                                            {firestoreItem.finished
                                                ? firestoreItem.finishedAt
                                                      ?.toDate
                                                    ? firestoreItem.finishedAt
                                                          .toDate()
                                                          .toLocaleDateString()
                                                    : "Finished"
                                                : firestoreItem.addedAt?.toDate
                                                  ? firestoreItem.addedAt
                                                        .toDate()
                                                        .toLocaleDateString()
                                                  : "Saved"}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
