# dist 생성·릴리스 픽셀 비교 — 2026-10-07

- Chrome 2400×1098 CSS 픽셀 뷰포트, 고정 시간·애니메이션·캐럿 비활성화
- **CSS 배포 파일 생성 단계:** 변경 전 원본과 v0.21.0 상태의 변경 후 캡처 34쌍이 JPEG 바이트까지 일치해 픽셀 차이 0.
- **최종 v0.22.0 릴리스:** 자동 버전 표기가 바뀌므로 원본 픽셀 차이는 0이 아니다. 아래 값은 버전 표기와 브라우저 커서 캡처를 포함한 원본 차이이며, 두 영역을 제외한 화면의 차이는 34쌍 모두 0이다.
- [전후 캡처 모음](dist-contact-sheet.jpg): 열 순서 v0.21/v0.22 라이트, v0.21/v0.22 다크.
- 제외 영역: 버전 표기는 `index.html`의 두 표시 위치, `overview.html`의 머리말, 그 밖의 페이지 오른쪽 아래 배지. 커서는 캡처 장치가 화면에 그린 포인터 영역이다. 둘 다 CSS 구성이나 제품 디자인 값의 변화가 아니다.

| 페이지 | 라이트 원본 차이 | 다크 원본 차이 | 버전·커서 제외 |
|---|---:|---:|---:|
| `index.html` | 1394 | 2760 | 0 |
| `ready.html` | 3210 | 2060 | 0 |
| `overview.html` | 1534 | 3453 | 0 |
| `components/auth.html` | 2382 | 2485 | 0 |
| `components/badge.html` | 3247 | 3015 | 0 |
| `components/button.html` | 3712 | 1605 | 0 |
| `components/d-find.html` | 2816 | 1172 | 0 |
| `components/feedback.html` | 2742 | 3387 | 0 |
| `components/form.html` | 3037 | 2527 | 0 |
| `components/input.html` | 2392 | 1591 | 0 |
| `components/k-aquas-business.html` | 2855 | 2968 | 0 |
| `components/navigation-elements.html` | 1608 | 2547 | 0 |
| `components/navigation.html` | 3694 | 4072 | 0 |
| `components/overlays.html` | 1488 | 4250 | 0 |
| `components/table-selection.html` | 3922 | 3195 | 0 |
| `components/table.html` | 3867 | 2562 | 0 |
| `components/workflows.html` | 3219 | 2576 | 0 |
