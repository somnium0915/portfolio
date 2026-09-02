import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { SECTIONS, getSection } from '../consts';
import { withBase } from './path';

export type SectionCollection = (typeof SECTIONS)[number]['collection'];

/** 화면에서 다루기 쉬운 형태로 가공한 엔트리 */
export interface DecoratedEntry {
  id: string;
  collection: string;
  section: string;
  sectionLabel: string;
  href: string;
  data: CollectionEntry<CollectionKey>['data'];
  raw: CollectionEntry<CollectionKey>;
}

const isVisible = ({ data }: CollectionEntry<CollectionKey>) =>
  import.meta.env.PROD ? data.status !== 'draft' : true;

function byOrderThenDate(a: CollectionEntry<CollectionKey>, b: CollectionEntry<CollectionKey>) {
  const ao = a.data.order ?? Number.POSITIVE_INFINITY;
  const bo = b.data.order ?? Number.POSITIVE_INFINITY;
  if (ao !== bo) return ao - bo;
  return +new Date(b.data.date) - +new Date(a.data.date);
}

function decorate(collection: string, entry: CollectionEntry<CollectionKey>): DecoratedEntry {
  const section = getSection(collection);
  return {
    id: entry.id,
    collection,
    section: section?.slug ?? collection,
    sectionLabel: section?.label ?? collection,
    href: withBase(`${section?.slug ?? collection}/${entry.id}`),
    data: entry.data,
    raw: entry,
  };
}

/** 한 섹션의 엔트리를 정렬·필터해서 반환 */
export async function loadSection(collection: string): Promise<DecoratedEntry[]> {
  const entries = await getCollection(collection as CollectionKey, isVisible);
  return entries.sort(byOrderThenDate).map((e) => decorate(collection, e));
}

/** 모든 섹션을 합쳐 최신순으로 반환 */
export async function loadAll(): Promise<DecoratedEntry[]> {
  const lists = await Promise.all(SECTIONS.map((s) => loadSection(s.collection)));
  return lists.flat().sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date));
}

/** 홈 상단 "주요 작업" */
export async function loadFeatured(): Promise<DecoratedEntry[]> {
  return (await loadAll()).filter((e) => e.data.featured);
}

/** 태그 → 개수 맵 (섹션 목록 페이지의 필터 UI 용) */
export function tagCounts(entries: DecoratedEntry[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    for (const tag of e.data.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'));
}

export function formatDate(value: Date | string): string {
  const d = new Date(value);
  if (Number.isNaN(+d)) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export const LINK_META: Record<string, { label: string }> = {
  demo: { label: '데모' },
  repo: { label: '저장소' },
  notion: { label: '노션 원본' },
  figma: { label: 'Figma' },
  drive: { label: 'Drive' },
  video: { label: '영상' },
  docs: { label: '문서' },
};
