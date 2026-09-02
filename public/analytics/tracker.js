/*!
 * 방문 통계 트래커 (자체 구현)
 * - 우리 Firebase 프로젝트(portfolio-b4bc3)의 Firestore `visits` 컬렉션에 익명 기록.
 * - 수집 안 함: IP, 이름, 이메일, 정확한 위치. (시간대 기반 국가 추정만)
 * - localhost / 127.0.0.1 / *.local 에서는 자동 비활성.
 * - localStorage 'pf_owner' = '1' 이면 그 브라우저는 집계 제외.
 * - 설정은 이 파일을 부른 <script> 태그의 data-* 속성에서 읽음.
 */
(function () {
  var S =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName('script');
      return s[s.length - 1];
    })();
  var D = (S && S.dataset) || {};
  var CFG = {
    project: D.project || 'portfolio-b4bc3',
    key: D.key || '',
    site: D.site || 'site',
    collection: D.collection && /^visits/.test(D.collection) ? D.collection : 'visits',
    extra: parseJSON(D.extra),
  };

  var host = location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || /\.local$/.test(host)) return;
  if (navigator.webdriver) return;
  try {
    if (window.top !== window.self) return;
  } catch (e) {
    return;
  }
  try {
    if (localStorage.getItem('pf_owner') === '1') return;
  } catch (e) {}
  if (!CFG.key || !CFG.project) return;

  var LS = store(window.localStorage);
  var SS = store(window.sessionStorage);
  var vid = LS.get('pf_vid');
  var newVisitor = !vid;
  if (!vid) {
    vid = rand(12);
    LS.set('pf_vid', vid);
  }
  var sid = SS.get('pf_sid');
  var newSession = !sid;
  if (!sid) {
    sid = rand(10);
    SS.set('pf_sid', sid);
  }

  var ua = navigator.userAgent || '';
  var tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {}

  var rec = {
    v: 2,
    site: CFG.site,
    day: kstDay(),
    ts: new Date().toISOString(),
    vid: vid,
    sid: sid,
    newVisitor: newVisitor,
    newSession: newSession,
    device: device(ua),
    os: os(ua),
    browser: browser(ua),
    refHost: refHost(),
    refType: refType(),
    region: region(tz),
    tz: tz,
    lang: navigator.language || '',
    screen: (screen.width || 0) + 'x' + (screen.height || 0),
    path: location.pathname,
    title: (document.title || '').slice(0, 80),
    secs: 0,
    views: [],
  };
  // data-extra: 최대 6개, 이미 있는 필드명은 무시
  var ek = Object.keys(CFG.extra || {}).slice(0, 6);
  for (var i = 0; i < ek.length; i++) if (!(ek[i] in rec)) rec[ek[i]] = String(CFG.extra[ek[i]]);

  var views = rec.views;
  window.__pfTrack = function (name) {
    if (typeof name === 'string' && name && views.length < 40 && views.indexOf(name) < 0) {
      views.push(name);
    }
  };

  // 본 구역 관찰: <main> 안의 section[id] / article[id]
  try {
    var els = document.querySelectorAll('main section[id], main article[id]');
    if (!els.length) els = document.querySelectorAll('body section[id], body article[id]');
    if (els.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(
        function (ents) {
          for (var j = 0; j < ents.length; j++) {
            if (ents[j].isIntersecting) window.__pfTrack(ents[j].target.id);
          }
        },
        { threshold: 0.4 },
      );
      for (var k = 0; k < els.length; k++) io.observe(els[k]);
    }
  } catch (e) {}

  // 체류 시간: 탭이 보이는 동안만 누적 (최대 3600초)
  var secs = 0;
  var mark = document.visibilityState === 'visible' ? Date.now() : 0;
  function flushTime() {
    if (mark) {
      secs += (Date.now() - mark) / 1000;
      mark = 0;
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      if (!mark) mark = Date.now();
    } else {
      flushTime();
    }
  });

  var docId = rand(20);
  var base =
    'https://firestore.googleapis.com/v1/projects/' +
    CFG.project +
    '/databases/(default)/documents/' +
    CFG.collection;

  send(base + '?documentId=' + docId + '&key=' + CFG.key, 'POST', { fields: toFields(rec) });

  var sent = false;
  function finalize() {
    if (sent) return;
    sent = true;
    flushTime();
    var s = Math.max(0, Math.min(3600, Math.round(secs)));
    var url =
      base +
      '/' +
      docId +
      '?key=' +
      CFG.key +
      '&updateMask.fieldPaths=secs&updateMask.fieldPaths=views';
    send(url, 'PATCH', { fields: toFields({ secs: s, views: views }) });
  }
  addEventListener('pagehide', finalize);
  addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') finalize();
  });

  // ---------- helpers ----------
  function send(url, method, body) {
    try {
      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
        mode: 'cors',
      }).catch(function () {});
    } catch (e) {}
  }
  function rand(n) {
    var c = 'abcdefghijklmnopqrstuvwxyz0123456789',
      s = '';
    for (var i = 0; i < n; i++) s += c[(Math.random() * c.length) | 0];
    return s;
  }
  function parseJSON(s) {
    try {
      return s ? JSON.parse(s) : {};
    } catch (e) {
      return {};
    }
  }
  function store(st) {
    return {
      get: function (k) {
        try {
          return st.getItem(k);
        } catch (e) {
          return null;
        }
      },
      set: function (k, v) {
        try {
          st.setItem(k, v);
        } catch (e) {}
      },
    };
  }
  function kstDay() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }
  function refHost() {
    try {
      if (!document.referrer) return '';
      var h = new URL(document.referrer).hostname;
      return h === location.hostname ? '' : h;
    } catch (e) {
      return '';
    }
  }
  function refType() {
    var h = refHost();
    if (!h) return '직접 방문';
    if (/google\./.test(h)) return '구글 검색';
    if (/naver\./.test(h)) return '네이버 검색';
    if (/bing\./.test(h)) return '빙 검색';
    if (/duckduckgo/.test(h)) return 'DuckDuckGo';
    if (/(facebook|instagram|t\.co|twitter|x\.com|threads\.net|linkedin|youtube|reddit)\./.test(h))
      return '소셜';
    if (/github\./.test(h)) return 'GitHub';
    return '기타 사이트';
  }
  function device(ua) {
    if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/.test(ua)) return '태블릿';
    if (/Mobi|iPhone|iPod|Android|IEMobile|BlackBerry|Opera Mini/i.test(ua)) return '모바일';
    return 'PC';
  }
  function os(ua) {
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Linux/.test(ua)) return 'Linux';
    return '기타';
  }
  function browser(ua) {
    if (/KAKAOTALK/i.test(ua)) return '카카오톡';
    if (/Whale/i.test(ua)) return '웨일';
    if (/NAVER\(inapp/i.test(ua)) return '네이버 앱';
    if (/Instagram/i.test(ua)) return '인스타그램';
    if (/FBAN|FBAV/i.test(ua)) return '페이스북';
    if (/Line\//i.test(ua)) return '라인';
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/SamsungBrowser/i.test(ua)) return '삼성 인터넷';
    if (/OPR\/|Opera/i.test(ua)) return 'Opera';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    if (/CriOS|Chrome\//i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua)) return 'Safari';
    return '기타';
  }
  function region(tz) {
    var m = {
      'Asia/Seoul': '대한민국',
      'Asia/Tokyo': '일본',
      'Asia/Shanghai': '중국',
      'Asia/Hong_Kong': '홍콩',
      'Asia/Taipei': '대만',
      'Asia/Singapore': '싱가포르',
      'Asia/Bangkok': '태국',
      'Asia/Jakarta': '인도네시아',
      'Asia/Kolkata': '인도',
      'Asia/Manila': '필리핀',
      'Asia/Ho_Chi_Minh': '베트남',
      'America/New_York': '미국',
      'America/Chicago': '미국',
      'America/Denver': '미국',
      'America/Los_Angeles': '미국',
      'America/Toronto': '캐나다',
      'Europe/London': '영국',
      'Europe/Paris': '프랑스',
      'Europe/Berlin': '독일',
      'Europe/Madrid': '스페인',
      'Australia/Sydney': '호주',
    };
    if (m[tz]) return m[tz];
    if (/^America\//.test(tz)) return '아메리카';
    if (/^Europe\//.test(tz)) return '유럽';
    if (/^Asia\//.test(tz)) return '아시아';
    if (/^Africa\//.test(tz)) return '아프리카';
    if (/^Australia\/|^Pacific\//.test(tz)) return '오세아니아';
    return tz || '알 수 없음';
  }
  function toFields(obj) {
    var out = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = toValue(obj[k]);
    return out;
  }
  function toValue(v) {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number')
      return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
    return { stringValue: String(v) };
  }
})();
