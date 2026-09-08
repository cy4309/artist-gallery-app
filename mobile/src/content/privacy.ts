export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subsections?: {
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
};

/** 對齊 frontend/app/privacy/page.tsx，並補 App Push 說明 */
export const PRIVACY_DOCUMENT: LegalDocument = {
  title: 'Privacy Policy',
  lastUpdated: '2025-12-18',
  sections: [
    {
      title: '1. Information We Collect',
      subsections: [
        {
          title: '1.1 Google Login Data',
          paragraphs: [
            'When you sign in with Google, we collect:',
          ],
          bullets: [
            'Your name',
            'Your email address',
            'Your Google profile photo',
            'Your Google account ID',
          ],
        },
        {
          title: '',
          paragraphs: ['We do not access:'],
          bullets: [
            'Your contacts',
            'Your Gmail',
            'Your Google Drive',
            'Your private Google Calendar events',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Only basic profile data is used for authentication and account identification.',
          ],
        },
        {
          title: '1.2 LINE Login Data',
          paragraphs: [
            'When you sign in with LINE, we may collect:',
          ],
          bullets: [
            'Your LINE user ID',
            'Your display name',
            'Your profile picture (if provided by LINE)',
          ],
        },
        {
          title: '',
          paragraphs: [
            'We do not access your chat history, contacts, or private messages on LINE.',
          ],
        },
        {
          title: '1.3 User Activity',
          bullets: [
            'The list of events you save as favorites',
            'Event-related metadata (title, date, location, link)',
            'Timestamps related to your account',
            'Basic logs for debugging (non-sensitive)',
          ],
        },
        {
          title: '1.4 App Notifications (Mobile)',
          paragraphs: [
            'If you enable event reminders in the App, we may store:',
          ],
          bullets: [
            'Your Expo Push Token',
            'Device platform (iOS / Android)',
            'Optional user ID when signed in',
          ],
        },
        {
          title: '1.5 Automatically Collected Data',
          bullets: [
            'Browser or app runtime type',
            'Device type',
            'General usage statistics',
          ],
        },
        {
          title: '',
          paragraphs: [
            'We do not use cookies for advertising or cross-site tracking.',
          ],
        },
      ],
    },
    {
      title: '2. How We Use Your Information',
      bullets: [
        'Authenticate your login (Google or LINE)',
        'Display your saved favorite events',
        'Send optional event reminder notifications (App)',
        'Maintain your account',
        'Improve website and app functionality',
      ],
      paragraphs: [
        'We do not sell or share your personal data with advertisers.',
      ],
    },
    {
      title: '3. Where Your Data Is Stored',
      paragraphs: ['Your data may be stored in:'],
      bullets: [
        'Google Apps Script (GAS) / Google Sheets',
        'Cloudflare Workers + D1 (when enabled as the data backend)',
      ],
    },
    {
      title: '',
      paragraphs: [
        'These systems are used only for this project and are not shared with unrelated third parties.',
      ],
    },
    {
      title: '4. Cookies & Local Storage',
      bullets: [
        'HTTP-only session cookies — for secure authentication on the website',
        'Public cookie (cyc_user) — used on the website to display profile and favorite status',
        'Secure local storage on the App — session and notification preferences',
      ],
      paragraphs: [
        'No tracking, advertising, or analytics cookies are used for cross-site advertising.',
      ],
    },
    {
      title: '5. Third-Party Services',
      bullets: [
        'Google OAuth',
        'LINE Login',
        'Expo Push Notifications (optional App reminders)',
        'Ministry of Culture Open Data API',
      ],
      paragraphs: [
        'We are not responsible for the privacy policies or accuracy of external services.',
      ],
    },
    {
      title: '6. Data Retention',
      paragraphs: [
        'We keep your data as long as your account exists.',
        'You may request data deletion at any time by contacting: cy4309@gmail.com',
      ],
    },
    {
      title: '7. Your Rights',
      bullets: [
        'Request deletion of your account data',
        'Request correction of incorrect information',
        'Stop using the service at any time',
      ],
    },
    {
      title: "8. Children's Privacy",
      paragraphs: [
        'CYC Zine does not target children under the age of 13 and does not knowingly collect data from minors.',
      ],
    },
    {
      title: '9. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The “Last updated” date will be revised accordingly.',
      ],
    },
    {
      title: '10. Contact',
      paragraphs: [
        'For any questions regarding this Privacy Policy, please contact: cy4309@gmail.com',
      ],
    },
  ],
};
