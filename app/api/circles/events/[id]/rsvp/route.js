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
    const body = await req.json();
    const status = body?.status;
    if (!['going','maybe','not_going'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const { error } = await supabase
      .from('circle_event_rsvps')
      .upsert({ user_id: user.id, event_id: id, status }, { onConflict: 'user_id,event_id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('RSVP error:', err);
    return NextResponse.json({ error: 'Failed to RSVP' }, { status: 500 });
  }
}
