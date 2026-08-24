"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

export default function PlanSelector() {
    const plans = useMemo(
        () => [
            {
                id: "Premium Plus",
                name: "Premium Plus",
                price: "$99.99/year",
                description: "Includes 7-day free trial",
            },
            {
                id: "Premium",
                name: "Premium",
                price: "$9.99/month",
                description: "No trial period",
            },
            {
                id: "Basic",
                name: "Basic",
                price: "Free",
                description: "Restricted access",
            },
        ],
        [],
    );

    const router = useRouter();
    const { user, loading } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState("");

    useEffect(() => {
        if (user?.subscribed && !selectedPlan) {
            setSelectedPlan(
                plans.find((p) => p.name === user.subscribed)?.id || "",
            );
        }
    }, [user, selectedPlan, plans]);

    if (loading || !user) {
        return <>Checking subscription status...</>;
    }

    const confirmPlanSelection = async () => {
        if (!selectedPlan) {
            console.warn("No plan selected.");
            return;
        }

        if (!user?.uid) {
            console.error("No authenticated user found.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);

            await setDoc(
                userRef,
                {
                    subscribed: selectedPlan,
                    subscriptionUpdatedAt: new Date().toISOString(),
                    displayName: user.displayName || "",
                },
                { merge: true },
            );

            const previousPage = document.referrer;

            if (previousPage && previousPage.includes(window.location.origin)) {
                router.push(previousPage);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error("Error updating subscription:", error);
        }
    };

    const handleChange = (id) => {
        setSelectedPlan(id);
    };

    return (
        <div className="w-125 space-y-4 mt-8">
            {/* Subscription status */}
            {user.subscribed &&
                (user.subscribed === "Basic" ? (
                    <p className="text-red-400 font-bold">
                        You have no subscription. Please consider the following
                        options.
                    </p>
                ) : (
                    <p className="text-green-400 font-bold">
                        ✅ You are currently on our {user.subscribed} plan.
                    </p>
                ))}

            <h3 className="text-lg font-semibold">
                Choose The Plan That Fits You
            </h3>

            <div className="space-y-4">
                {plans.map((plan) => {
                    const isCurrentPlan = plan.name === user.subscribed;

                    return (
                        <div
                            key={plan.id}
                            className="flex flex-row items-center justify-between  border rounded"
                        >
                            <div className="flex flex-row items-center gap-6 ml-4 p-3">
                                <input
                                    type="radio"
                                    id={plan.id}
                                    name="plan"
                                    value={plan.id}
                                    checked={selectedPlan === plan.id}
                                    onChange={() => handleChange(plan.id)}
                                    disabled={isCurrentPlan}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <label
                                    htmlFor={plan.id}
                                    className="flex flex-col items-start text-left"
                                >
                                    <span className="font-semibold">
                                        {plan.name}
                                    </span>
                                    <span>{plan.price}</span>
                                    <span className="text-sm text-gray-500">
                                        {plan.description}
                                    </span>
                                </label>
                            </div>
                            <div className="flex justify-end items-end p-3 mr-4">
                                <span className="bg-green-400 text-white p-1 rounded-xl font-medium w-30 right-0">
                                    {isCurrentPlan
                                        ? "Current Plan"
                                        : "Available"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={confirmPlanSelection}
                disabled={
                    !selectedPlan ||
                    plans.find((p) => p.name === user.subscribed)?.id ===
                        selectedPlan
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
                {loading
                    ? "Processing..."
                    : selectedPlan === "Basic"
                      ? "Choose Premium or Premium Plus"
                      : selectedPlan === "Premium"
                        ? "Start your first month"
                        : "Start your 7-day free trial"}
            </button>
            {/* Info message */}
            <p className="mt-2 text-sm text-gray-600">
                {selectedPlan === "Basic"
                    ? ""
                    : selectedPlan === "Premium"
                      ? "30-day money back guarantee, no questions asked."
                      : "Cancel your trial at any time before it ends, and you won’t be charged."}
            </p>
        </div>
    );
}
