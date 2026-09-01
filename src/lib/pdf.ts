import { resolveMedia } from './path';

export interface PdfDoc {
  label: string;
  /** iframe src — 파일이면 Drive /preview, 폴더면 embeddedfolderview */
  preview: string;
  /** 새 탭에서 열기 */
  open: string;
  /** 다운로드 URL (폴더는 '' — 다운로드 없음) */
  download: string;
  isDrive: boolean;
  isFolder: boolean;
}

type PdfInput = string | { url: string; label?: string };

/** Google Drive '폴더' 링크에서 폴더 ID 추출 */
function driveFolderId(raw: string): string | null {
  const m =
    raw.match(/\/drive\/folders\/([-\w]{20,})/) ||
    raw.match(/(?:embedded)?folderview\?id=([-\w]{20,})/);
  return m ? m[1] : null;
}

/** Google Drive '파일' 링크/ID 에서 파일 ID 추출 */
function driveFileId(raw: string): string | null {
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

  // 1) Drive 폴더 → 폴더 목록 임베드 (파일을 추가하면 자동 반영)
  const folderId = driveFolderId(raw);
  if (folderId) {
    return {
      label: explicitLabel || 'Drive 문서 폴더',
      preview: `https://drive.google.com/embeddedfolderview?id=${folderId}#list`,
      open: `https://drive.google.com/drive/folders/${folderId}`,
      download: '',
      isDrive: true,
      isFolder: true,
    };
  }

  // 2) Drive 개별 파일 → 인라인 미리보기
  const fileId = driveFileId(raw);
  if (fileId) {
    return {
      label: explicitLabel || 'PDF 문서',
      preview: `https://drive.google.com/file/d/${fileId}/preview`,
      open: `https://drive.google.com/file/d/${fileId}/view`,
      download: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isDrive: true,
      isFolder: false,
    };
  }

  // 3) public 경로 또는 일반 URL 의 PDF 파일
  const url = resolveMedia(raw) ?? raw;
  return {
    label: explicitLabel || filenameLabel(raw),
    preview: url,
    open: url,
    download: url,
    isDrive: false,
    isFolder: false,
  };
}

export function toPdfDocs(pdf: unknown): PdfDoc[] {
  if (!pdf) return [];
  const arr = Array.isArray(pdf) ? pdf : [pdf];
  return arr
    .filter((x): x is PdfInput => typeof x === 'string' || (!!x && typeof x === 'object'))
    .map(toPdfDoc);
}
