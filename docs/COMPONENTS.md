# 컴포넌트 범위와 상태

이 문서는 DroMii Core에 무엇이 포함되고, 어느 수준까지 디자인됐는지 관리합니다.
HTML 견본이 있다는 사실만으로 완료 처리하지 않습니다. 모든 상태, 접근성, 조합 규칙이
확정돼야 `확정`으로 바꿉니다.

## 상태 표기

- **기본형 완료**: 시각 기준과 주요 상태가 있으며 다른 화면 조합에 사용할 수 있음
- **1차 후보**: 대표 화면은 있으나 상세 상태나 업무 흐름을 더 설계해야 함
- **미정**: Core 포함 여부 또는 동작이 아직 확정되지 않음
- **보류**: 실제 제품 적용 단계에서 구현

## 현재 목록

| 구성 요소 | 상태 | 남은 디자인 |
|---|---|---|
| Button, IconButton | 기본형 완료 | 아이콘 배치와 긴 문구 처리 보강 |
| TextField, Textarea | 기본형 완료 | 검색·비밀번호·단위 입력 확장 |
| Select | 기본형 완료 | 실제 드롭다운 패널과 긴 옵션 |
| Checkbox, Radio, Switch | 기본형 완료 | 혼합 상태와 그룹 오류 |
| Badge, Chip | 기본형 완료 | 넘침과 조밀한 표 안 배치 |
| Toast, Banner, Dialog | 기본형 완료 | 알림 큐, 긴 오류, 위험 동작 단계 |
| Table | 1차 후보 | 고정 헤더, 가로 넘침, 선택 작업 표시줄 |
| Pagination | 기본형 완료 | 페이지 크기 선택과 총건수 배치 |
| Tabs | 기본형 완료 | 넘치는 탭과 보조 배지 |
| Tooltip | 기본형 완료 | 화면 가장자리 위치 보정 |
| AppShell, Header, Sidebar | 1차 후보 | 메뉴 접기, 권한별 메뉴, 좁은 화면 |
| Form layout | 1차 후보 | 긴 폼, 저장 상태, 이탈 경고 |
| File upload | 1차 후보 | 진행·실패·재시도·부분 성공 |
| Map toolbar/panel | 1차 후보 | 도구 상태, 레이어 트리, 객체 선택 |
| Chart | 1차 후보 | 선·막대·임계값·범례·툴팁 |
| Dropdown menu | 미정 | 메뉴 구조와 키보드 탐색 |
| Combobox/Autocomplete | 미정 | 대량 데이터 검색과 비동기 상태 |
| Date/Date range picker | 미정 | 날짜 형식과 달력 상호작용 |
| Progress/Spinner | 미정 | 화면·영역·버튼 로딩 구분 |
| Breadcrumb | 미정 | 깊은 관리 화면 필요성 확인 |
| Accordion | 미정 | 설정·필터 영역 사용 여부 확인 |

## 공통 완료 조건

모든 대화형 컴포넌트는 다음을 정의합니다.

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

이 마크업은 현재 기준을 설명하고 검증하는 용도입니다. React 패키지를 만들 때 같은 역할과
상태를 props와 접근성 속성으로 옮깁니다.

## 시각 견본

- `components/button.html`
- `components/input.html`
- `components/badge.html`
- `components/table.html`
- `components/feedback.html`
- `components/navigation.html`
- `components/form.html`
- `components/navigation-elements.html`

