import { NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase-server';

const EVENTS = [
  { id: 'ev1', name: 'Gage Park Morning Walk',  circle: 'Morning Blossoms', date: 'Sat Mar 15', time: '9:00 AM',  total: 15, icon: '🚶‍♀️' },
  { id: 'ev2', name: 'Book Discussion — March', circle: 'Mind Matters',     date: 'Wed Mar 19', time: '4:00 PM',  total: 12, icon: '📚' },
  { id: 'ev3', name: 'Spring Potluck Lunch',    circle: 'Nourish Together', date: 'Sun Mar 23', time: '12:00 PM', total: 10, icon: '🥘' },
];

export async function GET(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: rsvps } = await supabase
      .from('circle_event_rsvps')
      .select('event_id, status')
      .eq('user_id', user.id);
    const myRsvp = Object.fromEntries((rsvps || []).map(r => [r.event_id, r.status]));

    // Aggregate "going" counts
    const ids = EVENTS.map(e => e.id);
    const { data: allRsvps } = await supabase
      .from('circle_event_rsvps')
      .select('event_id, status')
      .in('event_id', ids)
      .eq('status', 'going');
    const goingCounts = {};
    for (const r of allRsvps || []) goingCounts[r.event_id] = (goingCounts[r.event_id] || 0) + 1;

    return NextResponse.json({
      events: EVENTS.map(e => ({ ...e, going: goingCounts[e.id] || 0, my_status: myRsvp[e.id] || null })),
    });
  } catch (err) {
    console.error('Events list error:', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
