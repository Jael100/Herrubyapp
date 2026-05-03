import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase-server';

export async function GET(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const days = Math.min(Math.max(parseInt(searchParams.get('days') || '21', 10), 1), 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('body_logs')
      .select('log_date, symptoms')
      .eq('user_id', user.id)
      .gte('log_date', since.toISOString().slice(0, 10))
      .order('log_date', { ascending: true });
    if (error) throw error;

    return NextResponse.json({ logs: data || [] });
  } catch (err) {
    console.error('Body logs GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const symptoms = body?.symptoms || {};
    const logDate = body?.log_date || new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('body_logs')
      .upsert({ user_id: user.id, log_date: logDate, symptoms }, { onConflict: 'user_id,log_date' })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, log: data });
  } catch (err) {
    console.error('Body logs POST error:', err);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
