import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase-server';

export async function DELETE(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { error } = await supabase
      .from('circle_members')
      .delete()
      .eq('user_id', user.id)
      .eq('circle_id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Circle leave error:', err);
    return NextResponse.json({ error: 'Failed to leave circle' }, { status: 500 });
  }
}
