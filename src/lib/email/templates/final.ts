export function buildFinalConstitutionHtml(data: {
  sessionName: string;
  downloadUrl: string;
}): string {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF9F7; padding: 40px 32px; border: 1px solid #D8D4CC; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1C1916; font-size: 24px; margin: 0;">Constitution Builder</h1>
      </div>

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        The constitution for <strong>${data.sessionName}</strong> has been finalized.
      </p>

      <p style="color: #3D3731; font-size: 16px; line-height: 1.6;">
        Thank you for your contribution to this collaborative governance process.
        Your voice helped shape a document that reflects the collective wisdom
        and aspirations of your group.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.downloadUrl}"
           style="display: inline-block; background: #B8860B; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 500;">
          Download the Constitution
        </a>
      </div>

      <p style="color: #9C9585; font-size: 12px; text-align: center;">
        This is a living document. Refer to the amendment process in Section 4
        for how to propose changes.
      </p>
    </div>
  `;
}
