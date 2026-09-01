import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 모든 섹션이 공유하는 프론트매터 스키마.
 * 여기 필드를 추가하면 모든 컬렉션에서 바로 쓸 수 있습니다.
 */
const base = z.object({
  title: z.string(),
  summary: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  /** public/images/... 기준 경로 또는 절대 URL */
  cover: z.string().optional(),
  /** draft 는 프로덕션 빌드에서 목록/상세 모두 제외됩니다 */
  status: z.enum(['published', 'draft']).default('published'),
  /** 홈 상단 "주요 작업" 에 노출 */
  featured: z.boolean().default(false),
  /** 목록 정렬 우선순위 (작을수록 먼저, 없으면 날짜 내림차순) */
  order: z.number().optional(),
  /** 상세 페이지 상단 및 카드에 표시되는 바로가기 링크 */
  links: z
    .object({
      demo: z.string().url().optional(),
      repo: z.string().url().optional(),
      notion: z.string().url().optional(),
      figma: z.string().url().optional(),
      drive: z.string().url().optional(),
      video: z.string().url().optional(),
      docs: z.string().url().optional(),
    })
    .default({}),
  /**
   * 첨부 PDF. 상세 페이지에 "미리보기(클릭 시 로드) + 새 탭 + 다운로드" 로 렌더됩니다.
   * 값: Google Drive 링크/파일 ID (권장, 대용량), 또는 public 경로/절대 URL.
   * 문자열 하나, 또는 { url, label } 배열.
   */
  pdf: z
    .union([
      z.string(),
      z.array(
        z.union([
          z.string(),
          z.object({ url: z.string(), label: z.string().optional() }),
        ]),
      ),
    ])
    .optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/projects' }),
  schema: base.extend({
    role: z.string().optional(),
    team: z.string().optional(),
    period: z.string().optional(),
    stack: z.array(z.string()).default([]),
  }),
});

const designs = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/designs' }),
  schema: base.extend({
    game: z.string().optional(),
    docType: z.string().default('기획서'),
  }),
});

const analyses = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/analyses' }),
  schema: base.extend({
    subject: z.string().optional(),
    platform: z.string().optional(),
    /** 노션에서 가져온 문서의 원본 링크 (있으면 상세 페이지에 "노션 원본" 배너 표시) */
    notionUrl: z.string().url().optional(),
    /** 노션 문서 분류 (notion.config.json 의 category) */
    sourceCategory: z.string().optional(),
    /** notion-sync 스크립트가 생성한 파일 표시 (수동 작성 파일과 구분) */
    generator: z.string().optional(),
  }),
});

export const collections = { projects, designs, analyses };
