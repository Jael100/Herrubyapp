import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase-server';

export async function POST(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    // Require KYC verified to join
    const { data: profile } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();
    if (profile?.kyc_status !== 'verified') {
      return NextResponse.json({ error: 'Identity verification required to join Circles' }, { status: 403 });
    }

    const { error } = await supabase
      .from('circle_members')
      .upsert({ user_id: user.id, circle_id: id }, { onConflict: 'user_id,circle_id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Circle join error:', err);
    return NextResponse.json({ error: 'Failed to join circle' }, { status: 500 });
  }
}
