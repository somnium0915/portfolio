/**
 * 사이트 전역 설정. 대부분의 "내용" 수정은 이 파일과 src/content/ 안의 마크다운만 건드리면 됩니다.
 */

export const SITE = {
  /** <title> 및 OG 에 쓰이는 사이트 이름 */
  title: '원성민 · 포트폴리오',
  /** 메타 설명 (검색결과/SNS 미리보기) */
  description: '게임 기획서, 분석서, 프로젝트 아카이브',
  /** 홈 화면 상단에 크게 표시되는 소개 문구 */
  tagline: '게임을 기획하고, 시스템으로 구현합니다.',
  intro:
    '기획 문서부터 Unity 구현, 빌드·배포까지 직접 다루며 만든 결과물을 모아둔 공간입니다. 아래 섹션에서 프로젝트와 문서를 살펴볼 수 있습니다.',
  author: '원성민',
  /** 배포 최종 주소 (RSS/OG 절대경로 계산용). astro.config.mjs 의 site + base 와 일치해야 함 */
  url: 'https://somnium0915.github.io/portfolio',
  lang: 'ko',
} as const;

/** 헤더/푸터에 노출할 외부 링크. 필요 없으면 줄을 지우세요. */
export const SOCIALS: { label: string; href: string }[] = [
  { label: 'GitHub', href: 'https://github.com/Somnium0915' },
  // { label: 'Email', href: 'mailto:you@example.com' },
  // { label: 'Blog', href: 'https://...' },
];

/**
 * 포트폴리오 섹션 정의.
 *
 * 새 카테고리를 추가하려면:
 *   1) 여기에 항목 추가 (slug = 주소, collection = 아래 3번의 폴더/키 이름)
 *   2) src/content/<collection>/ 폴더 생성 + 마크다운 파일 추가
 *   3) src/content.config.ts 에 같은 이름의 컬렉션 정의 추가
 * 목록 페이지·상세 페이지·홈 노출은 자동으로 따라갑니다.
 */
export const SECTIONS = [
  {
    slug: 'projects',
    collection: 'projects',
    label: '프로젝트',
    description: '직접 만들었거나 참여한 게임 · 툴 프로젝트',
  },
  {
    slug: 'designs',
    collection: 'designs',
    label: '기획서',
    description: '게임 디자인 문서 · 시스템 기획 · 채보/레벨 설계',
  },
  {
    slug: 'analyses',
    collection: 'analyses',
    label: '분석서',
    description: '레퍼런스 게임 분석 · 시장 조사 · 시스템 리버스 엔지니어링',
  },
  {
    slug: 'notion',
    collection: 'notion',
    label: 'Notion',
    description: '노션에 작성한 문서를 그대로 가져온 아카이브',
  },
] as const;

export type SectionDef = (typeof SECTIONS)[number];

export const getSection = (slug: string) =>
  SECTIONS.find((s) => s.slug === slug || s.collection === slug);
