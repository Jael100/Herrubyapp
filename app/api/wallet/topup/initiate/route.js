import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase-server';

const PACKS = {
  p1: { credits: 5, price: 10000, label: 'Starter — 5 credits' },
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

    // For now, directly add credits (Stripe integration can be added later)
    // This simulates a successful top-up
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

    // Record transaction
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
      credits: pack.credits,
      newBalance,
    });
  } catch (err) {
    console.error('Top-up error:', err);
    return NextResponse.json({ error: 'Failed to process top-up' }, { status: 500 });
  }
}
