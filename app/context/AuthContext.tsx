"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";

interface CustomUserFields {
  subscribed?: string;
  subscriptionUpdatedAt?: string;
  displayName?: string | null;
  email?: string | null;
}

type CombinedUser = User & CustomUserFields;

interface AuthContextType {
  user: CombinedUser | null;
  authLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CombinedUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

useEffect(() => {
  let unsubscribeFirestore: (() => void) | null = null;

  const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    if (unsubscribeFirestore) {
      unsubscribeFirestore();
      unsubscribeFirestore = null;
    }

    if (firebaseUser && firebaseUser.email) {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", firebaseUser.email));
      
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          
          const mergedUser: CombinedUser = Object.assign(firebaseUser, {
            subscribed: data.subscribed,
            subscriptionUpdatedAt: data.subscriptionUpdatedAt,
            displayName: data.displayName || firebaseUser.displayName || "",
          });

          setUser(mergedUser);
        } else {
          setUser(firebaseUser as CombinedUser);
        }
        setAuthLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setAuthLoading(false);
      });
    } else {
      setUser(null);
      setAuthLoading(false);
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}, []);

  return (
    <AuthContext.Provider value={{ user, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};