# DroMii 디자인시스템 문서

이 디렉터리는 디자인 기준을 결정하고, 나중에 각 솔루션에 같은 방식으로 적용하기 위한
관리 문서입니다. 화면 견본은 GitHub Pages에서 보고, 결정과 적용 규칙은 이 문서에서 찾습니다.

현재 배포 버전은 **v0.15 Core 1차 후보**입니다. 시각 방향과 주요 구조는 잡혔지만
디자인 확정본이나 제품 적용 완료본은 아닙니다.

## 권장 읽기 순서

1. [현재 상태](STATUS.md) — 완료된 디자인과 남은 디자인
2. [프로젝트 기준](PROJECT.md) — 목적, 범위, 권한, 품질 기준
3. [토큰](TOKENS.md) — 값의 원본과 변경 방법
4. [컴포넌트](COMPONENTS.md) — 포함 범위, 상태, 미완료 항목
5. [조합 패턴](PATTERNS.md) — 실제 업무 화면을 만드는 방법
6. [제품별 설정](THEMING.md) — Core와 솔루션별 확장의 경계
7. [접근성](ACCESSIBILITY.md) — 반드시 지켜야 할 상호작용과 검사
8. [적용 가이드](APPLICATION.md) — 나중에 제품 코드에 적용할 순서
9. [구축 로드맵](ROADMAP.md) — 다음 버전의 작업 순서
10. [코드 중심 관리 결정](decisions/0001-code-first-management.md) — Figma와 Storybook 없이 관리하는 이유

## 원본 위치

| 대상 | 기준 파일 | 역할 |
|---|---|---|
| 토큰 값 | `tokens/source.json` | 사람이 수정하는 토큰 원본 |
| 생성된 CSS 변수 | `tokens.css` | 제품 코드와 견본이 사용하는 생성 파일 |
| 컴포넌트 스타일 | `components/base.css` | 공용 구조와 상태 스타일 |
| 시각 견본 | `foundations/`, `components/`, `patterns/` | 브라우저에서 실제 렌더링되는 기준 |
| 사용 규칙 | `docs/*.md` | 의도, 허용 범위, 적용 절차 |
| 과거 실측 | `context/` | 결정의 근거와 이전 감사 기록 |

같은 내용을 여러 파일에서 다시 정의하지 않습니다. 숫자는 토큰 원본, 시각 상태는
컴포넌트 CSS와 HTML, 적용 판단은 이 문서를 기준으로 합니다.

## 결과물을 확인하는 곳

- 공개 문서: <https://myqorrn1.github.io/DroMii-design-system/>
- 대표 화면: <https://myqorrn1.github.io/DroMii-design-system/patterns/screens.html>
- 로컬 시작점: `index.html`

## 디자인 완료의 의미

다음 조건을 모두 만족해야 디자인 자체가 끝났다고 판단합니다.

- Core에 포함할 파운데이션, 컴포넌트, 패턴의 범위가 확정됐다.
- 모든 컴포넌트의 기본·hover·focus·pressed·disabled·loading·error 상태가 정의됐다.
- K-AQUAS와 D-ROAD의 대표 업무 흐름에서 빈틈 없이 화면을 구성할 수 있다.
- 지도, 표, 업로드, 차트처럼 제품 핵심 영역의 상세 패턴이 정의됐다.
- 제품별 허용 변경과 Core에서 바꿀 수 없는 규칙이 문서화됐다.
- 데스크톱 주요 폭과 키보드 사용, 대비, 오류·빈 상태가 검증됐다.
- 미결정 항목이 [현재 상태](STATUS.md)에 남아 있지 않다.
