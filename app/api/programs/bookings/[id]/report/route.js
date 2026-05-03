import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../../lib/supabase-server';

export async function PATCH(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = params?.id;
    const body = await req.json();
    const { report } = body || {};
    if (!report || typeof report !== 'string') {
      return NextResponse.json({ error: 'report is required' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('bookings')
      .update({ report, status: 'completed' })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, booking: data });
  } catch (err) {
    console.error('Booking report error:', err);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
