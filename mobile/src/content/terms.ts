import { LegalDocument } from '@/content/privacy';

/** 對齊 frontend/app/terms/page.tsx */
export const TERMS_DOCUMENT: LegalDocument = {
  title: 'Terms of Use',
  lastUpdated: '2025-12-18',
  sections: [
    {
      title: '1. Acceptance of Terms',
      paragraphs: [
        'By accessing CYC Zine (website or mobile app) or using any features — including event browsing, saving favorites, and Google / LINE login — you agree to these Terms of Use.',
        'If you do not agree, please stop using the Service.',
      ],
    },
    {
      title: '2. Description of Service',
      paragraphs: ['CYC Zine provides:'],
      bullets: [
        'Browsing of Taiwan cultural events from public open data and related sources',
        'A user account system powered by Google and LINE login',
        'A personal Favorites collection feature',
        'Optional event reminder notifications in the App',
        'Editorial and interview content when available',
      ],
    },
    {
      title: '',
      paragraphs: [
        'This Service is provided for personal, non-commercial use.',
      ],
    },
    {
      title: '3. User Accounts',
      paragraphs: [
        'Certain features require you to sign in using Google OAuth or LINE Login. By using an account, you agree that:',
      ],
      bullets: [
        'You will not impersonate another person or entity',
        'You will provide accurate information (basic profile data only)',
        'You are responsible for activities under your account',
      ],
    },
    {
      title: '',
      paragraphs: [
        'You may request deletion of your account data at any time.',
      ],
    },
    {
      title: '4. Allowed Usage',
      paragraphs: ['You may use CYC Zine for:'],
      bullets: [
        'Viewing cultural and artistic events',
        'Saving and managing favorite events',
        'Browsing editorial and interview content',
      ],
    },
    {
      title: '5. Prohibited Actions',
      paragraphs: ['You agree not to:'],
      bullets: [
        'Attempt to hack, disrupt, or reverse engineer the Service',
        'Perform excessive scraping, crawling, or automated data access',
        'Upload or distribute harmful content, spam, or malware',
        'Misuse government open data for illegal or unauthorized purposes',
      ],
    },
    {
      title: '',
      paragraphs: [
        'CYC Zine reserves the right to suspend or terminate access for users who violate these rules.',
      ],
    },
    {
      title: '6. External Content & Links',
      paragraphs: [
        'Some content and links provided by CYC Zine originate from:',
      ],
      bullets: [
        'Taiwan Ministry of Culture open data',
        'Third-party event organizers or websites',
      ],
    },
    {
      title: '',
      paragraphs: [
        'CYC Zine does not guarantee the accuracy, availability, or safety of third-party content or external links.',
      ],
    },
    {
      title: '7. Intellectual Property',
      paragraphs: [
        'All original UI design, layout, branding, and custom content created by CYC Zine are protected by applicable copyright laws.',
        'Event data, images, and descriptions sourced from the Ministry of Culture remain subject to their respective open data licenses.',
      ],
    },
    {
      title: '8. Service Availability',
      paragraphs: [
        'CYC Zine is provided on a best-effort basis. We do not guarantee:',
      ],
      bullets: [
        'Continuous or uninterrupted availability',
        'Complete accuracy of all event data',
        'That errors or bugs will not occur',
      ],
    },
    {
      title: '',
      paragraphs: [
        'We may modify, suspend, or discontinue features at any time without prior notice.',
      ],
    },
    {
      title: '9. Limitation of Liability',
      paragraphs: [
        'The Service is provided “as is” without warranties of any kind.',
        'CYC Zine is not liable for:',
      ],
      bullets: [
        'Inaccurate or incomplete data from external sources',
        'Loss of saved favorites',
        'Service interruptions or technical issues',
        'Issues arising from third-party websites',
      ],
    },
    {
      title: '',
      paragraphs: ['Your use of the Service is at your own risk.'],
    },
    {
      title: '10. Changes to These Terms',
      paragraphs: [
        'We may update these Terms of Use from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms.',
      ],
    },
    {
      title: '11. Contact',
      paragraphs: [
        'For questions, feedback, or data removal requests, please contact: cy4309@gmail.com',
      ],
    },
  ],
};
