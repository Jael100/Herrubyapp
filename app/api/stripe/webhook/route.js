import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const PACKS = {
  p1: { credits: 5,  label: 'Starter — 5 credits' },
  p2: { credits: 10, label: 'Monthly — 10 credits' },
  p3: { credits: 20, label: 'Quarterly — 20 credits' },
};

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export async function POST(req) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

  let event;
  try {
    const sig = req.headers.get('stripe-signature');
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const admin = adminClient();
  if (!admin) {
    return NextResponse.json({ error: 'Server admin client not configured' }, { status: 503 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const meta = session.metadata || {};

      // Top-up flow
      if (meta.package_id && PACKS[meta.package_id] && meta.user_id && meta.purpose !== 'booking') {
        const pack = PACKS[meta.package_id];
        const desc = `Top-up: ${pack.label} [${session.id}]`;
        const { data: existing } = await admin
          .from('transactions')
          .select('id')
          .eq('user_id', meta.user_id)
          .eq('description', desc)
          .maybeSingle();
        if (!existing) {
          const { data: wallet } = await admin
            .from('wallets')
            .select('balance')
            .eq('user_id', meta.user_id)
            .single();
          const newBalance = (wallet?.balance || 0) + pack.credits;
          await admin
            .from('wallets')
            .upsert({ user_id: meta.user_id, balance: newBalance, funding_source: 'self' }, { onConflict: 'user_id' });
          await admin
            .from('transactions')
            .insert({ user_id: meta.user_id, type: 'topup', credits: pack.credits, description: desc });
        }
      }

      // Booking flow
      if (meta.purpose === 'booking' && meta.booking_id) {
        await admin
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', meta.booking_id)
          .eq('status', 'pending');
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
