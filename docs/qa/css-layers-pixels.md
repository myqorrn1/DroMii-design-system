# CSS 계층 분리 픽셀 비교 — 2026-10-07

- Chrome 2400×1098 CSS 픽셀 뷰포트, 고정 시간·애니메이션·캐럿 비활성화
- 비교: 캡처 JPEG 바이트 완전 일치(따라서 픽셀 차이 0)
- 대상: 루트 3개, `components/*.html` 14개 × 라이트·다크 = 34쌍
- [전후 캡처 모음](css-layers-contact-sheet.jpg): 각 행이 한 페이지이며 열 순서는 전/후 라이트, 전/후 다크

| 페이지 | 라이트 | 다크 |
|---|---:|---:|
| `index.html` | 0 | 0 |
| `ready.html` | 0 | 0 |
| `overview.html` | 0 | 0 |
| `components/auth.html` | 0 | 0 |
| `components/badge.html` | 0 | 0 |
| `components/button.html` | 0 | 0 |
| `components/d-find.html` | 0 | 0 |
| `components/feedback.html` | 0 | 0 |
| `components/form.html` | 0 | 0 |
| `components/input.html` | 0 | 0 |
| `components/k-aquas-business.html` | 0 | 0 |
| `components/navigation-elements.html` | 0 | 0 |
| `components/navigation.html` | 0 | 0 |
| `components/overlays.html` | 0 | 0 |
| `components/table-selection.html` | 0 | 0 |
| `components/table.html` | 0 | 0 |
| `components/workflows.html` | 0 | 0 |

CSS 선언 값은 변경하지 않았다. 분리 후 `navigation.html`의 기존 아이콘 상대 경로를 새 CSS 위치에 맞추고, 지도의 공통 버튼 글자 규칙이 셸 규칙에 덮이지 않도록 선택자 우선순위를 유지했다. React 생성 CSS는 동일한 공통 원본에서 다시 생성했다.
