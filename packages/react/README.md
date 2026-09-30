# @dromii/react

DroMii Core의 승인된 요소를 기존 토큰·CSS와 같은 DOM 규칙으로 쓰는 내부 React 패키지입니다.
앱 셸과 제품 업무 패턴, 실제 API 연결은 포함하지 않습니다.

루트에서 `npm run react:build`를 실행하면 원본 `tokens.css`와
`components/base.css`가 `dist/styles.css`로 묶입니다. 토큰 변수와 컴포넌트 CSS는
모두 `ThemeScope` 안에 한정됩니다. CSS 값을 여기서 수정하지
마세요. 폰트는 `font.css`로 분리해 기존 제품의 Pretendard 로드 방식과 충돌하지 않게
했습니다. 생성 CSS는 `ThemeScope`의 `data-dromii-react` 아래로 한정되어
기존 Bootstrap·MUI·제품 전역 클래스와 충돌하지 않습니다. 외부 폰트 CDN을 쓸 수
없는 제품은 자체 호스팅 폰트를 연결하세요.

현재 패키지는 사내 저장소용이며 npm 레지스트리에 게시하지 않습니다. 저장소 안에서는
워크스페이스로 참조하고, 별도 저장소에서는 `npm pack --workspace @dromii/react`로
만든 압축 파일을 설치할 수 있습니다. 제품별 실제 도입은 [적용 매핑](../../docs/APPLICATION.md)을
다시 확인한 뒤 진행합니다.

```jsx
import '@dromii/react/styles.css';
import { ThemeScope, Button, TextField, Banner } from '@dromii/react';

export function Example() {
  return (
    <ThemeScope brand="d-road" scheme="dark" density="default">
      <TextField label="작업 이름" name="name" required
        helperText="목록에 표시되는 이름입니다." />
      <Button variant="primary" onClick={() => {}}>저장</Button>
      <Banner tone="warning" title="자료가 지연되고 있습니다">
        마지막 확인 결과를 표시합니다.
      </Banner>
    </ThemeScope>
  );
}
```

React 18·19를 peer dependency로 받으며 JSX 변환을 패키지 소비자에게 요구하지 않는
ES 모듈입니다. `ThemeScope`는 `brand / scheme / density`를 설정합니다.
`compact`는 지도·표의 좁은 패널에만 둡니다. 하위의 MUI·Tailwind 컴포넌트에는
이 CSS 클래스가 자동으로 적용되지 않습니다.

## 포함 범위

- 버튼·아이콘 버튼, 텍스트·여러 줄·선택 필드, 체크박스·라디오·스위치
- 배지·선택 칩, 배너·토스트·네이티브 다이얼로그
- 표 컨테이너·기본 표·정렬 머리글·페이지 이동, 탭·툴팁
- 현재 경로·펼침·명령 목록(네이티브 `details`)
- 폼 섹션·그리드·작업 영역, 진행률·처리 중 표시

필드의 `error`는 오류 문구와 `aria-invalid`를 연결합니다. `Dialog`는 부모가
`open` 상태를 관리하고 `onClose`에서 false로 바꿔야 합니다. `Toast`의 성공·
정보·경고는 기본 4초 뒤 `onDismiss`를 호출하고, 실패는 기본 자동 소멸이 없습니다.
페이지 이동·정렬·저장·삭제·업로드·서버 응답은 제품이 연결합니다.

표·지도·업로드의 정상/빈/오류/권한/로딩을 컴포넌트가 자동으로 만들어 주지는
않습니다. [업무 패턴 기준](../../docs/PATTERNS.md)에 따라 화면에서 조합합니다.
제품별 유지·변경 경계는 [적용 가이드](../../docs/APPLICATION.md)를 따릅니다.
공통 SVG 아이콘과 기본 차트 표현은 기존 HTML·CSS 기준으로 제공하며,
이 패키지에 별도 React 래퍼는 두지 않았습니다.
