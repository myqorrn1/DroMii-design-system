# 운영 프론트 기준 재확인 — 2026-09-23

이 문서는 디자인 판단에 사용할 **실제 운영 화면의 코드 계통**을 확인한 기록이다.
제품 코드를 수정하거나 로그인 후 업무 흐름을 시험하지 않았다.

## 어느 소스를 기준으로 볼 것인가

### K-AQUAS

- 프론트 원본: 로컬 `K-AQUAS_Code` 프로젝트의 `frontend/src/`.
- 운영 페이지 `https://k-aquas.dromii.com/`의 `index.html` SHA-256은 로컬
  `frontend/build/index.html`과 일치했다: `8137a768641a65819dd25d1c8749ea4a1417ca8215c0a6bfd862fed3d0f9835a`.
- 운영 서버의 `dromii_v3_react/build`에는 빌드 결과가 있고, 원본 소스는 로컬 저장소에
  있다는 위치 대장도 확인했다. 빌드 일치만으로 개별 소스 파일의 동일성을 증명하지는 않는다.

### D-ROAD

- 운영 페이지 `https://d-road.dromii.com/`의 `index.html` SHA-256은 서버
  `/home/dromii/dromii_v5_react/build/index.html`과 일치했다:
  `d4a13db23e9151d23b315d940bf420d726c3463165abd747d305a8bd2257c243`.
- 서버 `/home/dromii/dromii_V5_vite/dist/index.html`은 다른 해시
  (`f796f06abcb021454c9040aedf2d5baee00429936664c2b22823952d7595e6cd`)다.
  따라서 9월 11일의 Vite 폴더 분석은 **운영 D-ROAD 프론트의 근거가 아니다**.
- 이번 디자인 감사는 운영 빌드와 같은 폴더의 `dromii_v5_react/src/`를 기준으로 다시 했다.
  해당 소스가 빌드를 만들었다는 빌드 기록이나 소스 맵은 확인하지 못했으므로, 소스와
  운영 번들의 세부 일치는 확정하지 않는다.

## 디자인에 영향을 주는 관찰

| 영역 | K-AQUAS 프론트 | D-ROAD 운영 폴더의 React 소스 | Core 판단 |
|---|---|---|---|
| 전역 구조 | 관리자 화면은 약 240px 좌측 메뉴와 60px 상단 제목 영역. 지도 화면은 별도 도구 구성이 큼 | 전역 헤더 뒤에 최소 250px 좌측 업무 패널, 데이터·관리 탭과 프로젝트 목록 | 상단의 제품·계정 영역과 좌측의 맥락 탐색을 공용 부품으로 분리. 메뉴 내용과 배치는 업무 설정으로 주입 |
| 명도 | 관리자 화면은 밝은 회색·흰색 중심 | 작업 화면은 `#2B2E3A` 페이지, `#343743` 패널, `#484C5E` 경계 중심 | 라이트·다크를 Core의 독립된 표현 축으로 유지 |
| 강조 | K-AQUAS 파랑 계열, 여러 MUI 기본값 혼재 | 작업 화면에 `#9D91FF` 보라 사용. 로그인에는 주황도 있음 | 기존 기준색은 유지하되 강조의 위치와 접근 가능한 글자색은 Core 규칙으로 제한 |
| 탐색 상태 | 관리 메뉴는 클릭 요소와 이모지 사용 | 데이터·관리 탭과 프로젝트 그룹, 사용자 메뉴는 주로 클릭 가능한 `div` 사용 | 시각 선택 상태뿐 아니라 링크·버튼 의미, 키보드 포커스와 펼침 상태를 Core에서 정의 |
| 데이터 업무 | 관리형 표·폼·페이지네이션과 지도 제어 | 사용자 관리·로그 표, 파일 업로드, 프로젝트·지도 조작 | 표·폼·피드백은 공통. 지도·도메인 필드는 확장 범위를 별도 판단 |

근거 파일: K-AQUAS `frontend/src/pages/AdminPage/ManagerPage.js`,
`frontend/src/pages/AdminPage/UserList.js`,
D-ROAD `src/pages/MainPage/MainPage.jsx`, `src/components/Header/Header.jsx`,
`src/components/Header/Header.css`, `src/components/MenuBar/MenuBar.jsx`,
`src/components/MenuBar/MenuBar.css`, `src/components/System/System.css`.

## 아직 검증하지 않은 것

- 로그인 후 운영 화면의 실제 상호작용, 권한별 메뉴와 작업 순서
- D-ROAD React 소스 전체와 운영 번들의 파일별 동일성
- 두 제품의 1024·1200·1440·1920px 실사용 화면 검토

대표 화면은 이 항목과 Core 디자인이 확정된 뒤 다시 만든다.
