type EmailMessage = {
  _id: string;
  subject: string;
};

type EmailFetchOptions = {
  retries?: number;
  delay?: number;
  exactMatch?: boolean;
};

/**
 * Fetches email content from Mailsac by searching for a specific subject
 * @param email - The email address to check
 * @param apiKey - Mailsac API key
 * @param subject - The subject to search for
 * @param options - Optional configuration for retries, delay and match type
 * @returns Promise<string> - The email content
 * @throws Error if email is not found after retries or if API calls fail
 */
export async function getEmailContent(
  email: string,
  apiKey: string,
  subject: string,
  options: EmailFetchOptions = {}
): Promise<string> {
  const { retries = 10, delay = 2000, exactMatch = false } = options;

  for (let i = 0; i < retries; i++) {
    try {
      // Get all messages for the email address
      const response = await fetch(`https://mailsac.com/api/addresses/${email}/messages`, {
        headers: {
          'Mailsac-Key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      }

      const messages: EmailMessage[] = await response.json();

      // Find the email with matching subject
      const targetEmail = messages.find((msg) =>
        exactMatch ? msg.subject === subject : msg.subject.includes(subject)
      );

      if (targetEmail) {
        // Get the full email content
        const fullEmailResponse = await fetch(`https://mailsac.com/api/text/${email}/${targetEmail._id}`, {
          headers: {
            'Mailsac-Key': apiKey,
          },
        });

        if (!fullEmailResponse.ok) {
          throw new Error(`Failed to fetch email content: ${fullEmailResponse.status} ${fullEmailResponse.statusText}`);
        }

        return await fullEmailResponse.text();
      }

      console.log(`Attempt ${i + 1}: Email with subject "${subject}" not found. Retrying...`);
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
    }

    // Wait before next retry
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error(`Email with subject "${subject}" not found after ${retries} attempts`);
}

/**
 * Extracts the verification token from an email content
 * @param emailContent The raw email content
 * @returns The verification token
 */
export async function extractCustomVerificationToken(emailContent: string): Promise<string> {
  // Look for the token in the verification URL
  const tokenMatch = emailContent.match(/token=([0-9a-f-]+)/i);

  if (!tokenMatch || !tokenMatch[1]) {
    throw new Error('Verification token not found in email');
  }

  return tokenMatch[1];
}

/**
 * Deletes all messages from the Mailsac Inbox
 * Ensures a clean inbox
 * @return 204
 * @throws Error if not authorized or other issue
 */
export async function cleanupMailsacInbox(email: string, apiKey: string): Promise<number> {
  const response = await fetch(`https://mailsac.com/api/addresses/${email}/messages`, {
    method: 'DELETE',
    headers: {
      'Mailsac-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error details available');
    throw new Error(`Failed to cleanup inbox (${response.status}): ${errorText}`);
  }

  return response.status;
}
