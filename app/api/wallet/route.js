import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';

export async function GET(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      const { data: newWallet } = await supabase
        .from('wallets')
        .insert({ user_id: user.id, balance: 0, funding_source: 'self' })
        .select()
        .single();
      wallet = newWallet || { balance: 0, funding_source: 'self' };
    }

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      balance: wallet.balance,
      funding_source: wallet.funding_source,
      transactions: (transactions || []).map(t => ({
        date: new Date(t.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
        desc: t.description,
        credits: t.credits,
        type: t.type,
        icon: t.type === 'gift_received' ? '🎁' : t.type === 'topup' ? '💳' : t.type === 'employer' ? '💼' : t.type === 'redemption' ? '✦' : '◆',
        color: t.type === 'gift_received' ? '#8B9E6B' : t.type === 'topup' ? '#6B5B8A' : '#B8292F',
      })),
    });
  } catch (err) {
    console.error('Wallet GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
