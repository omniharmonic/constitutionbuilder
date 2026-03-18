export function buildDraftReadyHtml(data: {
  sessionName: string;
  feedbackUrl: string;
}): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF9F7; padding: 40px 32px; border: 1px solid #D8D4CC; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1C1916; font-size: 24px; margin: 0;">Constitution Builder</h1>
      </div>

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        The draft constitution for <strong>${data.sessionName}</strong> is ready for your review.
      </p>

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        Your input during the survey phase has been synthesized into a draft document.
        Now we need your feedback — what feels right, what needs adjustment, and what's missing.
      </p>

      <p style="color: #6B6358; font-size: 14px; line-height: 1.6; background: #F5F0E8; padding: 16px; border-radius: 8px;">
        You'll have a guided conversation where you can review each section of the draft
        and share your thoughts. The conversation typically takes 10-20 minutes.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.feedbackUrl}"
           style="display: inline-block; background: #2B4C7E; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          Review the Draft
        </a>
      </div>

      <p style="color: #9C9585; font-size: 12px; text-align: center;">
        <a href="${data.feedbackUrl}" style="color: #2B4C7E;">${data.feedbackUrl}</a>
      </p>
    </div>
  `;
}
