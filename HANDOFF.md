# 작업 이어받기

다른 PC에서 이 포트폴리오 작업을 이어갈 때 읽는 문서다. 설치와 실행은 README.md, 디자인 결정은 DESIGN.md에 있다. 이 문서는 그 둘에 없는 작업 방식과 현재 상태를 적는다.

마지막 정리: 2026-11-26

> **다음 작업은 PLAN.md에 있다.** 2026-11-26 피드백으로 정한 개편 방향(UI·시스템 기준, 허즈버그와 카노 모델, 분석서 재분류, 이미지 확대, 다음 챕터 걸치기)과 미정 항목이다. 작업 전에 먼저 읽는다.

## 1. 새 PC에서 시작하기

```powershell
git clone https://github.com/somnium0915/portfolio.git
cd portfolio
npm install
npm run dev
```

- 미리보기: http://localhost:4321/portfolio/
- Node.js 20 이상. 이 문서를 쓴 PC는 v26.
- `NOTION_TOKEN`은 없어도 된다. 분석서는 이미 `src/content/analyses/`에 들어 있고, `import-once`라 빌드할 때 덮어쓰지 않는다.
- Claude Code로 작업한다면 시작할 때 이 문서, PLAN.md, DESIGN.md, README.md 순서로 읽게 한다.

## 2. 작업 규칙

- 답과 문구는 한국어로, 짧고 분명하게.
- **문서에 없는 이유를 지어내지 않는다.** 기획 의도나 판단 근거는 원본(Confluence, 기획서, UI 문서)에 있는 것만 쓴다. 확인 안 된 것은 쓰지 않거나 사용자에게 묻는다.
- **글을 쓰거나 고치면 마지막에 korean-humanizer 기준으로 점검한다.** 기준 문서: https://github.com/NomaDamas/k-skill/blob/main/docs/features/korean-humanizer.md (설치하지 않고 기준만 읽어서 쓴다). 줄표(—, –), 띄어 쓴 가운뎃점, "~을 통해", "~인 것이다", 문두 접속어 남발, 연결어미 뒤 쉼표를 특히 본다.
- 커밋과 푸시는 사용자가 말할 때만 한다. main에 푸시하면 GitHub Actions가 바로 GitHub Pages에 배포한다.
- 메인 화면 챕터(01~04)는 1440×900에서 각각 한 화면(840px)에 들어가야 한다. 문구를 늘리면 꼭 확인한다.
- 메인에는 AI 활용 문구를 넣지 않는다. 상세 페이지 구현 설명에는 써도 된다. AI 없으면 아무것도 못하는 사람처럼 읽히지 않게 한다.

## 3. 프로젝트 상세 페이지 구성

주인공은 기획 의도다. 구현은 의도를 보여 주는 예시일 뿐이다.

1. 맡은 역할
2. 기획서 (가볍게, 대표 그림)
3. 기획 의도 (`.intent-map` 칸. 누르면 해당 구현 절로 이동)
4. 의도를 구현한 방법 (의도마다 `###` 제목, `.why` 한 줄, 그림·표·`.change`·`.case`)
5. 세부 기획서 (`<details>`로 접은 원본 기획서)
6. 느낀 점

- 의도 이름을 바꾸면 `###` 제목과 `.intent-map`의 `href="#..."`를 같이 바꾼다. 앵커는 제목에서 자동으로 만들어진다(공백은 `-`, 마침표 같은 기호는 빠짐).
- 메인 대표 작업 카드 3줄은 frontmatter `highlights`. 형식은 `"의도: 적용 예"`이고, `: ` 앞이 굵게 나온다.
- 지금 게임에서 사라진 기능은 싣지 않는다 (예: R.A.M.P의 "승부의 긴장은 결과 화면까지"는 10-28에 뒤집혀서 뺐다).

## 4. 프로젝트별 현재 상태

### R.A.M.P (`src/content/projects/trillion-ramp.md`)

- 메인 3줄: 깔끔하고 직관적인 UI / 안내는 공간과 사물로 / 유저 인식의 고려. 메인에는 설문 수치를 넣지 않는다(상세에는 있음).
- 의도 6개: 난전 속에서도 0.1초 안에 읽혀야 한다, 늘 보이는 정보는 최소로, 유저 인식의 고려, 화면의 자리로 의미를 나눈다, 안내는 글이 아니라 공간과 사물로, 돈을 실시간으로 버는 실감.
- "유저 인식의 고려" 이야기 순서: 처음엔 Q(버프)가 오른쪽, 우클릭(마법)이 왼쪽 → Q는 왼손, 우클릭은 오른손이라 위치를 바꿈 → 스킬 칸을 오른쪽 아래 한곳에 모음 → 그 안에서도 Q 왼쪽, 우클릭 오른쪽. 최종 배치는 UI 문서 10-27 기록(오른쪽 아래 왼쪽부터 버프 Q, 마법 우클릭, 다음 칸)과 같다.
- 세부 UI 기획서는 Trillion 저장소 `docs/design/ui/ui.md` 1~7장을 다듬어 넣었다. "정해야 할 것" 목록은 뺐다.

### AXIS7 (`src/content/projects/axis7.md`)

- 의도 4개: 미끄러지는 손맛을 키보드로, 숙련자가 믿을 수 있는 정직한 판정, 처음 하는 사람도 첫 곡에서 막히지 않게, 만들기 전에 손맛부터 확인.
- 세부 기획서는 Google Drive "리듬게임 프로젝트/기획서/리듬게임_기획서"(Ver 0.1, 2026.07.16) 원문. "추후 작성"으로 비어 있던 항목은 뺐고, 가운데 레인 비교표에서 EZ2ON 1+6+1, DJMAX Respect V 두 줄은 사용자 요청으로 뺐다.

### 분석서 (`src/content/analyses/`)

- 노션에서 한 번 가져온 글(`import-once`). 2026-11-25에 korean-humanizer 기준으로 사이트 쪽 문구를 고쳤다(커밋 8322d5a). **노션 원문은 아직 그대로라 서로 다르다.** 노션을 고칠 때 아래 명령으로 바뀐 부분을 본다.

```powershell
git show 8322d5a -- src/content/analyses
```

## 5. 자료 위치

| 자료 | 위치 | 비고 |
| --- | --- | --- |
| R.A.M.P 코드와 문서 | Trillion 저장소 (`docs/design/ui/ui.md`, `docs/api/ui.md` 등) | 읽기만 한다. 그 저장소의 CLAUDE.md가 허락 없는 변경을 막는다 |
| R.A.M.P 작업 기록 | Confluence (projectdv0922), UI/UX 폴더 | "[UI] 작업 기록 (HISTORY)", "[UI 기록]" 페이지 |
| AXIS7 기획서, 채보·UI 설계 | Google Drive "리듬게임 프로젝트" 폴더 | 프로젝트 frontmatter `links.drive` |
| AXIS7 코드 | https://github.com/somnium0915/AXIS7 | |
| 원본 이미지 | 첫 PC의 `바탕화면/새 폴더 (2)/사진` ("덱에 들어간 이미지", "올려 주신 원본") | **git에 없다.** 새 그림이 필요하면 이 폴더를 옮겨 오거나 사용자에게 받는다 |

## 6. 그림 넣는 법

- 원본을 잘라 쓰지 않는다. 화질이 떨어지니 원본 파일을 받아서 쓴다.
- `public/images/projects/<ramp|axis7>/`에 webp로, 폭 최대 2000px.
- 변환은 astro에 딸려 설치되는 sharp로 한다.

```powershell
node -e "require('sharp')('원본.png').resize({width:2000,withoutEnlargement:true}).webp({quality:85}).toFile('public/images/projects/ramp/이름.webp')"
```

- 본문에서는 `/portfolio/images/projects/ramp/이름.webp`로 쓴다.

## 7. 남은 일

- 분석서 노션 원문을 사이트 문구에 맞게 고치기 (4절).
- AXIS7 의도 "처음 하는 사람도 첫 곡에서 막히지 않게"는 원문에 없는 이름이다. 맞는지 사용자 확인이 필요하다.
- R.A.M.P 세부 UI 기획서(M1 기준)에 Tab을 누르면 코인을 숨긴다는 예전 줄이 남아 있다. 지금 게임과 다르면 고친다.
- AXIS7 원문에서 뜻이 불분명해 뺀 줄: "Bad 범위 이후 입력 누적 시, 굿 판정으로 이어짐. (롱 노트)". 필요하면 사용자 확인 후 다시 넣는다.
