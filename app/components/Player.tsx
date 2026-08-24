"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useBooks } from "@/app/context/BookContext";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
} from "firebase/firestore";
import { FaRegPlayCircle, FaRegPauseCircle } from "react-icons/fa";
import { TbRewindBackward10, TbRewindForward10 } from "react-icons/tb";

export default function Footer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const isFinishedSavedRef = useRef(false);
    const params = useParams();
    const { bookId } = params;
    const { user } = useAuth();
    const { selectedBook, recommendedBooks, suggestedBooks } = useBooks();

    const currentSelected = selectedBook as any;
    const book =
        recommendedBooks.find((b) => b.id === bookId) ||
        suggestedBooks.find((b) => b.id === bookId) ||
        (Array.isArray(currentSelected)
            ? currentSelected.find((b) => b.id === bookId)
            : currentSelected?.id === bookId
              ? currentSelected
              : null);

    useEffect(() => {
        isFinishedSavedRef.current = false;
    }, [bookId]);

    const triggerMarkAsFinished = async () => {
        if (!user?.email || !book?.id) {
            console.warn(
                "⚠️ Cannot save progress: User profile or book information missing.",
                { user, book },
            );
            return;
        }

        isFinishedSavedRef.current = true;
        console.log(
            "🎬 Audio finished! Syncing database completion flags for:",
            book.title,
        );

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

                await setDoc(
                    bookRef,
                    {
                        finished: true,
                        finishedAt: new Date(),
                    },
                    { merge: true },
                );

                console.log(
                    "✅ Success! Book flagged as finished inside Firestore.",
                );
            } else {
                console.error(
                    "❌ Profile document not found for email:",
                    user.email,
                );
                isFinishedSavedRef.current = false;
            }
        } catch (err) {
            console.error("❌ Firestore transaction write failed:", err);
            isFinishedSavedRef.current = false;
        }
    };

    // Component-level early return if book data isn't loaded yet
    if (!book) return null;

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch((err) => console.error("Playback error:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const rewind10 = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
    };

    const forward10 = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = Math.min(
            audio.currentTime + 10,
            audio.duration || audio.currentTime + 10,
        );
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio) return;

        setCurrentTime(audio.currentTime);

        if (audio.duration && audio.currentTime >= audio.duration - 1.5) {
            if (!isFinishedSavedRef.current) {
                triggerMarkAsFinished();
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const newTime = Number(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    return (
        <footer className="fixed bottom-0 left-0 w-full bg-gray-900 text-white shadow-lg z-50">
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-3">
                {/* Book Details (Left Side) */}
                <div className="flex mb-4 md:mb-0">
                    <img
                        src={book.imageLink}
                        className="w-10 mr-4 object-contain"
                        alt=""
                    />
                    <div className="flex flex-col text-sm">
                        <p className="font-semibold line-clamp-1">
                            {book.title}
                        </p>
                        <p className="text-gray-400 text-xs line-clamp-1">
                            {book.author}
                        </p>
                    </div>
                </div>

                {/* Audio Controls (Middle) */}
                <div className="flex items-center gap-5">
                    <button onClick={rewind10} className="cursor-pointer">
                        <TbRewindBackward10 className="w-8 h-8 hover:text-gray-300 text-white" />
                    </button>
                    <button onClick={togglePlay} className="cursor-pointer">
                        {isPlaying ? (
                            <FaRegPauseCircle className="w-8 h-8 text-blue-400 hover:scale-105 transition-transform" />
                        ) : (
                            <FaRegPlayCircle className="w-8 h-8 text-white hover:scale-105 transition-transform" />
                        )}
                    </button>
                    <button onClick={forward10} className="cursor-pointer">
                        <TbRewindForward10 className="w-8 h-8 hover:text-gray-300 text-white" />
                    </button>

                    <audio
                        ref={audioRef}
                        src={book.audioLink}
                        preload="auto"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => {
                            if (!isFinishedSavedRef.current) {
                                triggerMarkAsFinished();
                            }
                        }}
                    />
                </div>

                {/* Progress Bar (Right Side) */}
                <div className="flex items-center w-full md:w-100 gap-2 mt-4 md:mt-0">
                    <span className="text-xs text-white">
                        {formatTime(currentTime)}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full accent-blue-500 cursor-pointer h-1 bg-white rounded-lg appearance-none"
                    />
                    <span className="text-xs text-white">
                        {formatTime(duration)}
                    </span>
                </div>
            </div>
        </footer>
    );
}
