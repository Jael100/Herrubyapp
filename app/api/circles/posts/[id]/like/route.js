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
    const { data: existing } = await supabase
      .from('circle_post_likes')
      .select('post_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from('circle_post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, liked: false });
    }
    const { error } = await supabase
      .from('circle_post_likes')
      .insert({ post_id: id, user_id: user.id });
    if (error) throw error;
    return NextResponse.json({ ok: true, liked: true });
  } catch (err) {
    console.error('Like toggle error:', err);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
