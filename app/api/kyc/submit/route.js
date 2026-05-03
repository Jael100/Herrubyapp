import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ kyc_status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updErr) {
      console.error('KYC submit update failed:', updErr);
      return NextResponse.json({ error: 'Failed to record submission' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, kyc_status: 'submitted' });
  } catch (err) {
    console.error('KYC submit error:', err);
    return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 });
  }
}
