"use client";

import { useParams, useRouter } from "next/navigation";
import { useTextSize } from "../../context/TextSizeContext";
import { useBooks } from "@/app/context/BookContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "@/app/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
} from "firebase/firestore";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import PlayerSkeleton from "@/app/components/PlayerSkeleton";
import StringToParagraphFull from '@/app/components/StringToParagraphFull';

export default function PlayerPage() {
    const { textSize } = useTextSize();
    const params = useParams();
    const router = useRouter();
    const { bookId } = params;
    const { user } = useAuth();

    const { selectedBook, recommendedBooks, suggestedBooks, loading } =
        useBooks();
    const [markingFinished, setMarkingFinished] = useState(false);
    const currentSelected = selectedBook as any;

    const book =
        recommendedBooks.find((b) => b.id === bookId) ||
        suggestedBooks.find((b) => b.id === bookId) ||
        (Array.isArray(currentSelected)
            ? currentSelected.find((b) => b.id === bookId)
            : currentSelected?.id === bookId
              ? currentSelected
              : null);
    
    const handleMarkAsFinished = async () => {
        if (!user || !user.email) return alert("You must be signed in.");

        setMarkingFinished(true);
        try {
            const usersRef = collection(db, "users");
            const qUser = query(usersRef, where("email", "==", user.email));
            const userSnapshot = await getDocs(qUser);

            if (!userSnapshot.empty) {
                const actualDocId = userSnapshot.docs[0].id;
                const bookRef = doc(
                    db,
                    "users",
                    actualDocId,
                    "library",
                    book.id,
                );

                await updateDoc(bookRef, {
                    finished: true,
                    finishedAt: new Date(),
                });

                alert("Packaged up! Book marked as completed.");
                router.push("/mylibrary");
            } else {
                alert("User record profile data not found.");
            }
        } catch (err) {
            console.error("Failed to update finished status:", err);
            alert("Could not update completion status.");
        } finally {
            setMarkingFinished(false);
        }
    };

    if (loading) {
        return <PlayerSkeleton />;
    }


    return (
        <div className="min-h-screen bg-white pb-24">
            <div className="max-w-3xl m-auto p-6">
                {/* Header Metadata Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {book.title}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {book.author || "Unknown Author"}
                        </p>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6"></div>

                {/* Content Paragraph Block Rendering */}
                <div>
                    <StringToParagraphFull text={book.summary} />
                </div>
            </div>
            <div className="flex justify-center">
                {/* Mark Finished Action Trigger */}
                <button
                    onClick={handleMarkAsFinished}
                    disabled={markingFinished}
                    className="flex gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-center"
                >
                    <FiCheckCircle className="text-base" />
                    <span>
                        {markingFinished ? "Saving..." : "Mark as Finished"}
                    </span>
                </button>
            </div>
        </div>
    );
}
