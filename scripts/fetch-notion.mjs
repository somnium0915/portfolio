/**
 * 노션 페이지 → src/content/analyses/<slug>.md 변환 스크립트.
 * (노션 문서는 분석서 섹션으로 통합됩니다)
 *
 * - `npm run build` 전에 자동 실행됩니다 (package.json 의 prebuild).
 * - 수동 실행: `npm run sync:notion`
 * - NOTION_TOKEN 이 없거나 notion.config.json 에 활성 항목이 없으면
 *   경고만 남기고 조용히 종료합니다 (사이트 빌드는 계속 진행).
 *
 * notion.config.json 에서 두 가지 방식을 지원합니다:
 *   1) folders[] : { parentPageId } 하위의 자식 페이지를 전부 자동 수집
 *                  → 노션에서 페이지만 추가하면 사이트에 자동 반영 (config 수정 불필요)
 *   2) pages[]   : { slug, pageId } 로 개별 페이지를 콕 집어 지정
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
const MAX_DEPTH = 4;

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

  const folders = (config.folders ?? []).filter(
    (f) => f && f.enabled !== false && f.parentPageId,
  );
  const explicitPages = (config.pages ?? []).filter(
    (p) => p && p.enabled !== false && p.slug && p.pageId,
  );
  if (folders.length === 0 && explicitPages.length === 0) {
    log('활성화된 노션 folders/pages 항목이 없습니다 — 건너뜁니다.');
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
  const usedSlugs = new Set();
  let hadError = false;

  // ── 1) folders[]: 부모 페이지 하위의 자식 페이지 자동 수집 ────────────────
  for (const folder of folders) {
    const parentId = clean(folder.parentPageId);
    try {
      const found = [];
      await collectChildPages(notion, parentId, folder.recursive === false ? 1 : MAX_DEPTH, found);
      if (found.length === 0) {
        warn(`folders: ${parentId} 하위에서 자식 페이지를 못 찾았습니다. 연결(Connections) 공유를 확인하세요.`);
      }
      for (const child of found) {
        await emitPage(child.id, {
          slug: folder.slugPrefix ? `${folder.slugPrefix}-${slugify(child.title)}` : slugify(child.title),
          title: child.title,
          category: folder.category,
          tags: folder.tags,
          featured: false,
        });
      }
    } catch (err) {
      hadError = true;
      console.error(`[notion] ✗ folder ${parentId}: ${err.message}`);
    }
  }

  // ── 2) pages[]: 개별 지정 ─────────────────────────────────────────────────
  for (const page of explicitPages) {
    await emitPage(clean(page.pageId), {
      slug: slugify(page.slug),
      title: page.title,
      summary: page.summary,
      category: page.category,
      tags: page.tags,
      featured: Boolean(page.featured),
    });
  }

  // ── 3) config 에서 빠진 자동생성 파일 정리 (마커 있는 것만) ────────────────
  for (const file of await readdir(OUT_DIR)) {
    if (!file.endsWith('.md') || file.startsWith('_') || written.has(file)) continue;
    const full = path.join(OUT_DIR, file);
    const content = await readFile(full, 'utf8').catch(() => '');
    if (/^generator:\s*["']?notion-sync/m.test(content)) {
      await unlink(full);
      log(`− ${file} (노션에서 사라짐 → 제거)`);
    }
  }

  if (hadError && STRICT) process.exitCode = 1;
  log(`동기화 완료: ${written.size}개 문서`);

  async function emitPage(pageId, opts) {
    let slug = opts.slug || pageId.slice(0, 8);
    if (usedSlugs.has(slug)) {
      let i = 2;
      while (usedSlugs.has(`${slug}-${i}`)) i += 1;
      slug = `${slug}-${i}`;
    }
    usedSlugs.add(slug);

    try {
      const meta = await notion.pages.retrieve({ page_id: pageId });
      const blocks = await n2m.pageToMarkdown(pageId);
      const body = n2m.toMarkdownString(blocks).parent ?? '';

      const frontmatter = buildFrontmatter({
        title: opts.title || notionTitle(meta) || slug,
        summary: opts.summary || '',
        date: iso(meta.created_time),
        updated: iso(meta.last_edited_time),
        tags: Array.isArray(opts.tags) ? opts.tags : [],
        featured: Boolean(opts.featured),
        sourceCategory: opts.category || 'Notion',
        notionUrl: meta.url || '',
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
}

/** parentId 하위의 child_page 블록을 depth 까지 재귀 수집 */
async function collectChildPages(notion, blockId, depth, out) {
  if (depth <= 0) return;
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of res.results) {
      if (block.type === 'child_page') {
        const title = block.child_page?.title?.trim() || block.id;
        out.push({ id: block.id, title });
        await collectChildPages(notion, block.id, depth - 1, out);
      }
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
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

/** 유니코드(한글 포함) 슬러그화: 공백/기호 → '-', 글자·숫자만 유지 */
function slugify(input) {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function clean(id) {
  return String(id).trim().replace(/-/g, '');
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
