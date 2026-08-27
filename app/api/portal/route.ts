import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-07-29.dahlia",
});

export async function POST(req: Request) {
    try {
        const { userId, stripeCustomerId } = await req.json();

        if (!userId || !stripeCustomerId) {
            return NextResponse.json({ error: "Missing required profile tokens." }, { status: 400 });
        }

        // Generate customer dashboard link
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/for-you`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (err: any) {
        console.error("Stripe Portal Routing Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
