import { getResendClient } from './client';

const FROM_ADDRESS = process.env.EMAIL_FROM || 'Constitution Builder <noreply@example.com>';

export async function sendInviteEmail(data: {
  to: string;
  sessionName: string;
  sessionDescription?: string;
  participantUrl: string;
}) {
  const resend = getResendClient();
  if (!resend) return; // Email not configured — skip silently

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: data.to,
    subject: `You're invited to help build a constitution for ${data.sessionName}`,
    html: buildInviteHtml(data),
  });
}

function buildInviteHtml(data: {
  sessionName: string;
  sessionDescription?: string;
  participantUrl: string;
}): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF9F7; padding: 40px 32px; border: 1px solid #D8D4CC; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1C1916; font-size: 24px; margin: 0;">Constitution Builder</h1>
      </div>

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        You've been invited to participate in building a constitution for
        <strong>${data.sessionName}</strong>.
      </p>

      ${data.sessionDescription ? `
        <p style="color: #6B6358; font-size: 14px; line-height: 1.6; background: #F5F0E8; padding: 16px; border-radius: 8px;">
          ${data.sessionDescription}
        </p>
      ` : ''}

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        You'll have a guided conversation with an AI facilitator that will help surface your
        ideas about governance, values, and structure. The conversation typically takes 15-30 minutes.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.participantUrl}"
           style="display: inline-block; background: #2B4C7E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          Begin Your Conversation
        </a>
      </div>

      <p style="color: #9C9585; font-size: 12px; text-align: center;">
        If the button doesn't work, copy and paste this link:<br/>
        <a href="${data.participantUrl}" style="color: #2B4C7E;">${data.participantUrl}</a>
      </p>
    </div>
  `;
}
