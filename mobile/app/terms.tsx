import LegalDocumentScreen from '@/screens/LegalDocumentScreen';
import { TERMS_DOCUMENT } from '@/content/terms';

export default function TermsRoute() {
  return <LegalDocumentScreen document={TERMS_DOCUMENT} heading="使用條款" />;
}
