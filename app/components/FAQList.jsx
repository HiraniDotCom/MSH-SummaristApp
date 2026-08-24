"use client";

import { FaChevronDown } from "react-icons/fa";

export default function FAQList({
    question,
    answer,
    isOpen,
    onToggle,
    animating,
}) {
    return (
        <div className="border-b border-gray-200">
            {/* Question Row */}
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between py-4 text-left"
            >
                <span className="text-lg font-bold text-gray-800">
                    {question}
                </span>
                <FaChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Animated Answer */}
            <div
                className={`overflow-hidden ${
                    animating
                        ? isOpen
                            ? "animate-expand"
                            : "animate-collapse"
                        : isOpen
                          ? "max-h-125 opacity-100"
                          : "max-h-0 opacity-0"
                }`}
            >
                <p className="pb-4 text-sm text-gray-600">{answer}</p>
            </div>
        </div>
    );
}
