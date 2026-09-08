import LegalDocumentScreen from '@/screens/LegalDocumentScreen';
import { PRIVACY_DOCUMENT } from '@/content/privacy';

export default function PrivacyRoute() {
  return (
    <LegalDocumentScreen document={PRIVACY_DOCUMENT} heading="隱私權政策" />
  );
}
