# @dromii/react

HTML 견본과 같은 역할 토큰·CSS를 사용하는 DroMii Core React 패키지입니다. 버전은
`0.3.0`이며, 현재 사내 전달용 압축 파일로 관리합니다. 앱 셸·제품 API·권한 정책은
포함하지 않습니다.

## 설치와 사용

디자인시스템 저장소에서 압축 파일을 만들고, 적용할 React 제품에서 설치합니다.
npm 레지스트리에 게시하지 않으므로 각 제품은 사용한 파일과 버전을 고정해야 합니다.

```bash
npm ci
npm run react:build
npm run check
npm pack --workspace @dromii/react
# 제품 저장소에서: npm install ./dromii-react-0.3.0.tgz
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
| [인증][auth-spec] | `AuthLayout`, `AuthLoginForm`, `AuthSignupForm`, `PasswordField`, `GoogleLoginButton`, `authProductPresets` | 제품별 방식 유지, 인증·가입·이메일·Google 처리는 제품 함수로 연결 |
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

## 인증 화면 사용

[제품별 인증 사용 예시](examples/AuthUsage.tsx)는 세 제품의 로그인과 두 가입 폼을 보여줍니다.
`AuthLayout`은 자체 `ThemeScope`와 중앙 카드·제목·제품 식별을 제공하고, 제품이 `logo`
슬롯에 `className="auth-brand"`인 이미지와 대체 텍스트를 넣습니다. 로고 파일·라우터·약관은
제품에서 공급합니다. 부모의 다른 Core 영역도 해당 브랜드의 `ThemeScope`로 감쌉니다.

| 제품 | 인증 구성 | 제품이 공급할 것 |
| --- | --- | --- |
| K-AQUAS | 이메일 로그인, 회사 선택 가입, 필수 이용약관·개인정보 동의 | `onSubmit`, `companyOptions`, 정책 문서 열기 |
| D-ROAD | 이메일 로그인, 회사 직접 입력 가입, 코드 인증, 필수 개인정보·선택 마케팅 | `onSubmit`, `verification`, 정책 문서 열기·비밀번호 찾기 경로 |
| D-FIND | Google 로그인, 기존 흰색 primary | `onGoogleSignIn`, `googleIcon`, 실제 정책 링크. 별도 가입 폼 없음 |

기본 폼은 필수 입력·이메일 형식·비밀번호 확인·필수 동의를 확인합니다. 길이·복잡도·회사
목록·전화번호 규칙·동의 문서 버전·가입 승인·기억 옵션·세션 저장은 제품 정책입니다.
`passwordHelperText`로 실제 비밀번호 정책을 안내합니다. `onPolicyOpen`을 생략하면 문서
열기 버튼은 비활성입니다. 실제 문서 연결 전에는 운영 가입 화면으로 배포하지 않습니다.
Google의 기본 `G`는 시안용 텍스트이므로 제품의 제공자 버튼 자산을 `googleIcon`으로 공급합니다.

### 제출과 서버 응답

- `AuthLoginForm`의 `onSubmit({ email, password, remember })`는 제품 로그인 함수입니다.
  `remember={false}`면 선택 항목을 숨기고 값도 false로 전달합니다.
- `AuthSignupForm`의 `onSubmit`은 `email / password / name / company / phone / privacy`와
  제품에 해당하는 `terms`·`marketing`·`verification`만 전달합니다. 확인 비밀번호·인증
  코드는 최종 가입 자료에 넣지 않습니다. 기존 API의 필드명 변환은 제품 어댑터에서 합니다.
- 함수는 실제 성공 때 완료하고, 실패 때 `{ error, fieldErrors }`를 반환하거나 예외를
  던집니다. `fieldErrors` 키는 `AuthField`의 필드명입니다. `{ message }`는 성공 안내입니다.
  예외의 내부 메시지는 사용자에게 노출하지 않고 공통 실패 문구를 보입니다.
- 처리 중 중복 제출을 막고 실패 시 입력을 유지합니다. 오류 요약에 초점을 보내고 각
  오류 링크는 해당 입력으로 이동합니다. 외부 작업에는 `loading`·`error`를 전달할 수 있으며
  제어하는 제품이 이 값을 해제합니다. 제품 전환 시 폼 내부 상태는 초기화됩니다.
- 컴포넌트는 `fetch`, 이메일 발송, 토큰·쿠키·localStorage 저장이나 자동 리다이렉트를
  수행하지 않습니다. Google 인증과 성공 후 이동도 제품 함수가 담당합니다.

### D-ROAD 이메일 인증 연결

`verification`에는 세 비동기 함수가 필요합니다.

```ts
checkEmail(email) => { available: boolean, message?: string }
sendCode(email) => { challenge: string, message?: string }
verifyCode({ email, code, challenge }) => { proof: string, message?: string }
```

`challenge`와 `proof`는 제품 서버의 인증 흐름에 대응하는 식별값입니다. 제품 어댑터가
기존 API 응답을 이 인터페이스로 연결합니다. 재발송·이메일 변경은 이전 인증 결과를
지우고, 이메일 변경·제품 전환·언마운트 뒤 도착한 응답은 무시합니다. 실제 요청의 취소·
재발송 제한·만료·서버 가입 검증은 제품 책임입니다. Core의 완료 표시를 서버 인증으로
신뢰하면 안 됩니다. 서버는 가입 요청의 이메일과 인증 증거를 재검증해야 합니다.
가입 콜백에는 `verification: { email, proof }`를 전달하며, 고정된 테스트 코드나 가상
인증 성공은 패키지에 포함하지 않습니다.

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

[auth-spec]: https://myqorrn1.github.io/DroMii-design-system/components/auth.html

아이콘은 Lucide 0.468.0 공식 도형을 사용하며 `LICENSE-icons`를 패키지에 포함합니다.
공개 `Icon` 이름 12개는 유지하고, 출처·재생성 기준은
[공통 시각 스타일](../../docs/VISUAL_STYLE.md#아이콘-출처와-사용-기준)을 따릅니다.
