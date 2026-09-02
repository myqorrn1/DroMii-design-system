# 드로미 디자인시스템

K-AQUAS · D-ROAD · D-FIND 세 제품이 한 회사 제품으로 보이게 하는 공용 UI 기준입니다.
K-AQUAS `src/` 28,735줄 + D-ROAD `src/` 8,033줄을 전수 스캔해 **이미 쓰이던 값을 정리한 것**이며,
새로 발명한 것이 아닙니다.

## 보기

`index.html`을 브라우저에서 엽니다. 빌드도 설치도 필요 없습니다.
왼쪽 목록에서 항목을 고르면 오른쪽에 견본이 뜹니다.

## 쓰기

CSS 세 개를 순서대로 넣고, 최상위 요소에 `data-product`를 답니다.

```html
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/base.css">

<body data-product="k-aquas">
  <button class="btn btn--md btn--primary">저장</button>
</body>
```

같은 마크업이 `data-product="d-road"`에서 D-ROAD 색으로 렌더됩니다.
클래스 이름과 상태는 각 컴포넌트 견본 페이지에 있습니다.

**색을 직접 쓰지 마세요.** 하드코딩 hex 대신 역할 토큰을 씁니다.

```css
background: var(--dm-primary-solid);   /* O */
background: #5098EC;                   /* X — 제품이 바뀌면 안 따라옴 */
background: var(--dm-accent-500);      /* X — 램프 직접 참조. K-AQUAS는 500, D-ROAD는 400이 기준 */
```

## 파일

```
index.html         보기 시작점 — 좌측 목록 + 본문
overview.html      전체 목록 · 토큰 요약 · 규칙 14개

fonts.css          Pretendard 로드 — 자체 호스팅 전환 시 이 파일만 고침
tokens.css         토큰 — 시스템의 바닥
components/base.css  컴포넌트 CSS — 규칙이 있는 유일한 파일

foundations/       컬러 · 타이포그래피 · 간격·레이아웃 · 깊이
components/        버튼 · 입력 요소 · 배지·칩 · 데이터 테이블 · 알림 3종

context/           판단 재료 — 값을 바꾸기 전에 읽을 것
  01-as-is.md        코드 실측 — 무엇이 몇 개 있고 어떻게 쓰이는지
  02-keep.md         그대로 쓸 것 / 고칠 것, 그리고 그 판단 기준
  03-rules.md        시스템 규칙 14개
```

## 고치기

순서가 있습니다. **`tokens.css` → `components/base.css` → 견본 페이지.**
견본에서 먼저 고치면 컴포넌트 CSS와 갈라집니다 — 그 갈라짐을 정리하려고 만든 시스템입니다.

값을 추가하기 전에 두 가지를 확인합니다.

1. **실측 근거가 있는가** — `context/01-as-is.md`에 있는 값인가, 아니면 새로 만드는 것인가
2. **역할 토큰인가** — 컴포넌트가 램프(`--dm-accent-500`)를 직접 보면 제품을 하나 더 붙일 때 깨집니다

컴포넌트를 추가할 때는 `context/03-rules.md`의 규칙 14개로 판단합니다.
누가 만들어도 같은 결론에 닿게 하는 것이 그 문서의 목적입니다.

## 이 시스템이 존재하는 이유

세 제품(K-AQUAS · D-ROAD · D-FIND)이 **한 회사 제품으로 보이게** 하기 위해서입니다.
동시에 각 제품의 컨셉은 유지되어야 하므로, 갈라지는 지점을 미리 못 박아 뒀습니다 —
**액센트 램프 · 로고 · 로그인 배경 · 도메인 아이콘, 네 가지뿐**입니다.

## 작동 방식

컴포넌트는 하드코딩 색을 쓰지 않고 **역할 토큰**만 참조합니다.

```css
background: var(--dm-primary-solid);
color:      var(--dm-text-on-solid);
```

상위 요소의 `data-product`만 바꾸면 같은 마크업이 제품 색으로 렌더됩니다.

```html
<div data-product="k-aquas"> … </div>   <!-- #5098EC + 흰 글자 -->
<div data-product="d-road">  … </div>   <!-- #9D91FF + #16181D -->
```

`components/button.html`에서 실제로 확인할 수 있습니다.

## 아직 없는 것

모달 · 폼 레이아웃 · 탭 · 툴팁 · 페이지네이션 · 헤더 · 메뉴바 ·
차트 팔레트 · 아이콘 174개 정리 · 브레이크포인트 · D-FIND 액센트 램프.

**다 만든 뒤에 쓰기 시작할 필요는 없습니다.** 지금 있는 것으로 화면 대부분이 조립되고,
실제 화면에 붙여보면 무엇이 부족한지 이 목록보다 정확하게 나옵니다.
기존 코드는 마이그레이션하지 않고, **새로 만드는 화면부터** 적용합니다.

## 배포

정적 파일이라 그대로 올라갑니다. GitHub Pages는 Settings → Pages에서
Source를 `main` / `root`로 두면 됩니다. 루트의 빈 `.nojekyll` 파일이
밑줄로 시작하는 파일이 무시되는 것을 막아줍니다.

## 변경 이력

**v0.10 (2026-09-01)** — 쓰이는 곳 · 셸
- 컴포넌트 5개 페이지에 **&ldquo;쓰이는 곳&rdquo;** 표 추가.
  어느 화면에서 무엇을 하는지 + 출처 파일. 토큰 변경의 영향 범위를 여기서 본다
- `index.html`을 좌측 목록 + 본문 셸로 교체. 기존 개요는 `overview.html`로 이동.
  파일을 하나씩 여는 대신 한 화면에서 넘겨본다

**v0.9 (2026-09-01)** — 코드에 근거가 없는 것 제거
두 제품을 다시 대조해, 실제로 쓰이지 않는 것을 걷어냈습니다.
디자인시스템이 제품보다 앞서 나가면 쓰이지 않는 규칙이 쌓입니다.

- 표 **정렬 헤더** — 12개 표 파일 어디에도 정렬이 없음
- 표 **일괄 선택**(체크박스 열 · 선택 바 · 혼합 상태) — 두 제품 모두 한 행씩 처리
  (D-ROAD `UserDelete_Btn`). 행 선택 자체는 남김 — 상세를 여는 용도
- **스켈레톤** — 로딩은 `Loding.js` · `Progress.jsx` 두 곳이고 둘 다 스피너.
  토큰 `surface-shimmer`도 함께 제거
- **토스트 실행취소** — 되돌리기가 서버에 없음
- **삭제 가능 칩**(× 붙은 칩) — 적용된 조건을 칩으로 보여주는 화면이 없음
- **`.bdg--solid`**(신규 배지) — 도메인 상태값에 "신규"가 없음

**v0.8 (2026-09-01)** — 알림 3종 · index
- `components/feedback.html` — 토스트 · 배너 · 다이얼로그. `alert()` 52곳을 대체
- `index.html` 신설 — 전체 목록 · 토큰 요약 · 규칙 14개 · 아직 없는 것.
  미리보기는 스크린샷이 아니라 `base.css`로 실제 렌더된다
- 토큰 2개 — `shadow-raised` · `overlay-scrim`. 그림자 램프는 있었으나 역할 토큰이 없어
  컴포넌트가 램프를 직접 봐야 했음. 스크림은 라이트 .44 · 다크 .62로 나눔

**v0.7 (2026-08-31)** — 자체 검토 반영
- `components/base.css` 신설. 같은 `.btn` `.ch` `.bdg`가 페이지마다 복사돼
  이미 갈라지고 있었음(`.btn--sec` vs `.btn--secondary`). 컴포넌트 CSS를 한 곳으로 모으고
  견본 페이지는 마크업과 설명만 갖는다
- 모션 토큰 3개 — `duration-fast`(120ms) · `duration-base`(200ms) · `ease-out`.
  버튼은 전환이 없고 입력은 120ms, 스위치는 140ms이던 불일치 해소.
  **관행에서 가져온 유일한 토큰 묶음**이라 그렇게 표기함
- `--dm-status-neutral-bg` 정정 — 라이트는 `row-hover`와 값이 같아(#EDEFF3),
  다크는 거의 같아(#343743 vs #323544) 중립 배지가 hover된 행에서 사라졌음
- `--dm-surface-shimmer` 신설 — 스켈레톤이 행 상태 토큰을 빌려 쓰던 것 분리
- 규칙 13 신설 — 포커스 두 표현(보더 교체 + halo / outline). 문서에 없어 다음 컴포넌트가
  아무 쪽이나 고를 수 있던 상태
- 규칙 14 신설 — 상태 전환에만 모션 토큰. 루프는 대상 아님
- 기록된 예외 추가 — 플레이스홀더 대비(라이트 3.87:1 · 다크 4.19:1)
- 버튼 `:active` 추가 — `--dm-primary-subtle-strong`이 정의만 있고 안 쓰이던 것 연결

**v0.6 (2026-08-31)** — 컴포넌트 3개 추가, 토큰 13개 추가
- `components/input.html` — text · select · textarea · checkbox · radio · switch × 4 state
- `components/badge.html` — 상태 배지 5색(틴트 · 점) · 필터 칩 · 삭제 가능 칩 · 도메인 상태 매핑
- `components/table.html` — 정렬 · 선택(3상태 전체선택) · 스켈레톤 · 빈 상태 2종
- v0.5 오류 상태 역할 토큰 3개 — `border-danger` · `text-danger` · `focus-halo-danger`.
  기존 danger 역할 토큰이 채움면(`solid`)뿐이라 보더와 helper 텍스트가 갈 곳이 없었음
- v0.6 상태 배지 역할 토큰 10개 — `status-*-bg` / `-text`.
  시맨틱 램프가 `:root`에 라이트·다크 값을 함께 갖고 있어 제품 블록에서 갈라야
  컴포넌트가 램프를 직접 보지 않음
- 데이터 테이블은 **새 토큰 없이** 완성 — 토큰이 컴포넌트를 따라잡은 지점

**v0.4 (2026-08-31)** — 리뷰 반영
- `fonts.css` 신설. Pretendard가 실제로 로드되지 않던 문제 해결
- danger 역할 토큰 3개 추가 → 컴포넌트의 램프 직접 참조와 인라인 덮어쓰기 제거
- `--dm-surface-raised`를 K-AQUAS에도 추가 (모달·토스트가 라이트에서 빈 배경이 되던 문제)
- `--dm-surface-disabled` 신설 → 버튼 비활성 면이 행 상태 토큰을 빌려 쓰던 것 분리
- 포커스 링 `accent-500` → `accent-600` (2.98:1은 WCAG 1.4.11에도 미달)
- `xs 24px` 추가 — 실측 14회, 아이콘 버튼 전용
- 다크 `text-disabled`를 neutral-600으로 (muted와 같은 색이던 문제. 다크는 어두울수록 흐림)
- 규칙 3의 적용 범위를 시맨틱 색으로 한정 (브랜드 액센트는 예외)
- 규칙 4-B 신설 — 4px 그리드는 요소 사이에만, 컴포넌트 내부 치수는 예외
- 문서 참조·시맨틱 견본 표기 정정

---

근거: `.js .jsx .css` 전수 정규식 스캔 · WCAG 2.1 AA 대비 계산 60여 건 ·
색맹 시뮬레이션 검증 · 브라우저 렌더링 확인 (2026-08-28)
