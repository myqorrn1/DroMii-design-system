# 현재 상태

2026-10-08 기준. 디자인시스템 저장소의 릴리스는 **v0.30.0**이며, 릴리스 태그를 제품 적용 기준으로 쓴다. [변경 기록](../CHANGELOG.md)에 승인된 묶음을 기록한다. 이전 날짜별 상태·검증 원문은 [2026-10 기록](history/2026-10.md)에 보관한다.

## 확정된 것

- K-AQUAS·D-ROAD 제품 코드에서 공통 디자인을 추출·리팩토링한 DroMii Core. 기준색, 제품 메뉴와 익숙한 업무 흐름을 유지한다. KRDS는 [선택한 항목](PUBLIC_SECTOR_DIRECTION.md)의 점검 기준이다.
- 토큰 원본 `tokens/source.json`: reference / semantic / component 계층과 brand / scheme / density 축. 본문 default 16px, 표·지도 패널 compact 14px, D-ROAD 다크 기본, D-FIND 흰색 primary를 유지한다.
- 대표 화면을 제외한 Core의 시각·상태 디자인, 세 제품 인증 견본, 공통 메뉴·헤더·지도 도구·모션 규칙. 업무 배치는 제품별로 유지하며 공통 작업 패널 폭은 280px이다. 현재 모달·업로드 시안은 기본·파일 선택·오류 상태를 제공한다.
- HTML·CSS 견본과 React 내부 패키지 v0.4.0의 기존 Core·인증 조합. `components/base.css`는 공통, `components/shell.css`는 셸, `components/products/k-aquas.css`는 K-AQUAS 규칙이다. 셸·모달·업로드 창의 React 조합은 아직 없다.
- 구조 정비 1단계 [PR #4](https://github.com/myqorrn1/DroMii-design-system/pull/4) 병합·`v0.21.0` 태그 발행, 2단계 [PR #5](https://github.com/myqorrn1/DroMii-design-system/pull/5) 병합. CSS 분리는 17개 페이지 × 두 명도에서 [전후 픽셀 차이 0](qa/css-layers-pixels.md)으로 검증했다. 3단계 [PR #6](https://github.com/myqorrn1/DroMii-design-system/pull/6)는 현재 문서를 정리했다.

## 검토 중인 것

- 4단계: `dist/` CSS 생성·동기화 검사와 제품 저장소 적용 방법을 구현했다. [픽셀 검증](qa/dist-pixels.md)에서 CSS 배포 파일 추가만의 전후 차이는 0이며, v0.22.0 자동 버전 글자만 예외다. `v0.22.0` 태그를 발행했다.
- K-AQUAS 지도 도구 견본을 잘못 변경한 v0.22.1은 v0.22.2에서 원래 시안으로 복구했다. 다음 작업은 원래 시안의 디자인을 K-AQUAS 로컬 제품 화면에 적용하는 것이다.
- 제품 적용 전에 디자인시스템 견본과 제품 화면의 동작·기능 일치를 검증한다. 대표 화면 재제작, React 셸·모달·업로드 조합은 별도 후속 작업이다.
- 실제 스크린리더 발화·전체 키보드 경로와 고대비 테마는 아직 검증·구현되지 않았다.
- v0.26.0~v0.27.0: D-FIND 인증은 HTML 시안과 React v0.4.0 모두 현재 제품의 이메일·비밀번호 로그인과 관리자 승인형 가입이다. Google 로그인은 없다.
- v0.30.0: D-FIND 셸 시안과 로컬 D-FIND 적용본을 같은 화면 크기(1440×900)에서 측정해 맞췄다. 남은 차이는 시안의 솔루션 전환·알림(플랫폼 기능)뿐이다.
- v0.29.0: D-FIND 셸 시안에 로컬 D-FIND 적용본의 패널을 반영했다. 지도에서 연 프로젝트는 목록 복귀·작업 데이터 카드·작업 추가, 보고서는 PDF 보고서 머리글·4개 유형, 지도 도구는 실제 D-FIND 도구만 보인다.
- v0.28.0: D-FIND 셸 시안의 프로젝트 카드는 작업 미리보기를 펼치고, `지도에서 열기`로 프로젝트를 연 뒤에 업무 항목을 보인다(실제 D-FIND 흐름).
- v0.23.0 시험안: D-FIND 셸은 프로젝트 선택에서 시작하고, 선택 뒤 레일에 업무 항목을 보인다. 2026-09-29 D-FIND가 프로젝트 선택 화면을 지도와 분리한 구조를 반영했다. 소유자 검토 후 D-FIND 로컬 제품에 적용한다.

## 하지 않기로 한 것 / 이번 범위 밖

- KRDS 전체 도입, 제품의 기준색·메뉴·지도 내부 업무 배치 일괄 교체.
- 이번 구조 정비에서 토큰·크기·색·간격 등 시각 값 변경, 고대비 테마, 새 컴포넌트, K-AQUAS 저장소 수정·서버 배포.

## 제품별 적용 상태

| 제품 | 현재 상태 |
|---|---|
| K-AQUAS | 디자인시스템 HTML 셸·업무 견본은 제품 배치를 보존한다. 제품 저장소의 페이지 선택 창 PR #1은 이미 main에 병합됐다. 작은 UI 2–4번 [초안 PR #2](https://github.com/DroMii-Co-Ltd/K-AQUAS/pull/2)는 별도 검토 중이며 이 구조 정비에서 수정하지 않는다. 운영 반영은 확인하지 않았다. |
| D-ROAD | 다크 제품 표현과 기존 업무 배치를 반영한 HTML 견본. 실제 서비스 적용 전이다. |
| D-FIND | 제공된 프론트 소스 기준 다크·녹색 표현과 흰색 primary, HTML 견본. 실제 서비스 적용 전이다. |

세부 표현은 [시각 스타일](VISUAL_STYLE.md), 적용 경계는 [적용 가이드](APPLICATION.md), 다음 작업의 실행 기준은 [HANDOFF](HANDOFF.md)를 따른다.
