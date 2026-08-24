"use client";

import { useState } from "react";
import { auth, googleProvider, db } from "@/app/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthForm() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [guestLoading, setGuestLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password,
                );
                const newUser = userCredential.user;

                await setDoc(doc(db, "users", newUser.uid), {
                    email: newUser.email,
                    subscribed: "Basic",
                    displayName: "",
                    createdAt: new Date().toISOString(),
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.push("/for-you");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

   const handleGoogleSignIn = async () => {
  setError("");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", googleUser.email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await setDoc(doc(db, "users", googleUser.uid), {
        email: googleUser.email,
        subscribed: "Basic",
        displayName: googleUser.displayName || "",
        createdAt: new Date().toISOString(),
      });
    } else {
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
      const existingDocId = existingDoc.id;

      await setDoc(doc(db, "users", googleUser.uid), {
        ...existingData,
        email: googleUser.email,
      });

      if (existingDocId !== googleUser.uid) {
        
        const oldLibraryRef = collection(db, "users", existingDocId, "library");
        const librarySnapshot = await getDocs(oldLibraryRef);

        const migrationPromises = librarySnapshot.docs.map(async (bookDoc) => {
          const newBookRef = doc(db, "users", googleUser.uid, "library", bookDoc.id);
          const oldBookRef = doc(db, "users", existingDocId, "library", bookDoc.id);
          
          await setDoc(newBookRef, bookDoc.data());
          await deleteDoc(oldBookRef);
        });

        await Promise.all(migrationPromises);

        await deleteDoc(doc(db, "users", existingDocId));
      }
    }

    router.push("/for-you");
  } catch (err: any) {
    console.error("Google sign in error:", err);
    setError(err.message);
  }
};


    const handleGuestSignIn = async () => {
        setError("");
        setGuestLoading(true);
        try {
            await signInWithEmailAndPassword(
                auth,
                "guest@email.com",
                "guest123",
            );
            router.push("/for-you");
        } catch (err: any) {
            setError(
                "Guest login is currently unavailable. Please try signing up!",
            );
        } finally {
            setGuestLoading(false);
        }
    };

    const isFormDisabled = loading || guestLoading;

    return (
        <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">
                {isSignUp ? "Sign Up" : "Sign In"}
            </h1>

            <form
                onSubmit={handleSubmit}
                autoComplete="off"
                name="app-auth-form"
                className="space-y-4"
            >
                <input
                    type="email"
                    placeholder="Email"
                    autoComplete="new-email"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isFormDisabled}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="new-password"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isFormDisabled}
                    required
                />

                {error && (
                    <p className="text-red-500 text-sm font-medium">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={isFormDisabled}
                    className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </button>

                {!isSignUp && (
                    <div className="space-y-3 pt-2 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isFormDisabled}
                            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            Login with Google
                        </button>
                        <button
                            type="button"
                            onClick={handleGuestSignIn}
                            disabled={isFormDisabled}
                            className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-colors"
                        >
                            {guestLoading
                                ? "Signing in as Guest..."
                                : "Login as Guest"}
                        </button>
                    </div>
                )}
            </form>

            <p className="mt-6 text-sm text-center text-gray-600">
                {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                <button
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError("");
                    }}
                    className="text-blue-600 font-semibold underline cursor-pointer ml-1"
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
            </p>
        </div>
    );
}
