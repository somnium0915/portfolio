const RAW_BASE = import.meta.env.BASE_URL || '/'; // 예: "/portfolio/" 또는 "/portfolio" 또는 "/"
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : `${RAW_BASE}/`;

/**
 * base 경로를 붙여 내부 링크를 만든다.
 *   withBase()                 → "/portfolio/"
 *   withBase('projects')       → "/portfolio/projects"
 *   withBase('projects/axis7') → "/portfolio/projects/axis7"
 */
export function withBase(pathname = ''): string {
  const clean = String(pathname).replace(/^\/+/, '');
  if (clean === '') return BASE;
  return `${BASE}${clean}`.replace(/\/{2,}/g, '/');
}

/** public/ 정적 자산용. asset('images/foo.png') → "/portfolio/images/foo.png" */
export function asset(pathname = ''): string {
  return withBase(pathname);
}

/** cover/미디어 경로를 렌더용 URL 로 변환 */
export function resolveMedia(src?: string): string | undefined {
  if (!src) return undefined;
  if (/^https?:\/\//.test(src) || src.startsWith('data:')) return src;
  // 이미 base(/portfolio/…) 가 붙어 있으면 (예: CMS 가 넣은 경로) 그대로 사용
  if (src.startsWith(BASE)) return src;
  return asset(src.replace(/^\//, ''));
}
