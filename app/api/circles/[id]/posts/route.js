import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase-server';

export async function GET(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const { data: posts, error } = await supabase
      .from('circle_posts')
      .select('id, circle_id, user_id, text, topic, created_at')
      .eq('circle_id', id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    // Resolve author names + my likes
    const userIds = [...new Set((posts || []).map(p => p.user_id))];
    let authors = {};
    if (userIds.length) {
      const { data: profs } = await supabase.from('profiles').select('id, name').in('id', userIds);
      authors = Object.fromEntries((profs || []).map(p => [p.id, p.name]));
    }
    const postIds = (posts || []).map(p => p.id);
    let likeCounts = {};
    let likedByMe = {};
    if (postIds.length) {
      const { data: likes } = await supabase
        .from('circle_post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);
      for (const l of likes || []) {
        likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
        if (l.user_id === user.id) likedByMe[l.post_id] = true;
      }
    }
    const enriched = (posts || []).map(p => ({
      ...p,
      author: authors[p.user_id] || 'Member',
      likes: likeCounts[p.id] || 0,
      liked: !!likedByMe[p.id],
    }));
    return NextResponse.json({ posts: enriched });
  } catch (err) {
    console.error('Circle posts GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const body = await req.json();
    const text = (body?.text || '').trim();
    const topic = body?.topic || null;
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    // Member-only post
    const { data: member } = await supabase
      .from('circle_members')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('circle_id', id)
      .maybeSingle();
    if (!member) {
      return NextResponse.json({ error: 'Join the circle to post' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('circle_posts')
      .insert({ user_id: user.id, circle_id: id, text, topic })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, post: data });
  } catch (err) {
    console.error('Circle post POST error:', err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
