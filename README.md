# 원성민 · 포트폴리오

게임 기획서 · 분석서 · 프로젝트를 모아두는 개인 포트폴리오 사이트입니다.
[Astro](https://astro.build) 로 만들었고 GitHub Pages 로 배포됩니다.

- **배포 주소**: https://somnium0915.github.io/portfolio/
- **콘텐츠 추가 = 마크다운 파일 1개 추가** (아래 참고)
- **노션 문서**는 빌드할 때 자동으로 가져와 사이트에 포함됩니다.

---

## 1. 처음 한 번만 하는 세팅

### 1-1. 로컬 실행

[Node.js 20 이상](https://nodejs.org) 을 설치한 뒤:

```bash
npm install
npm run dev
```

`http://localhost:4321/portfolio/` 에서 미리보기가 열립니다. 파일을 저장하면 자동 새로고침됩니다.

### 1-2. GitHub 저장소 만들기

1. GitHub 에서 **`portfolio`** 이름으로 새 저장소 생성 (Public).
   - 저장소 이름을 다르게 하려면 `astro.config.mjs` 의 `base` 와 `src/consts.ts` 의 `SITE.url` 도 같이 바꾸세요.
2. 이 폴더를 그대로 커밋해서 push:
   ```bash
   git init
   git add -A
   git commit -m "portfolio 초기 세팅"
   git branch -M main
   git remote add origin https://github.com/Somnium0915/portfolio.git
   git push -u origin main
   ```
   > `package-lock.json` 도 반드시 커밋에 포함되어야 합니다 (CI 의 `npm ci` 가 필요로 함).
3. 저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
4. push 하면 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포합니다.
   Actions 탭에서 진행 상황을 볼 수 있고, 끝나면 위 배포 주소에서 확인됩니다.

### 1-3. (선택) 노션 연동

노션 문서를 안 쓸 거면 이 단계는 건너뛰어도 됩니다. 사이트는 정상 동작합니다.

1. https://www.notion.so/my-integrations → **New integration** 생성 → *Internal Integration Secret* 복사 (`ntn_...`).
2. 가져올 노션 페이지마다: 페이지 우상단 **···** → **연결(Connections)** → 만든 integration 추가.
3. GitHub 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NOTION_TOKEN`
   - Value: 1번에서 복사한 값
4. 프로젝트 루트 `notion.config.json` 의 `pages` 배열에 항목 추가 (아래 3번 참고).
5. 로컬에서 테스트하려면 `.env.example` 을 `.env` 로 복사하고 `NOTION_TOKEN=` 에 값을 넣은 뒤 `npm run sync:notion`.

---

## 2. 새 프로젝트 / 기획서 / 분석서 추가하기

섹션별로 폴더가 있습니다:

| 섹션 | 폴더 | 주소 |
| --- | --- | --- |
| 프로젝트 | `src/content/projects/` | `/portfolio/projects/<파일명>` |
| 기획서 | `src/content/designs/` | `/portfolio/designs/<파일명>` |
| 분석서 | `src/content/analyses/` | `/portfolio/analyses/<파일명>` |

**추가 방법**: 각 폴더의 `_template.md` 를 복사해서 `영문-이름.md` 로 저장하고 내용을 채웁니다.
파일명이 그대로 URL 이 됩니다. 저장하면 목록/홈/태그 필터에 자동으로 반영됩니다.

밑줄(`_`)로 시작하는 파일은 빌드에서 무시됩니다 (템플릿 보관용).

### 프론트매터 필드 (모든 섹션 공통)

```yaml
title: 제목                 # 필수
summary: 한 줄 요약          # 카드/검색 미리보기
date: 2026-08-10            # 필수. 정렬 기준
updated: 2026-08-20         # 선택
tags: [Unity, 리듬게임]      # 선택
cover: images/foo.png       # 선택. public/images/ 기준 경로 또는 https:// URL
status: published           # published | draft(빌드에서 숨김)
featured: true              # 홈 상단 "주요 작업" 노출
order: 1                    # 선택. 작을수록 목록 위. 없으면 date 내림차순
links:                      # 선택. 있는 것만 적으면 버튼으로 노출
  demo: https://...
  repo: https://...
  figma: https://...
  drive: https://...
  video: https://...
  notion: https://...
  docs: https://...
pdf: https://drive.google.com/file/d/FILE_ID/view   # 선택. 아래 "PDF 첨부" 참고
```

섹션별 추가 필드는 각 `_template.md` 참고 (프로젝트: `role`/`team`/`period`/`stack`, 기획서: `game`/`docType`, 분석서: `subject`/`platform`).

### 이미지 넣기

`public/images/` 에 파일을 두고 `cover: images/파일명.png` 또는 본문에서 `![설명](/portfolio/images/파일명.png)` 로 참조합니다.

### PDF 첨부

상세 페이지 하단에 **[새 탭에서 열기] · [다운로드] + 클릭 시 로드되는 미리보기 패널**이 붙습니다.
미리보기 iframe 은 "미리보기 열기" 를 누르기 전까지 로드되지 않으므로 대용량 PDF 도 페이지 진입 속도에 영향이 없습니다.

**대용량(수십 MB)·다수 파일은 Google Drive 를 쓰세요.** 저장소에 커밋하면 히스토리가 영구히 커지고 GitHub 파일/대역폭 제한에 걸립니다.

```yaml
# 1) Drive 파일 링크 하나 — 파일(또는 상위 폴더)을 "링크가 있는 모든 사용자: 뷰어" 로 공유
pdf: https://drive.google.com/file/d/1AbCd.../view

# 2) 여러 개 + 라벨
pdf:
  - url: https://drive.google.com/file/d/1AbCd.../view
    label: 기획서 본편
  - url: https://drive.google.com/file/d/1EfGh.../view
    label: 부록 - 채보 데이터

# 3) Drive 폴더 링크 → 폴더 안 파일 목록이 통째로 임베드됨.
#    폴더에 파일을 추가하면 config 수정 없이 자동으로 나타남 (자료실 용도).
pdf: https://drive.google.com/drive/folders/1aaWZ...

# 4) 작은 파일이면 저장소에 직접 (public/docs/ 에 두고)
pdf: docs/summary.pdf

# 섞어 써도 됨
pdf:
  - url: https://drive.google.com/drive/folders/1aaWZ...
    label: 전체 문서 폴더
  - url: https://drive.google.com/file/d/1AbCd.../view
    label: 핵심 요약본
```

- **파일 링크** (`/file/d/<id>`, `open?id=`, 순수 ID) → 페이지 안에서 인라인 PDF 미리보기
- **폴더 링크** (`/drive/folders/<id>`) → Google 파일 탐색기 형태로 목록 임베드, 클릭 시 Drive 에서 열림
- 미리보기 iframe 은 "열기" 를 누르기 전까지 로드되지 않음 (대용량 대비)

---

## 3. 노션 문서 추가하기

노션 문서는 **분석서 섹션**(`/portfolio/analyses/<slug>`)으로 들어갑니다. `notion.config.json` 에서 두 방식을 지원합니다.

### 방식 A — 폴더 통째로 (권장)

부모 페이지 하나만 등록하면, 그 아래 자식 페이지를 **전부 자동으로** 가져옵니다.
노션에서 자식 페이지를 새로 만들면 config 수정 없이 다음 배포 때 사이트에 자동 반영됩니다.

```json
{
  "folders": [
    {
      "parentPageId": "부모-페이지-ID-32자리",
      "category": "레퍼런스 분석",
      "recursive": true,
      "enabled": true
    }
  ]
}
```

- 부모 페이지 **및 모든 자식 페이지**를 `portfolio` 연결에 공유해야 합니다 (부모에 공유하면 대개 자식도 상속).
- slug 는 각 페이지 제목에서 자동 생성됩니다 (한글 유지, 공백·기호는 `-`). 예: `키우기(방치형) 게임 장르 정리` → `/portfolio/analyses/키우기-방치형-게임-장르-정리`
- `recursive: false` 로 두면 바로 아래 1단계만 가져옵니다.
- `slugPrefix`: 모든 slug 앞에 접두어를 붙이고 싶을 때 (선택).

**`overrides` — 노션은 그대로 두고 사이트 표시만 바꾸기**

노션 페이지 제목/요약을 사이트에서만 다르게 보이고 싶을 때 (노션 원본은 안 건드림):

```json
{
  "folders": [{
    "parentPageId": "...",
    "overrides": {
      "키우기(방치형) 게임 장르 정리": {
        "title": "쿠키런 크럼블 분석",
        "summary": "키우기(방치형) 게임 장르 정리 - 키우기 게임의 흥행 이유와 장단점 분석"
      }
    }
  }]
}
```

- 키: 노션 **페이지 제목** (또는 페이지 ID). 값: `title` · `summary` · `slug` · `tags` · `featured` 중 덮어쓸 것만.
- `slug` 를 안 주면 새 `title` 기준으로 다시 생성됩니다 (위 예: `/portfolio/analyses/쿠키런-크럼블-분석`).
- 본문은 노션 내용 그대로입니다. 본문을 바꾸려면 노션 페이지를 수정하세요.

### 방식 B — 개별 페이지 지정

slug 를 직접 정하거나 특정 페이지만 골라 넣을 때:

```json
{
  "pages": [
    {
      "slug": "idle-game-genre",
      "pageId": "노션-페이지-ID-32자리",
      "title": "키우기(방치형) 게임 장르 정리",
      "category": "레퍼런스 분석",
      "tags": ["방치형", "장르분석"],
      "featured": false,
      "enabled": true
    }
  ]
}
```

두 방식은 함께 써도 됩니다. `enabled: false` 인 항목은 건너뜁니다.

### 반영

- 로컬 테스트: `.env` 에 `NOTION_TOKEN` 넣고 `npm run sync:notion` → `src/content/analyses/*.md` 생성 확인
- 배포: commit & push → CI 가 빌드 전에 자동으로 다시 가져옵니다 (`NOTION_TOKEN` secret 필요)

> 자동 생성 파일에는 `generator: notion-sync` 프론트매터가 붙습니다. 스크립트는 이 마커가 있는 파일만
> 갱신·삭제하므로, 손으로 쓴 분석서 `.md` 와 같은 폴더에 있어도 안전합니다. 자동 생성 파일은 직접 수정하지 마세요 — 다음 동기화 때 덮어써집니다.

---

## 4. 새 카테고리(섹션) 자체를 추가하고 싶을 때

예: "레벨디자인" 섹션 추가

1. `src/consts.ts` 의 `SECTIONS` 배열에 한 줄 추가:
   ```ts
   { slug: 'levels', collection: 'levels', label: '레벨디자인', description: '...' }
   ```
2. `src/content/levels/` 폴더 생성 + 마크다운 추가.
3. `src/content.config.ts` 에 컬렉션 정의 추가 (기존 `designs` 블록 복사해서 이름만 변경):
   ```ts
   const levels = defineCollection({
     loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/levels' }),
     schema: base.extend({ /* 필요한 추가 필드 */ }),
   });
   // ...
   export const collections = { projects, designs, analyses, levels };
   ```

목록 페이지·상세 페이지·헤더 메뉴·홈 노출은 자동으로 따라갑니다.

---

## 5. 자주 쓰는 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 로컬 개발 서버 |
| `npm run sync:notion` | 노션 → 마크다운 수동 동기화 |
| `npm run build` | 정적 사이트 빌드 (`dist/`), 빌드 전 노션 동기화 자동 실행 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run check` | 타입/템플릿 오류 검사 |

## 6. 폴더 구조

```
portfolio/
├─ .github/workflows/deploy.yml   # push → 자동 빌드·배포
├─ astro.config.mjs               # site / base 설정
├─ notion.config.json             # 가져올 노션 페이지 목록 (→ 분석서 섹션으로 통합)
├─ scripts/fetch-notion.mjs       # 노션 → src/content/analyses/*.md 변환
├─ public/                        # 정적 파일(images/, favicon 등)
└─ src/
   ├─ consts.ts                   # 사이트 이름·소개·섹션 정의
   ├─ content.config.ts           # 컬렉션 스키마(프론트매터 규칙)
   ├─ content/{projects,designs,analyses}/   # analyses 에 노션 동기화 문서도 포함
   ├─ components/                 # Card, CardGrid, FilterableGrid, Header, Footer
   ├─ layouts/BaseLayout.astro
   ├─ lib/                        # 경로 헬퍼, 콘텐츠 로더
   ├─ pages/
   │  ├─ index.astro              # 홈
   │  ├─ [section]/index.astro    # 섹션 목록 (자동)
   │  └─ [section]/[...slug].astro# 상세 (자동)
   └─ styles/global.css           # 디자인 토큰·전체 스타일
```
