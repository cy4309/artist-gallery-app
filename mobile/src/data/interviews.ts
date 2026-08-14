import { InterviewPerson, InterviewTag } from '../types/interview';

export const interviews: InterviewPerson[] = [
  {
    slug: 'wen-chia',
    name: 'Wen Chia',
    role: '樂團貝斯手',
    firm: 'Invincible Tapir',
    coverImage: '/images/hero/hero-1024-1024-96dpi/wen-chia.png',
    websiteSrc:
      'https://www.youtube.com/watch?v=EEkoPJh-CaY&ab_channel=%E5%AE%85%E7%94%B7',
    demoSrc: 'https://www.youtube.com/embed/EEkoPJh-CaY?autoplay=1&mute=1',
    tags: ['music', 'underground', 'indie'],
  },
  {
    slug: 'boan',
    name: 'Boan',
    role: '刺青藝術家',
    firm: 'GOODOLDDAYZ',
    coverImage: '/images/hero/hero-1024-1024-96dpi/boan.png',
    websiteSrc: 'https://cy4309.github.io/TFD105_01CYC/MainPage.html',
    demoSrc: 'https://cy4309.github.io/TFD105_01CYC/MainPage.html',
    tags: ['visual', 'tattoo', 'underground'],
  },
  {
    slug: 'lemon',
    name: 'Lemon',
    role: '樂團經紀人',
    firm: 'Freelancer',
    coverImage: '/images/hero/hero-1024-1024-96dpi/lemon.png',
    websiteSrc: 'https://hsuchristy.github.io/TFD105_32/index.html',
    demoSrc: 'https://www.instagram.com/p/C7eKB8UN4M5/embed',
    tags: ['music', 'artManagement', 'curation', 'photography'],
  },
  {
    slug: 'luke',
    name: 'Luke',
    role: '3D 動畫師',
    firm: 'ANYMACTION',
    coverImage: '/images/hero/hero-1024-1024-96dpi/luke.png',
    websiteSrc: 'https://anymaction.com',
    demoSrc:
      'https://www.youtube.com/embed/M-xazh9Gs-8?si=chYICE9eEBXtFZah&autoplay=1&mute=1',
    tags: ['visual', 'threeDAnimation', 'digitalArt'],
  },
];

export const INTERVIEW_TAG_GROUPS: {
  label: string;
  tags: InterviewTag[];
}[] = [
  { label: '類型', tags: ['music', 'visual'] },
  { label: '文化', tags: ['underground', 'indie'] },
  { label: '角色', tags: ['curation', 'artManagement'] },
  { label: '媒介', tags: ['tattoo', 'threeDAnimation', 'digitalArt', 'photography'] },
];

export const INTERVIEW_TAG_LABELS: Record<InterviewTag | 'all', string> = {
  all: '全部',
  music: '音樂',
  visual: '視覺',
  underground: '地下文化',
  indie: '獨立',
  curation: '策展',
  artManagement: '藝文經紀',
  tattoo: '刺青',
  threeDAnimation: '3D 動畫',
  digitalArt: '數位藝術',
  photography: '攝影',
};

export function getInterviewBySlug(slug: string): InterviewPerson | undefined {
  return interviews.find((item) => item.slug === slug);
}

export type InterviewFilterTag = InterviewTag | 'all';

export function filterInterviews(
  tag: InterviewFilterTag
): InterviewPerson[] {
  if (tag === 'all') return interviews;
  return interviews.filter((item) => item.tags.includes(tag));
}
