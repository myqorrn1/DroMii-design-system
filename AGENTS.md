# DroMii 디자인 시스템 작업 안내

이 저장소에서 작업하기 전에 `README.md`와 `docs/HANDOFF.md`를 읽는다. 현재 디자인
방향은 `docs/PUBLIC_SECTOR_DIRECTION.md`, 진행 상태는 `docs/STATUS.md`가 기준이다.

기존 디자인 시스템 파일 수정 전 사용자에게 변경 목적·파일·영향·복구 방법을 알린다.
결정과 다음 작업은 `docs/HANDOFF.md`에 남겨 다른 도구에서 이어받을 수 있게 한다.
공용 CSS는 `components/base.css`, 토큰 원본은 `tokens/source.json`을 사용한다.
변경 후 `npm run check`와 브라우저 검증을 수행한다.
