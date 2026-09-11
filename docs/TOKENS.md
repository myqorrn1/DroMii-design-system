# 디자인 토큰

## 목적

토큰은 화면에 직접 쓰는 색과 수치를 한 곳에서 관리하고, K-AQUAS·D-ROAD·D-FIND가
같은 역할 이름을 사용하게 합니다. 제품 코드와 문서는 생성된 `tokens.css`를 사용합니다.

현재 v0.15는 고유 토큰 194개와 테마별 선언 260개를 갖습니다.

## 파일 역할

- `tokens/source.json`: 사람이 수정하는 유일한 값 원본
- `tokens.css`: `source.json`에서 생성되는 CSS 변수
- `scripts/build-tokens.mjs`: JSON을 CSS로 생성
- `scripts/check.mjs`: 별칭, 참조, 링크, 라벨, 주요 대비 검사

`tokens.css`는 직접 수정하지 않습니다.

## 변경 순서

```bash
# 1. tokens/source.json 수정
npm run tokens:build
npm run check
```

그다음 `components/base.css`에서 역할 토큰을 사용하고 HTML 견본에서 확인합니다.

## 목표 계층

### Reference

색상 단계, 간격, 글자 크기, radius처럼 의미가 붙기 전의 원시 값입니다.

```text
neutral-200
space-4
text-body
radius-sm
```

### Semantic

제품과 화면에서 같은 의미로 사용하는 역할입니다.

```text
surface-page
text-primary
border-default
status-warning-text
```

### Component

컴포넌트의 특정 위치와 상태를 표현합니다. semantic 토큰만 참조합니다.

```text
button-primary-background
input-border-focus
table-row-selected
```

v0.15에는 reference와 semantic 구분이 들어가 있지만 component 계층은 아직
`components/base.css`에 일부 남아 있습니다. 디자인 확정 전에 JSON 계층으로 옮깁니다.

## 제품 설정 축

현재는 `data-product="k-aquas"`와 `data-product="d-road"`가 색과 명도를 함께 바꿉니다.
최종 구조에서는 다음 축을 분리합니다.

- `brand`: K-AQUAS, D-ROAD, D-FIND의 기준색과 제품 이름
- `scheme`: light, dark
- `density`: compact, default

같은 제품도 업무 화면에 따라 명도나 밀도를 바꿀 수 있어야 합니다.

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

