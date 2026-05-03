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
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + pack.credits;

    await supabase
      .from('wallets')
      .upsert({
        user_id: user.id,
        balance: newBalance,
        funding_source: 'self',
      }, { onConflict: 'user_id' });

    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'topup',
        credits: pack.credits,
        description: `Top-up: ${pack.label}`,
      });

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
