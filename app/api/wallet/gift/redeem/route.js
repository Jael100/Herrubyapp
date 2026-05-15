export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createServerClient, createAdminClient } from '../../../../../lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Gift code is required' }, { status: 400 });
    }

    // Find the gift code
    const { data: gift, error: giftError } = await supabase
      .from('gift_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (giftError || !gift) {
      return NextResponse.json({ error: 'Invalid gift code' }, { status: 404 });
    }

    if (gift.redeemed) {
      return NextResponse.json({ error: 'This gift code has already been redeemed' }, { status: 400 });
    }

    // Mark gift code as redeemed
    const { error: updateGiftError } = await supabase
      .from('gift_codes')
      .update({ redeemed: true, redeemed_by: user.id, redeemed_at: new Date().toISOString() })
      .eq('id', gift.id);

    if (updateGiftError) {
      console.error('Failed to update gift code:', updateGiftError);
      return NextResponse.json({ error: 'Failed to redeem gift code' }, { status: 500 });
    }

    // Use admin client for wallet mutations — bypasses RLS to ensure updates always succeed
    const admin = createAdminClient();

    // Add credits to wallet
    const { data: wallet } = await admin
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentBalance = wallet?.balance || 0;
    const newBalance = currentBalance + gift.credits;

    const { error: walletError } = await admin
      .from('wallets')
      .upsert({ user_id: user.id, balance: newBalance, funding_source: 'gift', updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (walletError) {
      console.error('Failed to update wallet balance:', walletError);
      return NextResponse.json({ error: 'Failed to update wallet balance' }, { status: 500 });
    }

    // Record transaction
    await admin.from('transactions').insert({
      user_id: user.id,
      type: 'gift_received',
      credits: gift.credits,
      description: `Gift redeemed: ${gift.credits} credits${gift.sender_email ? ` from ${gift.sender_email}` : ''}`,
      gift_code_id: gift.id,
    });

    return NextResponse.json({
      ok: true,
      credits: gift.credits,
      newBalance,
      message: gift.gift_message || null,
      senderEmail: gift.sender_email || null,
    });
  } catch (err) {
    console.error('Gift redeem error:', err);
    return NextResponse.json({ error: 'Failed to redeem gift code' }, { status: 500 });
  }
}
