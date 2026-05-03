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
      .from('hub_saves')
      .upsert({ user_id: user.id, content_id: id }, { onConflict: 'user_id,content_id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Hub save error:', err);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { error } = await supabase
      .from('hub_saves')
      .delete()
      .eq('user_id', user.id)
      .eq('content_id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Hub unsave error:', err);
    return NextResponse.json({ error: 'Failed to unsave' }, { status: 500 });
  }
}
