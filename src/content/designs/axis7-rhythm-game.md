---
title: AXIS7 리듬게임 기획서
summary: 7키 건반형 리듬게임 AXIS7의 게임 디자인 문서 — 노트 규격, 판정, 그루브 게이지, 수록곡/채보 설계 방향.
date: 2026-08-07
tags: [리듬게임, 시스템기획, 채보설계]
status: published
featured: true
game: AXIS7
docType: 기획서
links:
  drive: https://drive.google.com/drive/folders/1LLfjBaMB5DJTLN7imjUIXZKXqKIb0LwV
  figma: https://www.figma.com/design/D8hQ2C0kmarTMOXhGqyT0C/AXIS7_UI
---

> 이 페이지는 요약본입니다. 전체 문서(수록곡·채보 설계 포함)는 위 **Drive** 링크의 *리듬게임_기획서* 를 참고하세요.

## 조작

7키(S · D · F · SPACE · K · L · ;) 건반형. 각 키가 하나의 레인에 대응합니다.

## 노트 종류

| 종류 | 설명 |
| --- | --- |
| 일반 | 판정선 도달 시 해당 키를 누름 |
| 롱노트 | 시작에서 누르고 끝까지 유지. 머리는 홀드 중 판정선에 고정 표시 |
| 슬라이드 | 체인 노드를 순서대로 통과. 궤적은 사다리꼴 메쉬로 렌더링 |
| 혼합 | 롱 홀드 중 레인을 옮겨가는 노트. 세그먼트 단위로 판정 |

## 판정 · 그루브 게이지

- 판정별 정확도 가중치로 실시간 % 계산(결과 화면과 동일 공식).
- 그루브 게이지는 EZ2ON식 증감. 0이 되면 실패 화면으로 전환.
- 게이지 수치는 플레이테스트로 조정하는 placeholder 값에서 출발.

## 채보 설계 방향

- 난이도별로 밀도·패턴 어휘를 구분(추후 확정).
- 자체 채보 에디터(BPM 스냅 그리드)로 제작, ChartData JSON으로 관리.
