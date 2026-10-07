# DroMii 디자인 시스템 작업 안내

Claude Code에서 이어서 작업할 때 `README.md`와 `docs/HANDOFF.md`를 먼저 읽는다.
현재 디자인 방향은 `docs/PUBLIC_SECTOR_DIRECTION.md`, 진행 상태는 `docs/STATUS.md`가
기준이다. 이 파일에는 별도의 디자인 규칙을 복제하지 않는다.

기존 디자인 시스템 파일 수정 전 사용자에게 변경 목적·파일·영향·복구 방법을 알린다.
완료한 변경과 다음 작업은 `docs/HANDOFF.md`에 갱신하고 `npm run check` 및 브라우저
검증을 수행한다. 로고 분석, 대표 화면 재제작, 제품 코드 적용은 현재 범위 밖이다.

릴리스는 승인된 변경 묶음마다 루트 `package.json`의 버전을 올리고 `CHANGELOG.md`를
갱신한 뒤, 해당 버전의 Git 태그를 붙인다. 제품 저장소는 움직이는 Pages나 커밋 해시
대신 릴리스 태그를 기준으로 가져다 쓴다. React 패키지 버전은 실제 패키지 변경이
있을 때만 별도로 올린다.
