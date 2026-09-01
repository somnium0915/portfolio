---
title: AXIS7 — 7키 리듬게임
summary: Unity로 개발한 7키 건반형 리듬게임. Figma UI를 씬으로 옮기는 파이프라인, 그루브 게이지, 튜토리얼, 자체 채보 에디터를 AI를 활용해 구현하고 WebGL로 배포했습니다.
date: 2026-08-10
updated: 2026-08-10
tags:
  - Unity
  - 리듬게임
  - WebGL
  - 개인프로젝트
cover: ''
status: published
featured: true
order: 1
links:
  demo: https://somnium0915.github.io/AXIS7/
  repo: https://github.com/somnium0915/AXIS7
  figma: https://www.figma.com/design/D8hQ2C0kmarTMOXhGqyT0C/AXIS7_UI
  drive: https://drive.google.com/drive/folders/1LLfjBaMB5DJTLN7imjUIXZKXqKIb0LwV
  video: ''
  notion: ''
  docs: ''
pdf: []
role: 프로그래밍 · 시스템 구현 · 빌드/배포 · 버전관리
team: 7emp0 (2인) — 원성민(기획·프로그래밍), 박원균(UI/UX·채보·사운드)
period: 2026.07 – 2026.08 · NAN 2026 해커톤 제출
stack:
  - Unity 6000.3
  - C#
  - URP
  - WebGL
  - Figma
---

## 개요

**AXIS7**은 S·D·F·SPACE·K·L·; 7개 키를 쓰는 건반형 리듬게임입니다. NAN 2026 해커톤에 팀 **7emp0**(2인)로 제출했으며, 저는 클라이언트 프로그래밍 전반과 빌드·배포·버전관리를 맡았습니다.

일반 / 롱 / 슬라이드 / 혼합 4종 노트, 판정 HUD, 그루브 게이지(체력), 결과 화면, 첫 실행 튜토리얼을 갖추고 있으며 WebGL 빌드를 GitHub Pages로 배포했습니다.

## 맡은 역할

- **Figma → Unity UI 파이프라인**: 디자인 시안의 절대 좌표(1920×1080)를 `Canvas_Gameplay` 자식의 앵커 비율로 환산해 배치. SVG 시안을 브라우저 canvas로 PNG 래스터화해 기존 노트 이미지와 동일한 파이프라인으로 임포트.
- **노트/판정 시스템**: `NoteSpawner`·`NoteView` 계열. 레인별 이미지 노트, 롱노트 9-Slice, 슬라이드 궤적을 커스텀 `UI.Graphic` 메쉬(`SlideTrailQuad`)로 렌더링.
- **그루브 게이지**: EZ2ON식 체력 증감(`RhythmEngine.Life` / `OnFail`), 실패 화면. 진행바는 스프라이트 없는 `Filled` 타입의 렌더링 이슈를 피해 `RectTransform` 앵커를 직접 조절하는 방식으로 구현.
- **튜토리얼**: 첫 실행(`PlayerPrefs`) 시 곡 선택 대신 튜토리얼 채보 자동 재생, 인트로 구간 레인별 키 가이드 표시, 연타로 인한 화면 스킵 방지용 입력 유예.
- **채보 에디터 툴**: 외부 라이브러리 없는 단일 HTML(`Tools/ChartEditor`). BPM 스냅 그리드(12/24비트 포함), 4종 노트 편집, Unity가 읽는 ChartData JSON 내보내기.
- **빌드 & 배포**: WebGL 빌드를 저장소 `docs/`로 배포, 캔버스 해상도를 16:9(1280×720)에 맞춰 조정.

## 배운 점

- Screen Space - Overlay 캔버스는 에셋에 저장된 Pivot 값과 무관하게 **런타임에는 항상 중앙 기준**으로 동작한다 — 씬 좌표를 코드로 재현할 땐 반드시 실제 인스펙터 값(Anchor/Pivot/Pos)을 캡처해서 확인해야 어긋나지 않는다.
- `Image.color`는 스프라이트 원본색과 **곱해지므로**, 순색이 필요하면 스프라이트를 비우고 색만 입혀야 한다.
- 재시작 시 잔상으로 남는 노트: `Instantiate`로 만든 하위 오브젝트에 `"Note"` 태그가 상속되지 않아 정리에서 누락됐던 문제.

> 플레이 영상은 추후 추가 예정입니다.
