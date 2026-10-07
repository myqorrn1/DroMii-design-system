# 작업 인계 — Codex와 Claude Code 공통

2026-10-07 기준. 먼저 [현재 상태](STATUS.md) → [시각 스타일](VISUAL_STYLE.md) → 필요할 때 [날짜별 기록](history/2026-10.md)을 읽는다. 제품 근거는 [감사 기록](../context/06-product-audit-2026-09-23.md), KRDS의 선택적 점검 범위와 예외는 [한 문서](PUBLIC_SECTOR_DIRECTION.md)를 따른다.

## 목표와 변경 경계

K-AQUAS·D-ROAD의 기존 표현을 추출·리팩토링해 DroMii Core를 유지한다. 판단 순서는 **제품 코드 근거 → Core 공통화 가치 → 접근성·KRDS 선택 항목 점검**이다. 기준색·제공 로고·메뉴 구조·익숙한 업무 흐름은 보존한다. D-FIND는 제공 소스 기준 제품 표현을 연결했다. 제품별 실제 적용과 운영 서버 배포는 현재 구조 정비의 범위 밖이다.

기존 디자인시스템 파일을 수정하기 전에 사용자에게 목적·대상 파일·영향·되돌리는 방법을 알린다. 토큰은 `tokens/source.json`에서만 수정해 `npm run tokens:build`로 생성한다. 공통 규칙은 `components/base.css`, 셸은 `components/shell.css`, K-AQUAS 전용은 `components/products/k-aquas.css`에 둔다. 제품/셸 CSS의 로딩 순서는 공통 → 셸 → 제품이다. 한국어 용어는 `context/04-terms.md`를 따른다.

## 현재 구조 정비 순서

1. 완료: `chore/versioning` [PR #4](https://github.com/myqorrn1/DroMii-design-system/pull/4) 병합, `v0.21.0` 태그 발행. 승인된 변경 묶음마다 버전·CHANGELOG·태그를 갱신하고 제품 저장소는 태그만 기준으로 쓴다.
2. 완료: `refactor/css-layers` [PR #5](https://github.com/myqorrn1/DroMii-design-system/pull/5) 병합. 공통·셸·K-AQUAS CSS를 분리하고 자동 접두사 검사, React 생성 CSS 동기화, 지정 34쌍 [픽셀 차이 0](qa/css-layers-pixels.md)을 확인했다.
3. 진행: `docs/current-state`. `STATUS.md` 100줄 이내, 이 문서 80줄 이내로 현재 기준만 남기고 기존 원문은 `history/2026-10.md`에 보관한다. README·AGENTS·CLAUDE의 읽는 순서를 맞춘다. 문서 간 상충은 임의 수정하지 않고 PR에 목록으로 남긴다.
4. 구현 완료·병합 대기: `feat/dist`. `dist/`에 토큰·Core·셸·K-AQUAS CSS를 생성하고 버전·생성 기준 커밋 `f2c1c8f`를 표시한다. 소스와 생성물이 다르면 `npm run check`가 실패한다. CSS 배포 파일만 추가한 시점의 지정 34쌍은 전후 차이 0이고, 최종 v0.22.0 버전 글자 차이는 [픽셀 기록](qa/dist-pixels.md)에 예외로 적었다. 병합 후 v0.22.0 태그를 발행한다.

각 단계는 **브랜치 하나·PR 하나**이며 이전 PR의 main 병합 후에만 다음 단계를 시작한다. 매번 `npm run check`, `git diff --check`, 브라우저 검증을 수행한다. 2·4단계는 `index.html`, `ready.html`, `overview.html`, `components/*.html`의 라이트·다크 전후 캡처를 비교한다. 디자인 값, K-AQUAS 저장소, 고대비 테마, 새 컴포넌트는 이번 작업에서 변경하지 않는다.

## 제품 연결 전에 기억할 점

HTML 견본의 승인과 실제 제품 적용은 다르다. K-AQUAS 제품 저장소의 [초안 PR #2](https://github.com/DroMii-Co-Ltd/K-AQUAS/pull/2)는 이 구조 정비와 별개다. 실제 적용 때에는 기존 기능·요청 계약·지도 내부 배치를 유지하면서 시각 결과를 제품 화면에서 대조한다. 현재 공용 모달/업로드 HTML과 React `Dialog`는 있으나, 제품 셸·업로드를 꺼내 쓰는 React 조합은 후속 후보로 둔다. 구체적 유지·변경 경계는 [적용 가이드](APPLICATION.md)를 따른다.

2026-10-07 K-AQUAS 지도 도구 시안은 제품 `Mapcontrol`과 메뉴 제어를 다시 감사해 일반·야간·위성, 레이어 4종, 측정·지우기·캡처 4종, 확대·축소·유역 위치·레이어 초기화만 표시한다. 지도 도구 아이콘은 SVG 자리표시자가 아니라 제품의 기존 PNG 자산을 `assets/icons/k-aquas/map-controls/`에서 사용하며, 서비스 코드에는 아직 적용하지 않는다.
