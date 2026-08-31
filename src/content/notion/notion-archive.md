---
title: Notion 문서 아카이브
summary: 노션에 작성한 문서를 이 섹션으로 자동으로 가져옵니다. 이 안내 문서는 첫 노션 페이지를 연결하면 지워도 됩니다.
date: 2026-08-31
tags: [안내]
status: published
featured: false
order: 999
sourceCategory: 안내
---

이 섹션의 문서는 **빌드할 때 노션에서 자동으로 변환**되어 들어옵니다.

## 노션 페이지 연결하는 법

1. 노션 통합 토큰을 발급해 GitHub 저장소 Secret `NOTION_TOKEN` 에 등록합니다.
2. 프로젝트 루트 `notion.config.json` 의 `pages` 배열에 가져올 페이지를 추가합니다.

   ```json
   {
     "slug": "my-doc",
     "pageId": "노션-페이지-ID-32자리",
     "title": "문서 제목",
     "enabled": true
   }
   ```
3. 로컬에서 `npm run sync:notion` 을 돌리거나, 그냥 `main` 에 push 하면 CI 가 빌드 전에 자동으로 가져옵니다.

자세한 단계는 저장소 `README.md` 의 *3. 노션 문서 추가하기* 를 참고하세요.

> 실제 노션 문서를 하나라도 연결한 뒤에는 이 파일(`src/content/notion/notion-archive.md`)을 삭제해도 됩니다. 자동 동기화는 이 파일을 건드리지 않습니다.
