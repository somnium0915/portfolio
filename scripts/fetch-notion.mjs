/**
 * 노션 페이지 → src/content/analyses/<slug>.md 변환 스크립트.
 * (노션 문서는 분석서 섹션으로 통합됩니다)
 *
 * - `npm run build` 전에 자동 실행됩니다 (package.json 의 prebuild).
 * - 수동 실행: `npm run sync:notion`
 * - NOTION_TOKEN 이 없거나 notion.config.json 에 활성 페이지가 없으면
 *   경고만 남기고 조용히 종료합니다 (사이트 빌드는 계속 진행).
 *
 * 생성 파일에는 `generator: notion-sync` 프론트매터가 붙습니다. 이 스크립트는
 * 그 마커가 있는 파일만 관리(갱신·삭제)하므로, 손으로 쓴 분석서 .md 는 건드리지 않습니다.
 *
 * 실패해도 전체 빌드를 막지 않도록 기본적으로 exit 0 으로 끝냅니다.
 * CI 에서 노션 오류 시 빌드를 실패시키고 싶으면 STRICT_NOTION=1 환경변수를 주세요.
 */
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'src', 'content', 'analyses');
const CONFIG_PATH = path.join(ROOT, 'notion.config.json');
const STRICT = process.env.STRICT_NOTION === '1';

const log = (...a) => console.log('[notion]', ...a);
const warn = (...a) => console.warn('[notion]', ...a);

async function main() {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) {
    warn('NOTION_TOKEN 미설정 — 노션 동기화를 건너뜁니다.');
    return;
  }

  let config;
  try {
    config = JSON.parse(await readFile(CONFIG_PATH, 'utf8'));
  } catch (err) {
    warn(`notion.config.json 읽기 실패 (${err.message}) — 건너뜁니다.`);
    return;
  }

  const pages = (config.pages ?? []).filter(
    (p) => p && p.enabled !== false && p.slug && p.pageId,
  );
  if (pages.length === 0) {
    log('활성화된 노션 페이지가 없습니다 (enabled:true + slug + pageId 필요) — 건너뜁니다.');
    return;
  }

  // 의존성은 devDependency 라 빌드 환경에 따라 없을 수 있음 → 동적 import 로 안전하게.
  let Client, NotionToMarkdown;
  try {
    ({ Client } = await import('@notionhq/client'));
    ({ NotionToMarkdown } = await import('notion-to-md'));
  } catch (err) {
    warn(`노션 라이브러리 로드 실패 (${err.message}). \`npm install\` 후 다시 시도하세요 — 이번 빌드는 건너뜁니다.`);
    return;
  }

  const notion = new Client({ auth: token });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  await mkdir(OUT_DIR, { recursive: true });

  const written = new Set();
  let hadError = false;

  for (const page of pages) {
    const slug = String(page.slug).trim();
    const pageId = String(page.pageId).replace(/-/g, '').trim();
    try {
      const meta = await notion.pages.retrieve({ page_id: pageId });
      const blocks = await n2m.pageToMarkdown(pageId);
      const body = n2m.toMarkdownString(blocks).parent ?? '';

      const frontmatter = buildFrontmatter({
        title: page.title || notionTitle(meta) || slug,
        summary: page.summary || '',
        date: iso(meta.created_time),
        updated: iso(meta.last_edited_time),
        tags: Array.isArray(page.tags) ? page.tags : [],
        featured: Boolean(page.featured),
        sourceCategory: page.category || 'Notion',
        notionUrl: page.url || meta.url || '',
        generator: 'notion-sync',
      });

      await writeFile(path.join(OUT_DIR, `${slug}.md`), `${frontmatter}\n${body}\n`, 'utf8');
      written.add(`${slug}.md`);
      log(`✓ ${slug}`);
    } catch (err) {
      hadError = true;
      console.error(`[notion] ✗ ${slug}: ${err.message}`);
    }
  }

  // config 에서 빠진 (더 이상 관리하지 않는) "자동생성" 파일만 정리.
  // generator: notion-sync 마커가 없는 손으로 쓴 파일은 건드리지 않음.
  for (const file of await readdir(OUT_DIR)) {
    if (!file.endsWith('.md') || file.startsWith('_') || written.has(file)) continue;
    const full = path.join(OUT_DIR, file);
    const content = await readFile(full, 'utf8').catch(() => '');
    if (/^generator:\s*["']?notion-sync/m.test(content)) {
      await unlink(full);
      log(`− ${file} (config 에 없어 제거)`);
    }
  }

  if (hadError && STRICT) {
    process.exitCode = 1;
  }
}

function buildFrontmatter(obj) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => JSON.stringify(String(v))).join(', ')}]`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(String(value))}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function notionTitle(page) {
  const props = page.properties ?? {};
  for (const value of Object.values(props)) {
    if (value?.type === 'title') {
      return value.title.map((t) => t.plain_text).join('').trim() || null;
    }
  }
  return null;
}

function iso(ts) {
  if (!ts) return undefined;
  return String(ts).slice(0, 10);
}

main().catch((err) => {
  console.error('[notion] 예기치 못한 오류:', err);
  if (STRICT) process.exitCode = 1;
});
