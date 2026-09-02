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
  /** 헤더/푸터에 표시되는 이름 */
  author: site.author,
  /** 배포 최종 주소 (RSS/OG 절대경로 계산용). astro.config.mjs 의 site + base 와 일치해야 함 */
  url: 'https://somnium0915.github.io/portfolio',
  lang: 'ko',
} as const;

/** 홈의 "주요 작업" 블록 제목/부제 */
export const FEATURED = site.featured;

/** 헤더/푸터에 노출할 외부 링크. 필요 없으면 줄을 지우세요. */
export const SOCIALS: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/Somnium0915' },
  // { label: 'Email', href: 'mailto:you@example.com' },
];

/**
 * 포트폴리오 섹션 정의. label(메뉴 이름)·slug(주소)는 구조라 여기서 고정,
 * description(한 줄 설명)은 site.json 에서 편집합니다.
 *
 * 새 카테고리를 추가하려면:
 *   1) 여기에 항목 추가 (slug = 주소, collection = 폴더/컬렉션 이름)
 *   2) src/content/<collection>/ 폴더 + 마크다운
 *   3) src/content.config.ts 에 같은 이름의 컬렉션 정의
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
