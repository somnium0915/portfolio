import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 웹 편집기(Sveltia CMS)는 비운 선택 필드를 `''` 또는 `null` 로 저장합니다.
 * 그대로 두면 `z.string().url()` 같은 검증에서 빌드가 깨지므로 undefined 로 정규화합니다.
 */
const opt = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

/** 비었으면 [] — 키 자체가 없거나 '' / null 이어도 안전 */
const optArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v == null || v === '' ? [] : v), z.array(schema));

/**
 * 모든 섹션이 공유하는 프론트매터 스키마.
 * 여기 필드를 추가하면 모든 컬렉션에서 바로 쓸 수 있습니다.
 */
const base = z.object({
  title: z.string(),
  summary: opt(z.string()),
  date: z.coerce.date(),
  updated: opt(z.coerce.date()),
  tags: optArray(z.string()),
  /** public/images/... 기준 경로, /portfolio/… 절대경로, 또는 https:// URL */
  cover: opt(z.string()),
  /** draft 는 프로덕션 빌드에서 목록/상세 모두 제외됩니다 */
  status: z.enum(['published', 'draft']).default('published'),
  /** 홈 상단 "주요 작업" 에 노출 */
  featured: z.boolean().default(false),
  /** 목록 정렬 우선순위 (작을수록 먼저, 없으면 날짜 내림차순) */
  order: opt(z.number()),
  /** 상세 페이지 상단 및 카드에 표시되는 바로가기 링크 */
  links: z
    .object({
      demo: opt(z.string().url()),
      repo: opt(z.string().url()),
      notion: opt(z.string().url()),
      figma: opt(z.string().url()),
      drive: opt(z.string().url()),
      video: opt(z.string().url()),
      docs: opt(z.string().url()),
    })
    .default({}),
  /**
   * 첨부 PDF. 상세 페이지에 "미리보기(클릭 시 로드) + 새 탭 + 다운로드" 로 렌더됩니다.
   * 값: Google Drive 링크/파일 ID/폴더 링크, 또는 public 경로/절대 URL.
   * 문자열 하나, 또는 { url, label } 배열.
   */
  pdf: z.preprocess(
    (v) => (v === '' || v === null ? undefined : v),
    z
      .union([
        z.string(),
        z.array(
          z.union([z.string(), z.object({ url: z.string(), label: opt(z.string()) })]),
        ),
      ])
      .optional(),
  ),
});

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/projects' }),
  schema: base.extend({
    role: opt(z.string()),
    team: opt(z.string()),
    period: opt(z.string()),
    stack: optArray(z.string()),
  }),
});

const designs = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/designs' }),
  schema: base.extend({
    game: opt(z.string()),
    docType: z.preprocess((v) => (v ? v : undefined), z.string().default('기획서')),
  }),
});

const analyses = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/analyses' }),
  schema: base.extend({
    subject: opt(z.string()),
    platform: opt(z.string()),
    /** 노션에서 가져온 문서의 원본 링크 (있으면 상세 페이지에 "노션 원본" 배너 표시) */
    notionUrl: opt(z.string().url()),
    /** 노션 문서 분류 (notion.config.json 의 category) */
    sourceCategory: opt(z.string()),
    /** notion-sync 스크립트가 생성한 파일 표시 (수동 작성 파일과 구분) */
    generator: opt(z.string()),
  }),
});

export const collections = { projects, designs, analyses };
