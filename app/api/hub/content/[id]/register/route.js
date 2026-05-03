import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../../lib/supabase-server';

export async function POST(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { error } = await supabase
      .from('hub_registrations')
      .upsert({ user_id: user.id, content_id: id }, { onConflict: 'user_id,content_id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Hub register error:', err);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}
