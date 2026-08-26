import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "../app/context/BookContext";
import { TextSizeProvider } from "./context/TextSizeContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Summarist Project",
    description: "Advanced Virtual Internship",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-x-hidden`}
        >
            <body className="h-screen m-0 p-0 bg-gray-50 overflow-x-hidden">
                <AuthProvider>
                    <BookProvider>
                        <TextSizeProvider>{children}</TextSizeProvider>
                    </BookProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
