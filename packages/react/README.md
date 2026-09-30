# @dromii/react

HTML 견본과 같은 역할 토큰·CSS를 사용하는 DroMii Core React 패키지입니다. 버전은
`0.2.0`이며, 현재 사내 전달용 압축 파일로 관리합니다. 앱 셸·제품 API·권한 정책은
포함하지 않습니다.

## 설치와 사용

디자인시스템 저장소에서 압축 파일을 만들고, 적용할 React 제품에서 설치합니다.
npm 레지스트리에 게시하지 않으므로 각 제품은 사용한 파일과 버전을 고정해야 합니다.

```bash
npm ci
npm run react:build
npm run check
npm pack --workspace @dromii/react
# 제품 저장소에서: npm install ./dromii-react-0.2.0.tgz
```

제품에는 React·ReactDOM 18 또는 19가 있어야 합니다. 패키지는 JSX 변환이 필요 없는
ES 모듈이고, 타입 선언과 CSS를 함께 담습니다. 스타일은 앱 진입점에서 **한 번만**
가져옵니다. 제품이 Pretendard를 이미 로드한다면 폰트 CSS는 가져오지 않습니다.
현재 자동 동작·타입 검증은 React 18에서 수행했습니다. React 19 제품은 실제 빌드에서
같은 검사를 다시 수행해야 합니다.

```tsx
import '@dromii/react/styles.css';
import { ThemeScope, Button, TextField, Banner } from '@dromii/react';

export function Example() {
  return <ThemeScope brand="d-road" scheme="dark" density="default">
    <TextField label="작업 이름" name="name" required
      helperText="목록에 표시되는 이름입니다." />
    <Button variant="primary">저장</Button>
    <Banner tone="warning" title="자료가 지연되고 있습니다">
      마지막 확인 결과를 표시합니다.
    </Banner>
  </ThemeScope>;
}
```

`ThemeScope`는 브랜드의 기본 명도(K-AQUAS light, D-ROAD·D-FIND dark)를 선택하며
`scheme`으로 덮어쓸 수 있습니다. `compact`는 지도·표의 좁은 패널에만 사용합니다.
패키지 CSS의 토큰과 컴포넌트 규칙은 `ThemeScope` 아래로 한정되어 기존 제품의
동명 `.btn`·`.ctl` 등을 변경하지 않습니다. MUI·Tailwind 컴포넌트에는 Core 클래스가
자동으로 적용되지 않습니다. 외부 폰트 CDN을 쓸 수 없다면 제품의 자체 호스팅
Pretendard를 연결합니다.
승인 대기 중인 앱 셸 스타일과 HTML 업무 패턴의 견본 전용 스타일은 패키지 CSS에서
제외합니다.
기존 제품 전체를 `ThemeScope`로 감싸면 그 안의 동명 클래스에도 스타일이 적용될 수
있으므로, 처음에는 도입할 Core 요소의 하위 영역만 감쌉니다.

실제 상태 관리가 포함된 [폼·표 사용 예시](examples/Usage.tsx)는 제품이 저장 함수,
정렬·페이지 이동·검색 함수를 주입하는 형태입니다. 서버 응답은 제품에서 연결합니다.

## HTML 견본과 React 대응

| 견본 | React 구성 요소 | 주의할 상태·동작 |
|---|---|---|
| [버튼][button-spec]·[아이콘][icon-spec] | `Button`, `IconButton`, `Icon` | 24px은 `IconButton size="xs"` 전용. 아이콘만 있는 버튼은 `label` 필수 |
| [입력][input-spec] | `TextField`, `TextareaField`, `SelectField`, `CheckboxField`, `RadioField`, `SwitchField` | 라벨·도움말·오류 연결, 혼합 체크, 읽기 전용·비활성 구분 |
| [배지·칩][badge-spec] | `Badge`, `Chip` | 점 배지는 `dot`; 선택 칩은 `aria-pressed` |
| [알림][feedback-spec] | `ToastRegion`, `Toast`, `Banner`, `Dialog` | 토스트는 최근 3개, 실패 기본 지속. 다이얼로그는 부모가 열림 상태 소유 |
| [표][table-spec]·[화면 안 탐색][navigation-spec] | `TableContainer`, `DataTable`, `EmptyState`, `SortHeader`, `Pagination`, `Tabs`, `Tooltip`, `Breadcrumb`, `Disclosure`, `Dropdown`, `DropdownItem` | 정렬·페이지 이동은 제품 데이터에 연결. 한 페이지면 페이지 이동 숨김 |
| [폼][form-spec] | `FormSection`, `FormGrid`, `FormErrorSummary`, `FormActions` | 오류 요약은 입력 `id`로 이동. 저장 실패 시 입력값 유지 |
| [시각화][chart-spec] | `BarChart`, `Progress`, `Spinner` | 단일 계열 기본 막대, 범주·값을 항상 글자로 표시 |

`TextField`의 `error`는 입력의 `aria-invalid`와 오류 문구를 연결합니다.
`TableContainer`는 `scroll`로 고정 머리글 변형, `density="compact"`로 좁은 표를
선택합니다. 아직 자료가 없는 상태와 검색 결과가 없는 상태는 `EmptyState`의 제목·
설명·동작을 달리해서 사용합니다.
`FormActions`는 `pristine / dirty / saving / success / error`를 표시합니다.
`ToastRegion`은 전달된 토스트 중 최근 3개만 표시하며, `Toast`는 성공·정보·경고를
기본 4초 후 `onDismiss`로 닫습니다. 실패는 기본 자동 소멸이 없습니다. `Dialog`의
`onClose`에서는 부모의 `open`을 false로 바꿔야 합니다. `BarChart`에는 접근 가능한
요약 `label`과 각 항목의 보이는 범주·값을 제공합니다.

[업무 패턴][patterns-spec]의 빈 상태·오류·권한·업로드·지도 동작은 이
요소들의 **조합 기준**입니다. 서버 요청, 파일 정책, 지도 타일과 제품 도메인 차트는
패키지가 만들지 않습니다. [제품별 적용 매핑][application-spec]을 최신
제품 코드와 다시 대조한 뒤 도입합니다. 앱 셸·헤더·메뉴는 소유자 결정 전이므로
이 패키지에 넣지 않았습니다.

## 유지 관리

토큰 값은 `tokens/source.json`, 공용 스타일은 `components/base.css`에서만 수정합니다.
`npm run tokens:build`와 `npm run react:build`로 생성물을 갱신합니다. `dist/`는
직접 편집하지 않습니다. `npm run check`는 생성 CSS 동기화, React 동작·타입을
검사합니다. HTML 견본과 달라지는 컴포넌트는 같은 변경에서 견본 또는 패키지를
함께 갱신해야 합니다.

[button-spec]: https://myqorrn1.github.io/DroMii-design-system/components/button.html
[icon-spec]: https://myqorrn1.github.io/DroMii-design-system/foundations/icons.html
[input-spec]: https://myqorrn1.github.io/DroMii-design-system/components/input.html
[badge-spec]: https://myqorrn1.github.io/DroMii-design-system/components/badge.html
[feedback-spec]: https://myqorrn1.github.io/DroMii-design-system/components/feedback.html
[table-spec]: https://myqorrn1.github.io/DroMii-design-system/components/table.html
[navigation-spec]: https://myqorrn1.github.io/DroMii-design-system/components/navigation-elements.html
[form-spec]: https://myqorrn1.github.io/DroMii-design-system/components/form.html
[chart-spec]: https://myqorrn1.github.io/DroMii-design-system/foundations/data-visualization.html
[patterns-spec]: https://github.com/myqorrn1/DroMii-design-system/blob/main/docs/PATTERNS.md
[application-spec]: https://github.com/myqorrn1/DroMii-design-system/blob/main/docs/APPLICATION.md
