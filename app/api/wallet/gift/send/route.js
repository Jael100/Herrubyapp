export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerClient, createAdminClient } from '../../../../../lib/supabase-server';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function generateGiftCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RUBY-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

export async function POST(req) {
  try {
    const supabase = createServerClient(req);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, credits, message } = await req.json();
    if (!recipientEmail || !credits) {
      return NextResponse.json({ error: 'Recipient email and credits are required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Check sender has enough credits
    const { data: wallet } = await admin
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!wallet || wallet.balance < credits) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Generate gift code
    const code = generateGiftCode();
    const newBalance = wallet.balance - credits;

    // Create gift code record
    const { error: giftInsertError } = await admin.from('gift_codes').insert({
      code,
      credits,
      pack_id: 'gift',
      sender_email: user.email,
      recipient_email: recipientEmail,
      gift_message: message || null,
    });
    if (giftInsertError) {
      console.error('Failed to create gift code:', giftInsertError);
      return NextResponse.json({ error: 'Failed to create gift code' }, { status: 500 });
    }

    // Deduct from sender
    const { error: walletError } = await admin
      .from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    if (walletError) {
      console.error('Failed to deduct wallet balance:', walletError);
      return NextResponse.json({ error: 'Failed to deduct credits from wallet' }, { status: 500 });
    }

    // Record transaction for sender
    await admin.from('transactions').insert({
      user_id: user.id,
      type: 'gift_sent',
      credits: -credits,
      description: `Gift sent to ${recipientEmail}: ${credits} credits`,
    });

    // Send gift email
    let emailSent = false;
    let emailError = null;
    try {
      const resend = getResend();
      if (!resend) throw new Error('RESEND_API_KEY not configured');
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: recipientEmail,
        subject: 'Someone sent you a Her Ruby wellness gift!',
        html: `
          <div style="font-family: 'Georgia', serif; max-width: 520px; margin: 0 auto; padding: 40px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #B8292F; display: inline-flex; align-items: center; justify-content: center; font-size: 1.4rem; color: white; font-weight: 700;">♦</div>
            </div>
            <h1 style="font-size: 1.6rem; color: #2A2A35; text-align: center; margin-bottom: 16px;">You've received a wellness gift! 🎁</h1>
            <p style="font-size: 0.95rem; color: #6B6B7B; line-height: 1.8; text-align: center;">
              Someone special has gifted you <strong>${credits} Her Ruby wellness credits</strong>.
            </p>
            ${message ? `
              <div style="background: #FFF8F8; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-style: italic; color: #2A2A35; line-height: 1.7;">"${message}"</p>
              </div>
            ` : ''}
            <div style="background: #F8F6F3; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 0.85rem; color: #6B6B7B;">Your redemption code:</p>
              <p style="margin: 0; font-size: 1.6rem; font-weight: 700; color: #B8292F; letter-spacing: 0.1em;">${code}</p>
            </div>
            <p style="font-size: 0.9rem; color: #6B6B7B; line-height: 1.8; text-align: center;">
              Open the Her Ruby app, go to your Wallet, and enter this code to redeem your credits.
            </p>
            <p style="font-size: 0.85rem; color: #9B9BAB; text-align: center; margin-top: 32px;">
              With love,<br/>The Her Ruby Team<br/>🇨🇦 Ontario, Canada
            </p>
          </div>
        `,
      });
      emailSent = true;
    } catch (emailErr) {
      emailError = emailErr.message;
      console.error('Failed to send gift email:', emailErr);
    }

    return NextResponse.json({ ok: true, code, newBalance, emailSent, emailError });
  } catch (err) {
    console.error('Gift send error:', err);
    return NextResponse.json({ error: 'Failed to send gift' }, { status: 500 });
  }
}
