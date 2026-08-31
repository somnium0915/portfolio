/**
 * Firebase (Google Analytics) 방문자 분석.
 *
 * - firebaseConfig 값은 비밀이 아닙니다 (프로젝트 식별자). 공개 저장소에 커밋해도 됩니다.
 * - 실제 집계는 배포된 사이트(프로덕션)에서만 이뤄집니다. `npm run dev` 로컬에선 동작하지 않습니다.
 * - 분석을 끄고 싶으면 BaseLayout.astro 에서 <Analytics /> 한 줄을 지우면 됩니다.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyA_PytDMagpwyaM7OWda73TPDyMLvIv5GM',
  authDomain: 'portfolio-b4bc3.firebaseapp.com',
  projectId: 'portfolio-b4bc3',
  storageBucket: 'portfolio-b4bc3.firebasestorage.app',
  messagingSenderId: '1024523366807',
  appId: '1:1024523366807:web:0a6d0f7cce13f136fd54d2',
  measurementId: 'G-33YTYK2EZ9',
};

export async function initAnalytics(): Promise<void> {
  // 프로덕션 빌드에서만. Vite 가 이 분기를 정적으로 제거하므로 dev 번들엔 firebase 가 포함되지 않음.
  if (!import.meta.env.PROD) return;
  if (typeof window === 'undefined') return;

  try {
    const [{ initializeApp, getApps }, { getAnalytics, isSupported }] = await Promise.all([
      import('firebase/app'),
      import('firebase/analytics'),
    ]);

    if (!(await isSupported())) return;

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    getAnalytics(app); // 페이지 로드 시 page_view 자동 전송
  } catch (err) {
    // 애드블로커 등으로 실패할 수 있음 — 사이트 동작에는 영향 없어야 함
    console.debug('[analytics] 초기화 건너뜀:', err);
  }
}
