import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase-server';

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name =
      body.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      '';
    const email = body.email || user.email || '';

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      const patch = {};
      if (!existing.name && name) patch.name = name;
      if (!existing.email && email) patch.email = email;
      if (Object.keys(patch).length === 0) {
        return NextResponse.json({ profile: existing });
      }
      const { data: updated, error: updErr } = await supabase
        .from('profiles')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
      if (updErr) throw updErr;
      return NextResponse.json({ profile: updated });
    }

    const { data: created, error: insErr } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name,
        email,
        kyc_status: 'pending',
        onboarding_complete: false,
      })
      .select()
      .single();
    if (insErr) throw insErr;
    return NextResponse.json({ profile: created });
  } catch (err) {
    console.error('Auth sync error:', err);
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
