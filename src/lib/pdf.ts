import { resolveMedia } from './path';

export interface PdfDoc {
  label: string;
  /** iframe src (Drive 는 /preview) */
  preview: string;
  /** 새 탭에서 열기 */
  open: string;
  /** 다운로드 (Drive 는 강제 다운로드 URL) */
  download: string;
  isDrive: boolean;
}

type PdfInput = string | { url: string; label?: string };

/** Google Drive 링크/ID 에서 파일 ID 추출 */
function driveId(raw: string): string | null {
  const m = raw.match(/\/file\/d\/([-\w]{20,})/) || raw.match(/[?&]id=([-\w]{20,})/);
  if (m) return m[1];
  // 하이픈/영숫자만으로 된 순수 ID (URL 도 확장자도 아님)
  if (!/[/\s.]/.test(raw) && /^[-\w]{20,}$/.test(raw)) return raw;
  return null;
}

function filenameLabel(raw: string): string {
  try {
    const p = new URL(raw, 'https://x/').pathname;
    const base = decodeURIComponent(p.split('/').filter(Boolean).pop() || '');
    return base.replace(/\.pdf$/i, '') || 'PDF 문서';
  } catch {
    return 'PDF 문서';
  }
}

export function toPdfDoc(input: PdfInput): PdfDoc {
  const raw = (typeof input === 'string' ? input : input.url).trim();
  const explicitLabel = typeof input === 'object' ? input.label?.trim() : undefined;
  const id = driveId(raw);

  if (id) {
    return {
      label: explicitLabel || 'PDF 문서',
      preview: `https://drive.google.com/file/d/${id}/preview`,
      open: `https://drive.google.com/file/d/${id}/view`,
      download: `https://drive.google.com/uc?export=download&id=${id}`,
      isDrive: true,
    };
  }

  const url = resolveMedia(raw) ?? raw;
  return {
    label: explicitLabel || filenameLabel(raw),
    preview: url,
    open: url,
    download: url,
    isDrive: false,
  };
}

export function toPdfDocs(pdf: unknown): PdfDoc[] {
  if (!pdf) return [];
  const arr = Array.isArray(pdf) ? pdf : [pdf];
  return arr
    .filter((x): x is PdfInput => typeof x === 'string' || (!!x && typeof x === 'object'))
    .map(toPdfDoc);
}
