import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase-server';

const CIRCLES = [
  { id: '1', name: 'Morning Blossoms',   topic: 'Balance & Movement',     emoji: '🌸' },
  { id: '2', name: 'Nourish Together',   topic: 'Nutrition & Recipes',     emoji: '🥗' },
  { id: '3', name: 'Mind Matters',       topic: 'Cognitive Health',        emoji: '🧠' },
  { id: '4', name: 'Travel & Adventure', topic: 'Travel after 60',         emoji: '✈️' },
  { id: '5', name: 'Sleep Sisters',      topic: 'Sleep & Recovery',        emoji: '🌙' },
  { id: '6', name: 'Giving Back',        topic: 'Volunteering & Purpose',  emoji: '🤝' },
];

export async function GET(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: members } = await supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', user.id);
    const joined = new Set((members || []).map(m => m.circle_id));
    return NextResponse.json({ circles: CIRCLES.map(c => ({ ...c, joined: joined.has(c.id) })) });
  } catch (err) {
    console.error('Circles list error:', err);
    return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 });
  }
}
