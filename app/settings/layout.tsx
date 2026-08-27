"use client";

import "@/app/globals.css";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { SidebarProvider, useSidebar } from "@/app/context/SidebarContext";
import { AuthProvider } from "@/app/context/AuthContext";
import clsx from "clsx";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar();

    return (
        <div className="flex min-h-screen w-full bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content wrapper */}
            <div
                className={clsx(
                    "flex flex-col flex-1 min-w-0 min-h-screen transition-all duration-300",
                    "lg:pl-56",
                    isOpen ? "pl-56 lg:pl-56" : "pl-0",
                )}
            >
                {/* Header */}
                <Header />

                {/* Scrollable content container */}
                <main className="w-full max-w-full p-4 h-auto">{children}</main>
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
