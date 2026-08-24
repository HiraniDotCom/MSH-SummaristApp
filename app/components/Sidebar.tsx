"use client";

import Link from "next/link";
import {
    MdOutlineHome,
    MdBookmarkBorder,
    MdSearch,
    MdSettings,
    MdOutlineHelpOutline,
} from "react-icons/md";
import { RiFontSize } from "react-icons/ri";
import { IoExitOutline } from "react-icons/io5";
import { TfiMarkerAlt } from "react-icons/tfi";
import { useAuth } from "@/app/context/AuthContext";
import { useSidebar } from "@/app/context/SidebarContext";
import clsx from "clsx";
import { useTextSize } from "@/app/context/TextSizeContext";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
    const { isOpen, close } = useSidebar();
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const firstSegment = pathname.split("/")[1] || "";
    const { textSize, setTextSize } = useTextSize();

    const handleLogoutClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            if (typeof logout === "function") {
                await logout();
            }
            sessionStorage.setItem("explicitly_logged_out", "true");
            window.location.href = '/';
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleTextSize = (size: string) => {
        setTextSize(size as any);
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={clsx(
                    "fixed inset-0 bg-gray-200 w-56 z-50 transition-opacity lg:hidden",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible",
                )}
                onClick={close}
            />

            {/* Sidebar */}
            <aside
                className={clsx(
                    `fixed top-0 left-0 min-h-screen w-56 bg-gray-200 text-black z-50 transition-transform duration-300 text-lg font-bold`,
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0",
                )}
            >
                {/* Close button for mobile */}
                <div className="lg:hidden flex justify-end p-4">
                    <button onClick={close}>Close X</button>
                </div>

                {/* Sidebar content */}

                <nav className="p-4 space-y-2">
                    <img src="/logo.png" alt="logo" className="mb-4 mt-4" />
                    <Link
                        href="/for-you"
                        className="block hover:bg-gray-400 p-2 rounded"
                    >
                        <MdOutlineHome className="inline text-2xl" /> For You
                    </Link>
                    <Link
                        href="/mylibrary"
                        className="block hover:bg-gray-400 p-2 rounded"
                    >
                        <MdBookmarkBorder className="inline text-2xl" /> My
                        Library
                    </Link>
                    <a
                        href="#"
                        className="block hover:bg-gray-400 p-2 rounded cursor-not-allowed"
                    >
                        <TfiMarkerAlt className="inline text-2xl" /> Highlights
                    </a>
                    <a
                        href="#"
                        className="block hover:bg-gray-400 p-2 rounded cursor-not-allowed"
                    >
                        <MdSearch className="inline text-2xl" /> Search
                    </a>
                    {firstSegment === "player" ? (
                        <a className="block p-2 rounded ">
                            <RiFontSize
                                onClick={() => handleTextSize("text-sm")}
                                className="inline hover:bg-gray-400 text-xl mr-4"
                            />
                            <RiFontSize
                                onClick={() => handleTextSize("text-base")}
                                className="inline hover:bg-gray-400 text-2xl mr-4"
                            />
                            <RiFontSize
                                onClick={() => handleTextSize("text-lg")}
                                className="inline hover:bg-gray-400 text-3xl mr-4"
                            />
                            <RiFontSize
                                onClick={() => handleTextSize("text-xl")}
                                className="inline hover:bg-gray-400 text-4xl"
                            />
                        </a>
                    ) : null}
                    <div className="fixed bottom-20 font-bold space-y-2 ">
                        <a
                            href="/settings"
                            className="block hover:bg-gray-400 p-2 rounded"
                        >
                            <MdSettings className="inline text-2xl" /> Settings
                        </a>
                        <a
                            href="#"
                            className="block hover:bg-gray-400 p-2 rounded cursor-not-allowed"
                        >
                            <MdOutlineHelpOutline className="inline text-2xl" />{" "}
                            Help & Support
                        </a>
                        {user ? (<button
                            onClick={handleLogoutClick}
                            className="block hover:bg-gray-400 p-2 rounded"
                        >
                            <IoExitOutline className="inline" /> Log Out
                        </button>) : (<a
                            href="/login"
                            className="block hover:bg-gray-400 p-2 rounded"
                        >
                            <IoExitOutline className="inline" /> Log In
                        </a>)}
                        
                    </div>
                </nav>
            </aside>
        </>
    );
}
