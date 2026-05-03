import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '../../../../lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { program_id, program_name, payment_method, price_cad, credits } = body || {};
    if (!program_id || !payment_method) {
      return NextResponse.json({ error: 'program_id and payment_method are required' }, { status: 400 });
    }

    // Free booking
    if (payment_method === 'free' || (price_cad === 0 && payment_method !== 'wallet')) {
      const { data: bk, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          program_id,
          program_name: program_name || program_id,
          payment_method: 'free',
          credits_spent: 0,
          amount_cents: 0,
          status: 'confirmed',
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, mode: 'free', booking: bk });
    }

    // Wallet booking — deduct credits server-side
    if (payment_method === 'wallet') {
      const creditsNeeded = Number(credits) || Math.ceil(Number(price_cad || 0) / 20);
      if (!creditsNeeded || creditsNeeded < 1) {
        return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
      }
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      const balance = wallet?.balance || 0;
      if (balance < creditsNeeded) {
        return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
      }
      const newBalance = balance - creditsNeeded;
      const { error: walletErr } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);
      if (walletErr) throw walletErr;

      const { data: bk, error: bkErr } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          program_id,
          program_name: program_name || program_id,
          payment_method: 'wallet',
          credits_spent: creditsNeeded,
          amount_cents: 0,
          status: 'confirmed',
        })
        .select()
        .single();
      if (bkErr) throw bkErr;

      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'booking_wallet',
        credits: -creditsNeeded,
        description: `Booking: ${program_name || program_id}`,
      });

      return NextResponse.json({ ok: true, mode: 'wallet', booking: bk, newBalance });
    }

    // Stripe checkout
    if (payment_method === 'stripe') {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
      }
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
      const amountCents = Math.round(Number(price_cad || 0) * 100 * 1.13); // include 13% HST
      if (!amountCents) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      }
      // Create a pending booking first so the webhook can confirm by id
      const { data: bk, error: bkErr } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          program_id,
          program_name: program_name || program_id,
          payment_method: 'stripe',
          credits_spent: 0,
          amount_cents: amountCents,
          status: 'pending',
        })
        .select()
        .single();
      if (bkErr) throw bkErr;

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'cad',
            product_data: { name: program_name || program_id },
            unit_amount: amountCents,
          },
          quantity: 1,
        }],
        success_url: `${origin}/?booking=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?booking=cancel&booking_id=${bk.id}`,
        metadata: {
          purpose: 'booking',
          user_id: user.id,
          booking_id: bk.id,
          program_id,
        },
      });

      await supabase
        .from('bookings')
        .update({ stripe_session_id: session.id })
        .eq('id', bk.id);

      return NextResponse.json({ ok: true, mode: 'stripe', checkoutUrl: session.url, booking_id: bk.id });
    }

    return NextResponse.json({ error: 'Unsupported payment method' }, { status: 400 });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
