// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages 프로젝트 사이트 배포 기준:
//   저장소 이름이 `portfolio` 이면  →  https://somnium0915.github.io/portfolio/
// 저장소 이름을 바꾸면 아래 `base` 도 같이 바꿔야 합니다.
export default defineConfig({
  site: 'https://somnium0915.github.io',
  base: '/portfolio',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
