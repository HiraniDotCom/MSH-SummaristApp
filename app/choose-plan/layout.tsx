"use client";

import { Roboto, Roboto_Condensed } from "next/font/google";
import "@/app/globals.css";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import clsx from "clsx";
import { AuthProvider } from "../context/AuthContext";

const robotoSans = Roboto({
    variable: "--font-robot-sans",
    subsets: ["latin"],
});

const robotoCondensed = Roboto_Condensed({
    variable: "--font-roboto_condensed",
    subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen w-full overflow-x-hidden bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content wrapper */}
            <div
                className={clsx(
                    "flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300",
                    isOpen ? "pl-56 lg:pl-56" : "pl-0",
                )}
            >
                {/* Header */}
                <Header />

                {/* Scrollable content container */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 w-full max-w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AuthProvider>
                <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
        </SidebarProvider>
    );
}
