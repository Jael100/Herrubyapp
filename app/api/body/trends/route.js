import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase-server';

export async function GET(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const since = new Date();
    since.setDate(since.getDate() - 21);
    const { data, error } = await supabase
      .from('body_logs')
      .select('log_date, symptoms')
      .eq('user_id', user.id)
      .gte('log_date', since.toISOString().slice(0, 10))
      .order('log_date', { ascending: true });
    if (error) throw error;

    const logs = data || [];
    const keys = ['energy','brainfog','stress','sleep','hotflash','mood'];
    const weeks = [[], [], []];
    const today = new Date();
    for (const log of logs) {
      const d = new Date(log.log_date);
      const diffDays = Math.floor((today - d) / 86400000);
      const weekIdx = diffDays < 7 ? 0 : diffDays < 14 ? 1 : 2;
      weeks[weekIdx].push(log);
    }

    function avg(arr, key) {
      const vals = arr.map(l => l.symptoms?.[key]).filter(v => typeof v === 'number');
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }
    const trends = {};
    for (const k of keys) {
      trends[k] = { thisWeek: avg(weeks[0], k), lastWeek: avg(weeks[1], k), twoWeeksAgo: avg(weeks[2], k) };
    }

    return NextResponse.json({ trends, totalLogs: logs.length });
  } catch (err) {
    console.error('Body trends error:', err);
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
