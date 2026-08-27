import { NextResponse } from "next/server";
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(secretKey, {
    apiVersion: "2026-07-29.dahlia", // Maintains your specific Stripe API version lock
});

export async function POST(request: Request) {
    try {
        if (!secretKey) {
            console.error(
                "❌ CRITICAL: STRIPE_SECRET_KEY is empty inside your .env.local file!",
            );
            return NextResponse.json(
                { error: "Server credential configuration missing." },
                { status: 500 },
            );
        }

        const body = await request.json();

        // 1. Destructure parameter variations gracefully
        const priceId = body.priceId;
        const userEmail = body.userEmail || body.email; // Fallback for 'email' from PlanSelector
        const userId = body.userId; // Essential for Firestore Webhook lookup tracking
        const redirectTo = body.redirectTo
            ? decodeURIComponent(body.redirectTo)
            : "/for-you";

        if (!priceId || priceId === "Basic" || priceId === "undefined") {
            return NextResponse.json(
                { error: "Invalid price selection key." },
                { status: 400 },
            );
        }

        if (!userEmail) {
            return NextResponse.json(
                { error: "Missing authenticating email identifier." },
                { status: 400 },
            );
        }

        // 2. Build the session incorporating client routing targets & user metadata tags
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            managed_payments: {
                enabled: false,
            },
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            // 💡 CRITICAL STEP: Metadata attaches the Firestore UID to the Stripe transaction record
            // so your webhook file can target users/{userId} correctly.
            metadata: {
                userId: userId || "",
            },
            success_url: `${request.headers.get("origin")}${redirectTo}`,
            cancel_url: `${request.headers.get("origin")}/choose-plan`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error("❌ STRIPE RUNTIME REJECTION:", error.message);
        return NextResponse.json(
            {
                error:
                    error.message ||
                    "Internal payment generation worker crashed.",
            },
            { status: 500 },
        );
    }
}
