"use client";

import { Roboto, Roboto_Condensed } from "next/font/google";
import "@/app/globals.css";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { TextSizeProvider } from "../context/TextSizeContext";
import Player from '@/app/components/Player';
import clsx from "clsx";

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
        <div className="flex min-h-screen">
            <Sidebar />
            <div
                className={clsx(
                    "flex flex-col flex-1 transition-all duration-300",
                    isOpen ? "ml-56" : "ml-0",
                )}
            >
                <div>
                    {/* Header */}
                    <Header />
                    <main className="flex-1 overflow-y-auto p-4 lg:ml-56">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <TextSizeProvider>
                <LayoutContent>{children}</LayoutContent>
            </TextSizeProvider>
            <Player />
        </SidebarProvider>
    );
}
