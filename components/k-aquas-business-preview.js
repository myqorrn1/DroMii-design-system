(() => {
  const business=window.DromiiKaquasBusiness;
  const preview=document.getElementById('kb-preview'),live=document.getElementById('kb-live');
  let kind=new URLSearchParams(location.search).get('kind')==='parameters'?'parameters':'upload';
  const contracts={upload:'프로젝트 제목 → 설명 → 미디어 타입 → 우선관리지역 → 촬영 날짜 → 다중 파일 → 프로젝트 시작. 실제 적용 시 FilePond를 유지합니다.',parameters:'프리셋·14개 인자·도움말·인자별 자동과 수동 가중치. 수동 합계가 1을 넘으면 생성을 막습니다.',info:'우선관리지역 순위·BOD/TN/TP·유역 환경, 국유지 속성, 축산계 수치, 탐지 영상의 정보 순서를 유지합니다.',charts:'연도·항목 선택 → 수질 선 차트·값 표, 오염원 도넛·표, A/B 비교, 데이터 범례. 실제 Chart.js와 과학 색 체계를 유지합니다.',processing:'서버 상태·종류별 작업·현재 단계·오류·취소 확인. 서버가 주지 않은 진행률을 만들어 표시하지 않습니다.'};
  function render(target,native=false) {
    const prefix=native?'kb-live':'kb-preview';
    target.innerHTML=`<form><header class="hd dialog-heading"><strong class="tt" id="${prefix}-title">${business.titles[kind]}</strong>${native?'<button type="button" class="icon-btn dialog-close" data-kb-close aria-label="창 닫기"><svg aria-hidden="true"><use href="#ps-icon-close"/></svg></button>':'<span class="bdg bdg--neutral">시안</span>'}</header><div class="bd dialog-stack">${business.content(kind,prefix)}<p class="kb-local-status" role="status"></p></div>${native||['upload','parameters'].includes(kind)?`<footer class="ft">${native?'<button type="button" class="btn btn--md btn--secondary" data-kb-close>닫기</button>':''}${['upload','parameters'].includes(kind)?'<button type="submit" class="btn btn--md btn--primary">'+(kind==='upload'?'프로젝트 시작':'생성')+'</button>':''}</footer>`:''}</form>`;
    target.dataset.kind=kind;business.mount(target);business.weightTotal(target);
  }
  document.querySelectorAll('[data-kb-kind]').forEach(button=>button.addEventListener('click',()=>{kind=button.dataset.kbKind;document.querySelectorAll('[data-kb-kind]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));render(preview);document.getElementById('kb-contract').textContent=contracts[kind];document.getElementById('kb-feedback').textContent='';}));
  document.getElementById('kb-open').addEventListener('click',()=>{render(live,true);live.showModal();business.drawChart(live);});
  live.addEventListener('click',event=>{if(event.target.closest('[data-kb-close]'))live.close();});
  live.addEventListener('close',()=>document.getElementById('kb-open').focus());
  for(const target of [preview,live])target.addEventListener('submit',event=>{event.preventDefault();const result=business.weightTotal(target);const status=target.querySelector('.kb-local-status');if(kind==='parameters'&&!result.selected){status.textContent='분석인자를 하나 이상 선택하세요.';target.querySelector('[data-kb-param]').focus();return;}if(result.over)return;status.textContent='입력·버튼 동작 시연 완료. 실제 전송·저장·분석은 실행하지 않습니다.';});
  window.addEventListener('resize',()=>{business.drawChart(preview);if(live.open)business.drawChart(live);});
  document.querySelectorAll('[data-kb-kind]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.kbKind===kind)));
  render(preview);document.getElementById('kb-contract').textContent=contracts[kind];
})();
