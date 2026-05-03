import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '../../../../../lib/supabase-server';

const PACKS = {
  p1: { credits: 5,  label: 'Starter — 5 credits' },
  p2: { credits: 10, label: 'Monthly — 10 credits' },
  p3: { credits: 20, label: 'Quarterly — 20 credits' },
};

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_intent_id, package_id, session_id } = await req.json();
    const pack = PACKS[package_id];
    if (!pack) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });

    // Verify the Stripe Checkout session is paid and belongs to this user
    const sid = session_id || payment_intent_id;
    if (!sid) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(sid);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }
    if (session.metadata?.user_id !== user.id) {
      return NextResponse.json({ error: 'Session does not belong to user' }, { status: 403 });
    }

    // Idempotency — skip if a transaction for this session already exists
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('description', `Top-up: ${pack.label} [${sid}]`)
      .maybeSingle();
    if (existing) {
      const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
      return NextResponse.json({ ok: true, alreadyApplied: true, newBalance: w?.balance ?? 0 });
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + pack.credits;

    await supabase
      .from('wallets')
      .upsert({ user_id: user.id, balance: newBalance, funding_source: 'self' }, { onConflict: 'user_id' });

    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'topup',
        credits: pack.credits,
        description: `Top-up: ${pack.label} [${sid}]`,
      });

    return NextResponse.json({ ok: true, credits: pack.credits, newBalance });
  } catch (err) {
    console.error('Top-up confirm error:', err);
    return NextResponse.json({ error: 'Failed to confirm top-up' }, { status: 500 });
  }
}
