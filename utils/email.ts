export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In a real app, you would use an email service like SendGrid, Mailgun, etc.
  // For this example, we'll just log the email details
  console.log("Email sent:", options);
  
  // Implement actual email sending here
  // Example using an email service API would go here
  
  return true;
}

export function generateSuggestionEmailToLawmakers(
  suggestionTitle: string,
  suggestionDescription: string,
  authorName: string,
  upvotes: number
): EmailOptions {
  const subject = `Popular Citizen Suggestion: ${suggestionTitle}`;
  
  const body = `
    <h2>Popular Citizen Suggestion</h2>
    <p><strong>Title:</strong> ${suggestionTitle}</p>
    <p><strong>Submitted by:</strong> ${authorName}</p>
    <p><strong>Upvotes:</strong> ${upvotes}</p>
    <h3>Description:</h3>
    <p>${suggestionDescription}</p>
    <hr>
    <p>This suggestion has received significant support from citizens and is being forwarded for your consideration.</p>
    <p>Visit the platform to see more details and citizen comments.</p>
  `;
  
  return {
    to: "lawmakers@congress.gov.ph", // This would be configured in environment variables
    subject,
    body,
    isHtml: true
  };
}

export function generateUserApprovalEmail(userName: string, email: string): EmailOptions {
  return {
    to: email,
    subject: "Your Account Has Been Approved",
    body: `
      <h2>Account Approved</h2>
      <p>Hello ${userName},</p>
      <p>Your account on the Philippines Citizen Suggestion Platform has been approved!</p>
      <p>You can now log in and submit your suggestions for laws and regulations.</p>
      <p>Thank you for participating in improving our nation's governance.</p>
    `,
    isHtml: true
  };
}

export function generateSuggestionApprovalEmail(userName: string, email: string, suggestionTitle: string): EmailOptions {
  return {
    to: email,
    subject: "Your Suggestion Has Been Approved",
    body: `
      <h2>Suggestion Approved</h2>
      <p>Hello ${userName},</p>
      <p>Your suggestion "${suggestionTitle}" has been approved and is now visible on the platform.</p>
      <p>Other citizens can now see and vote on your suggestion.</p>
      <p>Thank you for your contribution!</p>
    `,
    isHtml: true
  };
}