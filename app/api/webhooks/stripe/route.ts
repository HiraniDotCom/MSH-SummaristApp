import { NextResponse } from "next/server";
import Stripe from "stripe";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

const db = getFirestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia", // Matches your locked workspace version
});

export async function POST(req: Request) {
    const sig = req.headers.get("stripe-signature")!;
    const body = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!,
        );
    } catch (err: any) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 },
        );
    }

    try {
        switch (event.type) {
            /**
             * 1️⃣ Handle dynamic subscription creation tracking
             */
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;

                // Matches 'userId' payload passed from your update to app/api/checkout/route.ts
                const uid = session.metadata?.userId;

                // Fetch line items directly from stripe safely to evaluate what they bought
                const lineItems = await stripe.checkout.sessions.listLineItems(
                    session.id,
                );
                const priceId = lineItems.data[0]?.price?.id;

                if (uid && priceId) {
                    let subscriptionLevel = "Basic"; // Free Fallback

                    // Map the unique dashboard Price ID back to PlanSelector names
                    if (priceId === "price_1U4ODERtHSQGyQeibig9Zfem") {
                        // Replace with actual monthly price ID
                        subscriptionLevel = "Premium";
                    } else if (priceId === "price_1U4OBcRtHSQGyQeiSpUq2rJD") {
                        // Replace with actual yearly price ID
                        subscriptionLevel = "Premium Plus";
                    }

                    // Update the user doc to align with PlanSelector keys
                    await db.collection("users").doc(uid).set(
                        {
                            subscribed: subscriptionLevel,
                            subscriptionUpdatedAt: new Date().toISOString(),
                            stripeCustomerId: session.customer,
                        },
                        { merge: true },
                    );
                }
                break;
            }

            /**
             * 2️⃣ Handle subscription renewals, cancellations, and updates
             */
            case "customer.subscription.updated": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const priceId = subscription.items.data[0]?.price.id;

                let subscriptionLevel = "Basic";

                // If subscription status is active or trialing, update level
                if (
                    subscription.status === "active" ||
                    subscription.status === "trialing"
                ) {
                    if (priceId === "price_1U4ODERtHSQGyQeibig9Zfem")
                        subscriptionLevel = "Premium";
                    if (priceId === "price_1U4OBcRtHSQGyQeiSpUq2rJD")
                        subscriptionLevel = "Premium Plus";
                }

                const usersRef = db.collection("users");
                const snapshot = await usersRef
                    .where("stripeCustomerId", "==", customerId)
                    .get();

                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    await userDoc.ref.set(
                        {
                            subscribed: subscriptionLevel,
                            subscriptionUpdatedAt: new Date().toISOString(),
                        },
                        { merge: true },
                    );
                }
                break;
            }

            /**
             * 3️⃣ Handle invoice payment failures or explicit subscription deletions
             */
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const usersRef = db.collection("users");
                const snapshot = await usersRef
                    .where("stripeCustomerId", "==", customerId)
                    .get();

                if (!snapshot.empty) {
                    const userDoc = snapshot.docs[0];
                    await userDoc.ref.set(
                        {
                            subscribed: "Basic", // Revert back to the restricted Tier
                            subscriptionUpdatedAt: new Date().toISOString(),
                        },
                        { merge: true },
                    );
                }
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("❌ Error handling webhook:", error);
        return NextResponse.json(
            { error: "Webhook handler failed" },
            { status: 500 },
        );
    }
}
