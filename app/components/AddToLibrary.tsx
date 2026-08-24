"use client";

import { auth, db } from "@/app/lib/firebase";
import { doc, deleteDoc, onSnapshot, writeBatch, getDoc, collection, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

interface Book {
  id: string;
  title?: string;
  author?: string;
}

export default function AddToLibrary({ book }: { book: Book }) {
  const [loading, setLoading] = useState(false);
  const [isInLibrary, setIsInLibrary] = useState(false);
  const [checking, setChecking] = useState(true);
  const [subscribed, setSubscribed] = useState("none");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !book?.id) {
      setChecking(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "library", book.id);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setIsInLibrary(docSnap.exists());
      setChecking(false);
    });

    const fetchSubscription = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setSubscribed(userDoc.data().subscribed || "none");
      }
    };
    fetchSubscription();

    return () => unsubscribe();
  }, [book?.id]);

  if (!book || !book.id || checking) return null;

  const handleToggleLibrary = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    const user = auth.currentUser;
    if (!user) return alert("You must be signed in.");

    setLoading(true);

    const userRef = doc(db, "users", user.uid);
    const bookRef = doc(db, "users", user.uid, "library", book.id);

    try {
      if (isInLibrary) {
        await deleteDoc(bookRef);
        alert("Removed from your library.");
      } else {
        if (subscribed === "none") {
          const librarySnap = await getDocs(collection(db, "users", user.uid, "library"));
          if (librarySnap.size >= 0) {
            setLoading(false);
            return alert("Free plan limit reached. Upgrade to add books.");
          }
        }

        const batch = writeBatch(db);

        batch.set(userRef, {
          email: user.email || "",
          createdAt: new Date(), 
          lastActive: new Date()
        }, { merge: true });

        batch.set(bookRef, {
          title: book.title || "Untitled Book",
          author: book.author || "Unknown Author",
          addedAt: new Date(),
        }, { merge: true });

        await batch.commit();
        alert("Added to your library!");
      }
    } catch (err) {
      console.error("Firestore Transaction Error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (<span className="animate-pulse">{isInLibrary ? " Adding To Your Library" : " Removing From Your Library"}</span>);
}

  return (
    <button
      onClick={handleToggleLibrary}
      disabled={loading}
      className="text-white hover:underline cursor-pointer disabled:opacity-50 font-bold ml-2"
    >
      {loading ? "Processing..." : isInLibrary ? "Remove From My Library" : "Add To My Library"}
    </button>
  );
}
