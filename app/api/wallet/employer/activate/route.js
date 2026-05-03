import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: 'Employer code is required' }, { status: 400 });
    }

    const { data: empCode, error: codeErr } = await supabase
      .from('employer_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();
    if (codeErr || !empCode) {
      return NextResponse.json({ error: 'Invalid employer code' }, { status: 404 });
    }
    if (!empCode.active) {
      return NextResponse.json({ error: 'This code is no longer active' }, { status: 400 });
    }
    if (empCode.expires_at && new Date(empCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This code has expired' }, { status: 400 });
    }
    if (empCode.max_uses && empCode.uses >= empCode.max_uses) {
      return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 });
    }

    // Already activated by this user?
    const { data: prior } = await supabase
      .from('employer_activations')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('employer_code_id', empCode.id)
      .maybeSingle();
    if (prior) {
      return NextResponse.json({ error: 'You have already activated this code' }, { status: 400 });
    }

    // Record activation, increment uses, credit wallet, log transaction
    const { error: actErr } = await supabase
      .from('employer_activations')
      .insert({ user_id: user.id, employer_code_id: empCode.id });
    if (actErr) throw actErr;

    await supabase
      .from('employer_codes')
      .update({ uses: (empCode.uses || 0) + 1 })
      .eq('id', empCode.id);

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    const newBalance = (wallet?.balance || 0) + empCode.credits;

    await supabase
      .from('wallets')
      .upsert({ user_id: user.id, balance: newBalance, funding_source: 'employer' }, { onConflict: 'user_id' });

    await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'employer',
        credits: empCode.credits,
        description: `Employer credits: ${empCode.employer_name}`,
      });

    return NextResponse.json({ ok: true, credits: empCode.credits, employer: empCode.employer_name, newBalance });
  } catch (err) {
    console.error('Employer activate error:', err);
    return NextResponse.json({ error: 'Failed to activate employer code' }, { status: 500 });
  }
}
