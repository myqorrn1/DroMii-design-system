# 디자인 토큰

## 목적

토큰은 화면에 직접 쓰는 색과 수치를 한 곳에서 관리하고, K-AQUAS·D-ROAD·D-FIND가
같은 역할 이름을 사용하게 합니다. 제품 코드와 문서는 생성된 `tokens.css`를 사용합니다.

현재 v0.16은 고유 CSS 토큰 211개를 `reference / semantic / component` 3계층에서
생성합니다. 토큰 경로는 브랜드·명도·밀도별 중복 선언을 포함해 300개입니다.

## 파일 역할

- `tokens/source.json`: 사람이 수정하는 유일한 값 원본
- `tokens.css`: `source.json`에서 생성되는 CSS 변수
- `scripts/build-tokens.mjs`: JSON을 CSS로 생성
- `scripts/check.mjs`: 별칭, 참조, 링크, 라벨과 명도 등급별 대비 검사

`tokens.css`는 직접 수정하지 않습니다.

## 변경 순서

```bash
# 1. tokens/source.json 수정
npm run tokens:build
npm run check
```

그다음 `components/base.css`에서 역할 토큰을 사용하고 HTML 견본에서 확인합니다.

## 토큰 계층

### Reference

색상 단계, 간격, 글자 크기, radius처럼 의미가 붙기 전의 원시 값입니다. 글자 크기의
원시 값은 16px 브라우저 기본 글자 크기를 기준으로 `rem`을 사용합니다.

```text
dm-neutral-200
dm-space-4
dm-font-size-16
dm-radius-sm
```

### Semantic

제품과 화면에서 같은 의미로 사용하는 색상 역할입니다. `brand`에는 기준색 단계와
제품 강조 역할, `scheme`에는 표면·본문·상태 색 역할이 있습니다.

```text
dm-primary-solid
dm-surface-page
dm-text-primary
dm-status-warning-text
```

### Component

컴포넌트 크기와 글자 역할입니다. `base`는 실측에서 정리한 고정 치수,
`density.default / compact`는 읽기 크기와 좁은 컨트롤·표의 치수를 정합니다.

```text
dm-control-h-md
dm-control-font-md
dm-table-row-h
dm-text-body
```

`components/base.css`는 이 세 계층에서 생성된 역할 변수를 참조합니다. 색상 단계 값은
컴포넌트 CSS에 직접 넣지 않습니다.

## 제품 설정 축

세 축을 같은 상위 요소에 지정합니다.

```html
<div data-brand="d-road" data-scheme="dark" data-density="default">…</div>
<div data-brand="k-aquas" data-scheme="light" data-density="compact">…</div>
```

각 축의 의미는 다음과 같습니다.

- `brand`: K-AQUAS와 D-ROAD의 기존 기준색. D-FIND는 제품 감사 후 추가
- `scheme`: light, dark. `high-contrast`는 JSON에 자리만 있고 선택 가능한 표현은 아님
- `density`: default는 본문 16px·일반 컨트롤 40/44px, compact는 표·지도 패널에만
  본문 14px·일반 컨트롤 32px. 24px은 아이콘 전용

기존 `data-product="k-aquas"`는 K-AQUAS·light, `data-product="d-road"`는
D-ROAD·dark의 호환 프리셋으로 계속 작동합니다. 새 화면은 명시적인 세 축을 씁니다.
제품과 명도를 함께 설정하려면 같은 상위 요소에 놓습니다. 고대비 자리의 구현은
후속 승인을 기다립니다.

## 명도 대비 규칙

색상 단계의 숫자를 그대로 KRDS 숫자로 다시 매기지 않습니다. 기존 기준색을 보존하면서
[KRDS 색상 매직 넘버](https://www.krds.go.kr/html/site/style/style_02.html)의
40→3:1, 50→4.5:1, 70→7:1, 90→15:1을 **역할 색상 조합의 검사 등급**으로 씁니다.
검사 조합은 `source.json`의 `org.dromii.contrastChecks`에 있고 `npm run check`가
두 브랜드 × 두 명도 조합에서 확인합니다. 이 자동 검사는 등록된 조합만 검사하므로
실제 화면의 모든 대비·오버레이·포커스 상태 검증을 대체하지 않습니다.

## 컴포넌트에서 쓰는 방식

```css
.example {
  color: var(--dm-text-primary);
  background: var(--dm-surface-card);
  border-color: var(--dm-border-default);
}
```

다음처럼 reference 색상이나 hex를 직접 사용하지 않습니다.

```css
.example {
  background: #5098ec;
  color: var(--dm-accent-500);
}
```

## 토큰 추가 기준

1. 기존 역할로 표현할 수 없는 의미인지 확인합니다.
2. 두 개 이상의 컴포넌트에서 반복되는지 확인합니다.
3. 제품별로 값이 달라도 역할이 같은지 확인합니다.
4. 일반·hover·pressed·focus·disabled 상태를 함께 검토합니다.
5. 라이트와 다크에서 대비와 위계가 유지되는지 검사합니다.
6. 원본, 생성 CSS, 견본, 문서를 한 변경으로 갱신합니다.
