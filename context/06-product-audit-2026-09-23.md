# 제품 소스 재감사 — 2026-09-23

## 기준과 한계

이 기록은 **제품 코드 → Core 공통화 가치 → KRDS·접근성 점검** 순서 중 첫 단계의
실측 자료다. Core 값의 채택·폐기 결정은 이 문서에서 하지 않는다. 그 결정은
`docs/MIGRATION_MAP.md`와 `docs/KRDS_ALIGNMENT.md`를 작성한 뒤 소유자 승인을 받는다.

- **K-AQUAS:** 로컬 `~/Desktop/DroMii/K-AQUAS_Code/src`와 `package.json`을 읽었다.
  `frontend/src`가 아니라 저장소 루트의 `src`가 실제 경로다. 현재 커밋은
  `df8cf9d`이고 `src`에는 미커밋 변경이 없다. 로컬 `build/index.html`의 SHA-256은
  `8137a768641a65819dd25d1c8749ea4a1417ca8215c0a6bfd862fed3d0f9835a`로
  앞선 운영 페이지 확인 기록과 같다. 빌드 일치는 개별 소스와 번들의 일치를 보증하지 않는다.
- **D-ROAD:** 운영 페이지의 빌드로 확인한 서버
  `/home/dromii/dromii_v5_react/build/index.html`의 SHA-256이 앞선 기록과 같은
  `d4a13db23e9151d23b315d940bf420d726c3463165abd747d305a8bd2257c243`임을
  재확인했다. 같은 폴더의 `src` 전체와 `package.json`을 SSH로 **읽기만** 했다.
  이 소스가 해당 번들을 생성했다는 빌드 기록·소스 맵은 확인하지 못했다.
- 색·치수 출현 횟수는 원본 텍스트의 정적 집계다. 주석, 복사본, 미사용 화면,
  미평가 JSX·styled-components 식도 포함할 수 있다. 브라우저 계산 스타일이나
  실제 사용자 노출 빈도와 같지 않다. K-AQUAS의 지도 데이터 상수 5개(각 1MB 초과)는
  시각 스타일 집계에서 제외하고 나머지 JS·JSX·CSS 80개를 스캔했다. D-ROAD는
  JS·JSX·CSS 87개(그중 CSS 29개)를 스캔했다. 인증 후 화면과 키보드 사용성은
  시험하지 않았다. 민감한 데이터·설정·소스 전문은 이 저장소에 복사하지 않았다.

## 값과 구현의 현재 모습

| 항목 | K-AQUAS 현행 로컬 소스 | D-ROAD 운영 폴더 React 소스 |
|---|---|---|
| 색 | 밝은 관리자 화면과 지도 화면. `#5098EC` 파랑, `#002B9A` 진한 파랑이 반복된다. `#FFFFFF`, `#333333`, `#CCCCCC`, `#767676` 등 중립값도 분산돼 있다. 원본 6자리 hex 정규화 기준 217종. MUI 기본 파랑 `#1976D2`와 Bootstrap 계열 파랑 `#007BFF`도 보인다. | 작업 화면은 `#2B2E3A` 페이지, `#343743` 패널, `#484C5E` 경계·면에 `#9D91FF` 보라를 강조한다. 인증 화면에는 `#FF6B00` 주황도 있다. 같은 기준 51종. 로그인용 주황을 곧바로 Core 브랜드색으로 올리지 않는다. |
| 글자·단위 | `font-size`의 많은 값은 14px(45곳), 12px(43), 12.8px(41), 11px(24)이다. `0.8rem`도 있다. 전역 서체는 Pretendard. 일부 지도 패널에 `vw` 글자가 있고, 본문 행간은 1.35·1.5 등으로 혼재한다. | `font-size`는 16px(24곳), 24px(12), 14px(9), 13px(8) 등이 있고 `1vw`, `1.3vw`, `1.6vw` 같은 값도 있다. `System.css`는 제목 1.6vw, 보조 글자 0.9vw·0.8vw를 쓴다. 전역은 시스템 폰트 스택이며 공통 본문 행간은 선언돼 있지 않다. |
| 간격 | 5·10·20px이 많고 7·4·12·8px도 함께 쓴다. 관리 셸은 좌측 240px, 상단 60px, 내용 패딩 24px이다. 지도 제어는 더 조밀하다. | 10·16·8·24·4px이 많다. 메뉴 패널은 최소 250px이며 17% 폭, 헤더 높이 3vw, 패널 높이 90vh를 사용한다. 127개의 `vw` 문자열 출현에는 주석·인증/약관 화면도 포함된다. |
| radius | 4·5·6px이 반복되고 8·10px도 쓴다. MUI `sx`의 숫자 radius와 styled-components의 px가 섞여 있다. | 4·10·6·5px과 0.5·0.3·0.2vw가 함께 있다. 같은 로그인 카드에서도 10px과 0.5vw를 연속 선언한다. |
| 컨트롤 높이 | `height: 30px` 29곳, 40px 17곳, 42px 8곳, 24px 5곳. 지도 도구와 관리 입력을 같은 높이로 볼 수 없다. | 44px·40px이 각각 13곳, 24px 9곳. 50px은 모달 헤더 등에 반복된다. `height` 집계는 컨트롤 외 패널도 포함하므로 용도별 분리가 필요하다. |
| 구성·MUI | 관리자 셸은 `ManagerPage.js` 안의 `Sidebar`·`MenuItem`·`Header`, 지도는 별도 제어 컴포넌트다. 사용자·로그 표는 MUI `Table`·`TablePagination`을 쓴다. MUI `^5.15.21`, styled-components, Bootstrap 혼용. **현재 `createTheme`가 존재**하지만 `index.js`에서 포털 겹침을 막는 z-index만 설정하며 색·글자·간격 테마는 없다. | `MainPage.jsx`가 `Header`, `MenuBar`, 지도·관리 패널을 조합한다. 사용자·로그 표에 MUI `Table`·`Pagination`을 사용하고, 업로드는 FilePond다. MUI `^7.2.0`; MUI import는 8개 파일에 있고 전역 `createTheme`는 없다. 대부분의 표면은 컴포넌트 CSS다. 사용자 생성 CSS는 로딩되지 않는 다른 CSS 파일의 `--color_*` 정의를 참조한다. |

집계 횟수는 코드 정리 우선순위를 찾기 위한 **참고값**이다. 값별 출처와 현재 화면에서의
역할은 아래 파일을 열어 검증했다. K-AQUAS:
`src/pages/AdminPage/ManagerPage.js`, `UserList.js`, `UserLog.js`,
`src/components/controls/YeongjuMeuncontrol.js`,
`src/components/Tabs/PollutionTab.jsx`, `src/index.js`, `src/index.css`.
D-ROAD: `src/pages/MainPage/MainPage.jsx`, `MainPage.css`,
`src/components/Header/Header.jsx`, `Header.css`, `src/components/MenuBar/MenuBar.jsx`,
`MenuBar.css`, `src/components/System/System.css`, `System.jsx`,
`src/components/LogSystem/Logsystem.jsx`, `src/components/Popup/UserCreate/UserCreate.jsx`,
`UserCreate.css`, `src/components/Popup/DataUpload/DataUpload.jsx`.

## 구조와 접근성에서 확인한 문제

- **두 제품의 공통 후보:** 상단 제품·계정 영역, 좌측 업무 탐색, 표·검색·페이지 이동,
  입력·업로드·확인·상태 피드백이 반복된다. 메뉴의 항목·순서, 지도 도구와 분석 상태는
  제품 맥락으로 남겨야 한다. Core의 구체적인 유지·변경 경계는 단계 3에서 매핑한다.
  D-ROAD 사용자 생성 폼은 이메일과 이름 등의 단일 열에 비밀번호·확인 필드를
  나란히 둔다(`UserCreate.css:88–103`). 현재 Core의 1열 폼 견본도 제품 흐름과
  대조하기 전에는 최종 규칙으로 취급하지 않는다.
- **K-AQUAS 관리자 메뉴:** `ManagerPage.js:52–54,86–96`의 `styled.div`를 클릭해
  메뉴를 바꾸며 키보드 조작을 위한 버튼 의미나 키 처리 근거가 없다. `Sidebar` 글자색
  `#767676`을 활성 메뉴 배경 `#002B9A`에도 상속하면 계산 명도 대비는 **2.55:1**이다.
  해당 화면의 실제 계산 스타일은 브라우저에서 다시 확인해야 하지만, 제품 코드상
  수정 후보임은 분명하다. 현재 색값 자체를 버릴 근거는 아니다.
- **D-ROAD 메뉴·헤더·업로드:** `MenuBar.jsx:30,38,57`, `Header.jsx:136–162`,
  `ProjectList.jsx:169–239`, `DataUpload.jsx:164` 등에 클릭 가능한 `div`가 있다.
  전체 JS·JSX의 `<div ... onClick>` 정적 출현은 47곳이고 명시적 `tabIndex`,
  `onKeyDown`, `aria-*`는 스캔에서 보이지 않았다. MUI 내부 제공 접근성까지 이
  수치로 부정할 수는 없다. `ProjectList.jsx:182,193,211`의 아이콘 이미지는
  `alt`가 없는 예다. 반면 헤더 로고에는 `alt`가 있다.
- **D-ROAD 입력 포커스:** `UserCreate.css:13–20,32–39`의 입력·선택은 `outline: none`을
  선언하고, 확인한 포커스 규칙은 플레이스홀더를 숨기는 데 그친다. 이 폼의 키보드
  포커스 가시성은 별도 확인이 필요하다. `UserCreate.jsx`의 `label for`는 React에서
  `htmlFor`로 바꿔 연결을 확인해야 한다. 권한·상태 `select`에는 명시적 레이블이 없다.
- **D-ROAD 폼 CSS의 연결 문제:** `UserCreate.css`는 전역 `input`·`select`·`textarea`
  선택자를 사용하고 `var(--color_surface)` 등을 참조한다. 변수 정의는 별도
  `CreateModal.css:7–12`에만 있는데, `src`의 JS·JSX·CSS 어디에도 이 파일의 import가
  없다. 실제 번들에서 변수의 유효 여부는 확인하지 못했지만, 현재 소스 계통에서는
  정의되지 않은 변수와 전역 스타일 누출이 함께 발생할 수 있다.
- **읽기·확대:** K-AQUAS의 11–13px와 1.35 행간, D-ROAD의 `vw` 글자·헤더·반경은
  확대 및 좁은 화면에서 재검증해야 한다. D-ROAD `MenuBar.css:3–4`의 `min-width:250px`
  와 90vh, `Header.css:4`의 3vw 높이는 그대로 Core 치수로 승격하지 않는다.
- **색 조합 표본:** D-ROAD `MenuBar.css:60–66`의 흰 글자 `#FFFFFF`/보라 배경
  `#9D91FF`는 **2.65:1**이다. 활성 탭의 보라 글자 `#9D91FF`/회색 배경
  `#45485A`는 **3.41:1**이다. 두 기준색을 유지하면서 사용 위치나 글자색을
  조정할 필요가 있다. 이 값은 불투명 sRGB 색 두 개의 정적 계산이며 실제 상태·
  오버레이·브라우저 렌더 결과를 검증한 값은 아니다.
- **상태·피드백:** D-ROAD는 `alert()` 46회, K-AQUAS는 6회가 정적 검색에 잡힌다.
  D-ROAD의 업로드는 완료 뒤 AI 분석 시작이 별도 단계여서 `DataUpload.jsx`의
  성공·부분 성공·분석 실패를 하나의 성공 토스트로 뭉치지 말아야 한다.
  K-AQUAS에는 처리 현황의 `role="status"`, `aria-label`, 실패 단서가 9월 변경에
  추가됐다. 상태 표시의 공통화는 이 개선과 D-ROAD 흐름을 함께 보고 결정한다.

## 8월 28일 기록과 달라진 점

- `context/01-as-is.md`의 **K-AQUAS 테마 레이어 없음**은 현재 사실이 아니다.
  9월 변경으로 `src/index.js`에 MUI `ThemeProvider`와 z-index 설정이 추가됐다.
  다만 색·글자·간격의 공용 테마가 없다는 문제는 남아 있다.
- `context/01-as-is.md`의 D-ROAD 색·폰트·`vw`·구성 수치는 당시 스냅샷 및 이후
  Vite 후보와 섞여 있어 **운영 React 소스의 현재 빈도로 재사용하지 않는다**.
  이 문서의 51색·16px 24곳·`vw` 127곳 등의 정적 집계를 현행 참고값으로 쓴다.
- K-AQUAS에서 8월 28일 이전 마지막 소스 커밋 `e2a6171`부터 현재까지 `src` 20개
  파일이 바뀌었다. 주요 디자인 영향은 처리 현황·오류 상태와 업로드 안내, 모달의
  높이 제한, MUI 포털 z-index 및 SweetAlert 레이어 조정이다. 기존 28,735줄·색 빈도는
  현재 소스의 값으로 대체하지 않는다.
- 앞선 `context/05-live-frontends-2026-09-23.md`의 K-AQUAS 원본·빌드 경로를
  `src`·`build`로 바로잡았다. 경로 오류는 파일 내용이나 해시 판단에는 영향을 주지 않는다.

## 단계 3으로 넘길 확인점

1. 제품별 역할과 화면 맥락을 붙여 색·서체·간격·반경·컨트롤 높이를 Core와
   **유지 / 변경 / 폐기**로 매핑한다. 로그·지도·관리의 밀도를 한 값으로 합치지 않는다.
2. K-AQUAS의 11–13px, D-ROAD의 13–16px·`vw`, 현재 Core 13px을 함께 놓고
   본문 크기와 `default / compact` 선택지를 제시한다.
3. D-ROAD 다크 기본값과 고대비 명도 축의 자리를 선택지로 정리한다. 인증 화면의
   주황과 업무 화면의 보라를 같은 역할로 취급하지 않는다.
4. K-AQUAS z-index 테마와 D-ROAD CSS·MUI 혼용을 고려해 적용 시 기존 모습을
   보존하는 토큰 연결 순서를 설계한다. 이 단계에서 제품 코드는 수정하지 않는다.
