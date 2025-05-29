import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    });

    return NextResponse.json(session);
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Stripe session fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  console.error('Unknown error fetching Stripe session:', err);
  return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
}
}
