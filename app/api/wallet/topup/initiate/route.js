import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '../../../../../lib/supabase-server';

const PACKS = {
  p1: { credits: 5,  price: 10000, label: 'Starter — 5 credits' },
  p2: { credits: 10, price: 18000, label: 'Monthly — 10 credits' },
  p3: { credits: 20, price: 32000, label: 'Quarterly — 20 credits' },
};

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId } = await req.json();
    const pack = PACKS[packageId];
    if (!pack) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    // Real Stripe Checkout when secret key is configured
    if (stripeSecret) {
      const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' });
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'cad',
            product_data: { name: pack.label },
            unit_amount: pack.price,
          },
          quantity: 1,
        }],
        success_url: `${origin}/?topup=success&session_id={CHECKOUT_SESSION_ID}&pkg=${packageId}`,
        cancel_url: `${origin}/?topup=cancel`,
        metadata: { user_id: user.id, package_id: packageId, credits: String(pack.credits) },
      });
      return NextResponse.json({ ok: true, mode: 'stripe', checkoutUrl: session.url });
    }

    // Fallback: instant credit (sandbox / dev only)
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Wallet fetch error:', walletError);
      return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }

    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + pack.credits;

    const { error: updateError } = await supabase
      .from('wallets')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        funding_source: 'self',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Wallet update error:', updateError);
      return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
    }

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'topup',
        amount: pack.credits,
        description: `Top-up: ${pack.label}`,
        created_at: new Date().toISOString(),
      });

    if (txError) {
      console.error('Transaction insert error:', txError);
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      mode: 'instant',
      credits: pack.credits,
      newBalance,
    });
  } catch (err) {
    console.error('Top-up error:', err);
    return NextResponse.json({ error: 'Failed to process top-up' }, { status: 500 });
  }
}
