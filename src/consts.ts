/**
 * 사이트 전역 설정.
 * 화면에 보이는 문구(제목·소개·섹션 설명 등)는 `src/data/site.json` 에 있고,
 * 웹 편집기(/admin/ → "사이트 설정 · 메인 화면")에서 수정할 수 있습니다.
 */
import site from './data/site.json';

export const SITE = {
  /** <title> 및 OG 에 쓰이는 사이트 이름 */
  title: site.title,
  /** 메타 설명 (검색결과/SNS 미리보기) */
  description: site.description,
  /** 홈 화면 상단에 크게 표시되는 문구 */
  tagline: site.hero.tagline,
  /** 홈 화면 상단 소개 문단 */
  intro: site.hero.intro,
  /** 큰 문구 위 한 줄 (직무·이름) */
  role: (site.hero as { role?: string }).role ?? '',
  /** 헤더/푸터에 표시되는 이름 */
  author: site.author,
  /** 배포 최종 주소 (RSS/OG 절대경로 계산용). astro.config.mjs 의 site + base 와 일치해야 함 */
  url: 'https://somnium0915.github.io/portfolio',
  lang: 'ko',
} as const;

/** 홈의 "대표 작업" 블록 제목/부제 */
export const FEATURED = site.featured;

/** 홈의 "보유 기술" 블록 (제목/부제/항목). site.json 에서 편집 */
export interface Skill {
  name: string;
  /** 로고 이미지 경로(public 기준) 또는 절대 URL. 비우면 이니셜 플레이스홀더 */
  icon?: string;
  /** 클릭 시 이동할 링크(선택) */
  url?: string;
  /** 이 도구로 하는 일 (01 "사용 도구") */
  use?: string;
}
export const SKILLS = site.skills as {
  /** false 면 홈에서 블록 전체를 숨김 (항목 데이터는 유지) */
  enabled?: boolean;
  title: string;
  note?: string;
  items: Skill[];
};

/** 작업 영역 표의 칸 (프로젝트 frontmatter areas 의 키 → 화면 이름) */
export const AREAS: [string, string][] = [
  ['plan', '기획'],
  ['ui', 'UI'],
  ['system', '시스템'],
  ['dev', '구현'],
  ['release', '빌드·배포'],
];

/** 홈 "프로필" 블록 (site.json 의 profile). 이력서 대용 인적 사항 */
type TimelineItem = { period?: string; title: string; detail?: string };
export const PROFILE = (site as { profile?: unknown }).profile as
  | {
      photo?: string;
      name?: string;
      nameEn?: string;
      position?: string;
      birth?: string;
      location?: string;
      phone?: string;
      email?: string;
      education?: TimelineItem[];
      experience?: TimelineItem[];
      awards?: TimelineItem[];
      certificates?: TimelineItem[];
    }
  | undefined;

/** 홈 "이 문장을 고른 이유" 블록 (site.json 의 principles). 없으면 블록을 숨김 */
type TitledText = { title: string; text: string; href?: string };
export const PRINCIPLES = (site as { principles?: unknown }).principles as
  | {
      title: string;
      reason?: string;
      items?: TitledText[];
      methodTitle?: string;
      method?: TitledText[];
      casesTitle?: string;
      cases?: TitledText[];
    }
  | undefined;

/** 연락처 (site.json 의 contact). 웹 편집기 "사이트 설정"에서 수정 */
export const CONTACT = ((site as { contact?: { email?: string; github?: string } }).contact ??
  {}) as { email?: string; github?: string };

/** 푸터에 노출할 외부 링크 */
export const SOCIALS: { label: string; href: string }[] = CONTACT.github
  ? [{ label: 'GitHub', href: CONTACT.github }]
  : [];

/**
 * 포트폴리오 섹션 정의. label(메뉴 이름)·slug(주소)는 구조라 여기서 고정,
 * description(한 줄 설명)은 site.json 에서 편집합니다.
 *
 * 새 카테고리를 추가하려면:
 *   1) 여기에 항목 추가 (slug = 주소, collection = 폴더/컬렉션 이름)
 *   2) src/content/<collection>/ 폴더 + 마크다운
 *   3) src/content.config.ts 에 같은 이름의 컬렉션 정의
 * hidden: true 면 주소는 남기되 메뉴와 홈에는 보이지 않는다.
 */
export const SECTIONS = [
  {
    slug: 'projects',
    collection: 'projects',
    label: '프로젝트',
    description: site.sections.projects,
  },
  {
    slug: 'designs',
    collection: 'designs',
    label: '기획서',
    description: site.sections.designs,
    /** 기획서는 각 프로젝트 페이지 안에 넣는다. 메뉴·홈에는 따로 두지 않는다 */
    hidden: true,
  },
  {
    slug: 'analyses',
    collection: 'analyses',
    label: '분석서',
    description: site.sections.analyses,
  },
] as const;

export type SectionDef = (typeof SECTIONS)[number];

export const getSection = (slug: string) =>
  SECTIONS.find((s) => s.slug === slug || s.collection === slug);
