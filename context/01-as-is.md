# 현재 상태 — 코드 실측

> K-AQUAS `src/` **28,735줄** + D-ROAD `src/` **8,033줄** 전수 스캔 (2026-08-28)
> `.js .jsx .css` 정규식 스캔. 3자리 hex와 `rgb()`는 6자리로 정규화해 집계.
> D-FIND는 코드가 없어 측정 제외.

이 문서는 **판단의 재료**입니다. 무엇을 그대로 둘지, 무엇을 고칠지는
`02-keep.md`와 `03-rules.md`에 있습니다.

---

## 1. 두 제품의 기술 스택

| | K-AQUAS | D-ROAD |
|---|---|---|
| React / MUI | 18.3 / 5.15 | 19.1 / 7.2 |
| 스타일 방식 | styled-components + MUI `sx` + Bootstrap 전역 CSS | 컴포넌트별 순수 CSS 30개 파일 |
| 테마 레이어 | **없음** (`createTheme` 0건) | **없음** |
| 기본 명도 | 라이트 | 다크 |
| 본문 폰트 | Pretendard (jsDelivr CDN) | 시스템 폰트 스택 |
| 간격 단위 | px 1,133 · vh 56 · vw 24 | px 546 · **vw 80** · vh 8 |

**양쪽 다 테마 레이어가 없습니다.** 걷어낼 기존 시스템이 없어 위에 한 겹 얹기만 하면 됩니다.

---

## 2. 색상 — 237종

고유 색상 K-AQUAS **196** · D-ROAD **58** · 공통 **17** · 합집합 **237**.

공통 17개 중 `#36A2EB` `#FF6384` `#FFCE56`는 양쪽이 같은 **Chart.js 기본 팔레트**를
그대로 쓴 결과이지 합의가 아닙니다.

### 역할별 분포 (상위)

**K-AQUAS**

| 색 | 총 | 배경 | 텍스트 | 보더 |
|---|---|---|---|---|
| `#FFFFFF` | 80 | 47 | 30 | 3 |
| `#333333` | 45 | 0 | **45** | 0 |
| `#CCCCCC` | 35 | 0 | 4 | **31** |
| `#5098EC` | 20 | 15 | 4 | 1 |
| `#DBDBDB` | 18 | 0 | 3 | 15 |
| `#002B9A` | 15 | 10 | 2 | 3 |

**D-ROAD**

| 색 | 총 | 배경 | 텍스트 | 보더 |
|---|---|---|---|---|
| `#343743` | 52 | **52** | 0 | 0 |
| `#9D91FF` | 49 | 9 | 15 | **25** |
| `#FFFFFF` | 46 | 6 | 36 | 4 |
| `#272934` | 35 | 28 | 7 | 0 |
| `#484C5E` | 30 | 20 | 0 | 10 |
| `#2B2E3A` | 19 | 19 | 0 | 0 |

### 중복 묶음

- **파랑 6종** — `#002B9A`(브랜드) `#5098EC`(브랜드) `#3777D3` `#2D66AD` +
  `#1976D2`(MUI 기본) `#007BFF`(Bootstrap 기본). 뒤 둘은 브랜드 색이 아니라
  `App.js`의 전역 `bootstrap.min.css` import와 MUI 기본값이 섞여 들어온 것.
- **텍스트 회색 8종** — `#333333` `#555555` `#666666` `#767676` `#777777` `#7D7D7D` `#888888` `#999999`
- **보더 회색 7종** — `#CCCCCC` `#DBDBDB` `#D8DEE5` `#DDDDDD` `#D9D9D9` `#CED6DF` `#EEEEEE`
- **초록 7종 · 빨강 7종 · 주황 9종** — 시멘틱 의미는 같은데 값이 제각각

---

## 3. 반복 구현

| 요소 | K-AQUAS | D-ROAD | 합계 |
|---|---|---|---|
| 버튼 | styled 정의 31 + MUI `<Button>` 32 + `<IconButton>` 9 | CSS 클래스 26 + `<button>` 21 | **119** |
| 모달 | `<Dialog>` 12 + `<Modal>` 11 | Popup 디렉터리 14 | **37** |
| 알림 | `Swal.fire` 10 + `alert()` 6 | `alert()` **46** + Alert 컴포넌트 | **62** |
| 테이블 | 9개 파일 | 3개 파일 | **12** |
| 아이콘 | PNG 114 + MUI 아이콘 20종 | PNG 38 + MUI 아이콘 2종 | **174** |

**공유 컴포넌트는 0개입니다.**

### 버튼이 어떻게 늘어났는가

D-ROAD의 버튼 CSS 클래스 이름 전체:

```
AddProject_Btn   DataUpload_Btn   DeleteProject_Btn   EditProject_Btn
EditProjectGroup_Btn   Edituserinformation_Btn   MyInfoPassword_Btn
Myinformation_Btn   UserDelete_Btn   Search_btn   Signupbtn
loginbtn   create_btn   approval_btn   refusal_btn   btn   btn_modal
```

같은 버튼을 **모달마다 이름만 바꿔 다시 만들었습니다.**

---

## 4. 수치 분포

### 컨트롤 높이

| 높이 | K-AQUAS | D-ROAD |
|---|---|---|
| 24px | 5 | 9 |
| 30px | **23 (최다)** | — |
| 32px | 6 | — |
| 40px | 12 | **13** |
| 42–45px | 7 | **13** |

K-AQUAS는 30px, D-ROAD는 40–44px이 기본. K-AQUAS가 지도 위에 컨트롤을 얹는 화면이 많아서 생긴 차이.

### 간격 (px 상위)

- K-AQUAS: 5(83) 10(79) 20(68) 30(55) 4(48) 7(48) 40(35) 80(34) 60(34) 50(30)
- D-ROAD: 10(58) 8(42) 16(40) 24(31) 50(28) 4(23) 15(20) 40(17) 80(16)

K-AQUAS는 **5배수와 4배수 그리드가 겹쳐** 돌아가고, D-ROAD는 8배수 기본에 10·15·25가 섞임.

### border-radius

- 4px(89) 5px(53) 6px(38) 10px(27) 8px(16) 50%(17) `0.5vw`(12) `0.3vw`(9)
- 종류: K-AQUAS 26종 · D-ROAD 19종

### font-size

- K-AQUAS 31종: 14px(44) **12.8px(41)** 12px(39) 11px(24) 18px(18) 10px(15) …
- D-ROAD 26종: 16px(24) 24px(12) 14px(9) 13px(8) 18px(5) …
- `12.8px`는 `0.8rem`이 계산된 값

### box-shadow

- 종류: K-AQUAS 21종 · D-ROAD 14종 (D-ROAD는 `none`이 23회로 최다)
- 최다 실값: `0 2px 8px rgba(0,0,0,.1)`

### z-index

- K-AQUAS 14단계: `1000`(36) `19999`(9) `1999`(8) `1009` `1008` `1995` `3000` `4000` `5000` `10001` …
- 코드에 `zIndex: 30000`이 주석과 함께 남아 있음 — MUI 툴팁이 사이드바 뒤로 깔리는
  실사용 문제를 막기 위한 것 (2026-08-04 주석)

---

## 5. 페이지 원형 — 13개 중 11개가 이미 양쪽에 존재

| 원형 | K-AQUAS | D-ROAD |
|---|---|---|
| 로그인 | `LoginPage.js` 302줄 | `LoginPage.jsx` 174줄 |
| 회원가입 | `SignUpPage.js` 248줄 | `SignUpPage.jsx` |
| 계정 찾기 | 없음 | `FindPage.jsx` |
| 내 정보 / 비밀번호 | 없음 | `Myinformation` · `MyInfoPassword` |
| 사용자 관리 | `UserList.js` 400줄 | `AdminPanel` + UserCreate/Delete/Edit |
| 접속 로그 | `UserLog.js` 201줄 | `Logsystem.jsx` 114줄 |
| 시스템 설정 | `System.js` 285줄 | `System.jsx` 343줄 |
| 메인 / 작업공간 | `MainPage.js` 766줄 | `MainPage.jsx` |
| 지도 워크스페이스 | `maps/` 9종, 최대 3,327줄 | `Map.jsx` 1,135줄 |
| 데이터 업로드 | `UploadPopup.js` | `DataUpload.jsx` |
| 처리 진행 | `Loding.js` | `Progress.jsx` |
| 범례 | `covermaplegend.js` | `DamageLegend.jsx` |
| 오류 / 빈 상태 | `Errorpage.js` · `NoDataNotice.js` | 없음 |

서로가 서로의 빈칸을 채웁니다.

---

## 6. 실제 도메인 어휘 — 화면을 채울 때 이 단어를 쓸 것

**K-AQUAS**
- 수질 지표: BOD(50회) · COD(12) · TOC(8) · 탁도(5) · SS(4) · CDOM(3) · 총질소 · 총인 · 클로로필-a
- 소속: 한강유역본부 · 낙동강유역본부 · 금강유역본부 · 영섬유역본부
- 사용자 테이블 컬럼: 이름 · 이메일 · 전화번호 · 회사 · 활성 · 작업
- 접속 로그 컬럼: Index · 이메일 · 사용자명 · IP 주소 · 작업 · 접속일시
- 그 밖: 우선관리지역 · 오염원 · 위성영상 · 드론 · 파노라마 · 지적도

**D-ROAD**
- 탐지 항목: 포트홀 · 균열(크랙) · 패치 · 차선 · 중앙선 · 정지선 · 횡단보도 ·
  지그재그 · 화살표 · 표지판 · 맨홀 · 배수구 · 가로등 · 신호등 · 버스정류장 ·
  과속방지턱 · 타이어 · 안전지대
- 상태값: **승인대기 · 승인완료 · 승인거부** / 성공 · 실패 / 동의 · 미동의
- 사용자 생성 폼 필드: 이메일 · 비밀번호 · 비밀번호 확인 · 이름 · 전화번호 · 메모 · 개인정보 동의

---

## 7. 실측된 컴포넌트 치수

**D-ROAD 로그인 카드** — `448 × 445px`, 배경 `#272934`, radius `10px`,
padding `40px`, gap `16px`, 제목 `32px/800`, 배경 이미지 위 우측(`right: 15vw`)

**D-ROAD 모달 폭** — `448px` **9회** · `602px` 2회 · `1000px` 1회

**D-ROAD 셸** — `Header.jsx` 207줄 + `MenuBar.jsx` 78줄로 분리돼 있음

**K-AQUAS 셸** — 분리돼 있지 않음. 사이드바·탭·툴바가
`YeongjuMeuncontrol.js`(2,822줄) · `DemoMeuncontrol.js`(2,473줄) 안에 지도 로직과 함께 있음

**버튼 패딩 실값**
- K-AQUAS: `10px 15px`(9) · `8px 10px` · `10px 12px` · `4px 8px`
- D-ROAD: `0px 8px`(18) · `12px 12px`(7) · `10px 20px` · `8px 16px`
