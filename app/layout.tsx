import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { BookProvider } from "../app/context/BookContext";
import { TextSizeProvider } from "./context/TextSizeContext";

const robotoSans = Roboto({
    variable: "--font-robot-sans",
    subsets: ["latin"],
});

const robotoCondensed = Roboto_Condensed({
    variable: "--font-roboto_condensed",
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
            className={`${robotoSans.variable} ${robotoCondensed.variable} antialiased h-screen overflow-x-hidden`}
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
