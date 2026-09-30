# 컴포넌트 범위와 상태

이 문서는 DroMii Core의 디자인 범위를 관리합니다. 아래의 `Core 구현`은 공용 CSS와
시각·상호작용 견본이 있다는 뜻입니다. 실제 제품 API 연결, 브라우저 확대·스크린리더
검증, 소유자 최종 승인은 별도의 완료 조건입니다.

## 상태 표기

- **Core 구현**: 공통 형태·역할 토큰·해당하는 주요 상태와 견본이 있음
- **조건부**: 공용 형태는 있으나 실제 제품 권한·API·업무 정책이 있어야 활성화함
- **제품 확장**: 두 제품의 공통 근거가 없어 Core에 특정 동작을 만들지 않음

## 현재 목록

| 구성 요소 | 상태 | 구현 범위·적용 경계 |
|---|---|---|
| Button, IconButton | Core 구현 | 긴 문구 줄바꿈, 아이콘 전용 24px, 상태·포커스. 실제 실행은 제품이 연결 |
| TextField, Textarea, Select | Core 구현 | 검색·날짜는 브라우저 입력 사용. 읽기 전용·오류·비활성을 구분 |
| Checkbox, Radio, Switch | Core 구현 | 체크박스 혼합 상태와 비활성된 켜짐 상태 포함. 그룹 오류 문장은 폼에서 연결 |
| Badge, Chip | Core 구현 | 칩 선택은 `aria-pressed`와 옅은 면·진한 경계로 표현 |
| Toast, Banner, Dialog | Core 구현 | [역할과 지속 시간](PATTERNS.md#2-위험-동작-확인) 분리. 짧은 확인창과 낮은 화면에서 입력 영역만 스크롤하는 긴 폼 변형. 실제 서버 결과는 제품 연결 필요 |
| Table, Pagination | Core 구현 | 정렬 버튼·방향, 선택형 경계, 선택 혼합 상태, 고정 머리글 옵션. 서버 정렬·페이지 API는 제품 연결 필요 |
| Tabs, Tooltip | Core 구현 | 방향키 탭, 짧은 보조 설명. 툴팁은 필수 정보에 사용하지 않음 |
| AppShell, Header, Sidebar | Core 구현·소유자 검토 전 | 지도형 작업 패널·캔버스와 관리형 셸을 분리. 제공 로고·본문 건너뛰기·현재 위치·접힘을 포함하며 레일·상단 바·결과 줄과 메뉴 내용은 제품 구성 |
| Form layout | Core 구현 | 1열 기본·관련 필드 2열, 오류 요약과 저장 상태. 이탈 차단은 제품 라우터와 연결 |
| File upload | 조건부 | 선택·파일 목록·전송·분석 시작의 형태는 구현. 형식·진행률·재시도는 제품 계약에 따름 |
| Map toolbar/panel | 조건부 | 레이어·도구·객체 상태는 구현. 타일·좌표·분석과 키보드 대체 목록은 지도 제품에 연결 |
| Chart | Core 구현 | 6개 계열 팔레트와 단일 계열 막대의 범주·수치 라벨. 선·임계값은 도메인 차트 확장 |
| Dropdown, Breadcrumb, Accordion | Core 구현 | `<details>` 기반 명령 목록·펼침과 깊은 경로. 메뉴 항목은 제품이 공급 |
| Progress, Spinner | Core 구현 | 수치가 없는 요청은 문구와 회전 표시, 서버가 수치를 줄 때만 `<progress>` 사용 |
| Combobox/Autocomplete | 제품 확장 | 현재 두 제품의 공통 비동기 후보·검색 계약 근거가 없어 Core에 가상 API를 만들지 않음 |
| Date/Date range picker | Core 구현 | 네이티브 날짜 입력과 관련 필드 2열 조합 사용. 별도 달력 패널은 제품 요구가 있을 때 확장 |

## 공통 완료 조건

대화형 컴포넌트는 해당하는 상태를 정의합니다. 오류·로딩이 없는 정적 탐색 요소에
가상의 오류·로딩 상태를 강제로 붙이지 않습니다.

- 기본, hover, focus-visible, pressed 또는 selected
- disabled, read-only, loading, error
- 크기와 내용이 길 때의 처리
- 키보드 조작과 접근 가능한 이름
- 라이트·다크, compact·default 표현
- 좋은 사례와 잘못된 사례
- 사용 토큰과 변경 영향 범위

## 현재 CSS 진입점

공용 클래스는 `components/base.css`에 있습니다.

```html
<button class="btn btn--md btn--primary">저장</button>

<label class="f" for="project-name">
  <span class="lb">프로젝트명</span>
  <input class="ctl" id="project-name">
  <span class="help">업무 목록에 표시됩니다.</span>
</label>
```

이 마크업은 시각 기준입니다. [React 패키지](../packages/react/README.md)는 같은
CSS·역할 토큰을 쓰는 재사용 요소를 제공합니다. 앱 셸과 업무 API는 포함하지 않으며
MUI·Tailwind 기존 화면은 [적용 매핑](APPLICATION.md#제품별-유지변경-매핑--적용-전-기준)에
따라 점진적으로 연결합니다.

## 시각 견본

- `components/d-find.html` — D-FIND 색·표면을 적용한 Core 요소의 제품 표현. 새 Core 컴포넌트나 앱 셸은 아님
- `components/button.html`
- `components/input.html`
- `components/badge.html`
- `components/table.html`
- `components/feedback.html`
- `components/navigation.html`
- `components/form.html`
- `components/navigation-elements.html`
- `components/workflows.html`
