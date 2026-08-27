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
                stripePriceId: "price_1U4OBcRtHSQGyQeiSpUq2rJD",
            },
            {
                id: "Premium",
                name: "Premium",
                price: "$9.99/month",
                description: "No trial period",
                stripePriceId: "price_1U4ODERtHSQGyQeibig9Zfem",
            },
            {
                id: "Basic",
                name: "Basic",
                price: "Free",
                description: "Restricted access",
                stripePriceId: null,
            },
        ],
        [],
    );

    const router = useRouter();
    const { user, authLoading } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState("");
    const [stripeLoading, setStripeLoading] = useState(false);

    useEffect(() => {
        if (user?.subscribed && !selectedPlan) {
            setSelectedPlan(
                plans.find((p) => p.name === user.subscribed)?.id || "",
            );
        }
    }, [user, selectedPlan, plans]);

    if (authLoading || !user) {
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

        setStripeLoading(true);

        try {
            // SCENARIO 1: User selected their active current plan -> Open Stripe Billing Management Portal
            if (selectedPlan === user.subscribed && user.stripeCustomerId) {
                const res = await fetch("/api/portal", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: user.uid,
                        stripeCustomerId: user.stripeCustomerId,
                    }),
                });
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    console.error("Portal error:", data.error);
                }
                return;
            }

            // SCENARIO 2: User downgraded or manually selected the Free Basic plan
            if (selectedPlan === "Basic") {
                const userRef = doc(db, "users", user.uid);
                await setDoc(
                    userRef,
                    {
                        subscribed: "Basic",
                        subscriptionUpdatedAt: new Date().toISOString(),
                        displayName: user.displayName || "",
                    },
                    { merge: true },
                );
                router.push("/for-you");
                return;
            }

            // SCENARIO 3: User selected a paid premium subscription tier -> Redirect to Stripe Checkout Session
            const targetPlan = plans.find((p) => p.id === selectedPlan);
            if (!targetPlan?.stripePriceId) return;

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: targetPlan.stripePriceId,
                    userId: user.uid,
                    email: user.email,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("Checkout link processing failed:", data.error);
            }
        } catch (error) {
            console.error("Error setting up payment workflow session:", error);
        } finally {
            setStripeLoading(false);
        }
    };

    const handleChange = (id) => {
        setSelectedPlan(id);
    };

    // Determine the text labels on your dynamic submission buttons
    const getButtonText = () => {
        if (stripeLoading) return "Redirecting Securely...";
        if (selectedPlan === user.subscribed && selectedPlan !== "Basic") return "Manage Billing & Subscription";
        if (selectedPlan === "Basic") return "Downgrade to Free Basic Tier";
        if (selectedPlan === "Premium") return "Start your first month";
        return "Start your 7-day free trial";
    };

    const isActionDisabled = stripeLoading || !selectedPlan;

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
                disabled={isActionDisabled}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
                {getButtonText()}
            </button>

            {/* Sub-text information helpers */}
            <p className="mt-2 text-sm text-gray-600 min-h-[20px]">
                {selectedPlan === "Basic" ? "Free tier gives you access to open collections only." : 
                 selectedPlan === "Premium" ? "30-day money back guarantee, no questions asked." : 
                 selectedPlan === "Premium Plus" ? "Cancel your trial at any time before it ends, and you won’t be charged." : ""}
            </p>
        </div>
    );
}
