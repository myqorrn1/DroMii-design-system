/* 가상 자료의 시각/키보드 검토. 파일 내용 읽기·네트워크·저장 없음. */
(() => {
  const products=[{brand:'k-aquas',name:'K-AQUAS',scheme:'light',file:'이미지·영상',accept:'image/*,video/*'},
    {brand:'d-road',name:'D-ROAD',scheme:'dark',file:'TIFF 파일',accept:'.tif,.tiff'},
    {brand:'d-find',name:'D-FIND',scheme:'dark',file:'데이터 파일',accept:''}];
  const titles={choice:'이동할 페이지 선택',upload:'데이터 업로드',detail:'자료 상세',settings:'지도 설정',confirm:'자료 삭제 확인'};
  const $=id=>document.getElementById(id);
  const x=$('overlay-icons').content.querySelector('svg').outerHTML;
  let kind='upload',returnFocus;
  const announce=text=>{$('overlay-feedback').textContent=text;};
  const close=()=>`<button type="button" class="icon-btn dialog-close" data-close aria-label="창 닫기">${x}</button>`;
  const button=(text,variant='secondary',attrs='')=>`<button type="button" class="btn btn--md btn--${variant}" ${attrs}>${text}</button>`;
  function markup(product,prefix,live=false) {
    const state=$('overlay-state').value,disabled=state==='disabled'||state==='loading',error=state==='error';
    let content='',footer=button('닫기','secondary','data-close');
    if(kind==='choice') content='<div class="dialog-choice-list"><button type="button" class="dialog-choice" data-choice="데이터 수치 비교"><strong>데이터 수치 비교</strong><span>자료별 수치를 나란히 비교합니다.</span></button><button type="button" class="dialog-choice" data-choice="상세 비교"><strong>상세 비교</strong><span>분류별 상세 결과를 확인합니다.</span></button></div>';
    if(kind==='upload') {
      const field=(label,id,input,help='')=>`<div class="f${error&&id==='file'?' is-error':''}"><label class="lb" for="${prefix}-${id}">${label}${['name','file'].includes(id)?'<span class="req"> *</span>':''}</label>${input}${help}</div>`;
      const lock=disabled?' disabled':'';
      content=field('데이터 이름','name',`<input class="ctl" id="${prefix}-name" placeholder="목록에서 구분할 이름" required${lock}>`)+
        field('설명','description',`<textarea class="ctl ta" id="${prefix}-description" rows="3" placeholder="자료에 대한 설명 (선택)"${lock}></textarea>`)+
        field(product.file,'file',`<input class="file-input" type="file" id="${prefix}-file" accept="${product.accept}" required aria-describedby="${prefix}-file-help"${error?' aria-invalid="true"':''}${lock}>`,
        `<span class="help" id="${prefix}-file-help">${error?'선택한 파일을 처리하지 못했습니다. 형식을 확인하고 다시 선택하세요.':product.brand==='d-road'?'TIFF(.tif, .tiff) 파일을 선택하세요.':product.brand==='k-aquas'?'이미지 또는 영상 파일을 선택하세요.':'업로드할 데이터 파일을 선택하세요.'}</span>`)+
        `<ul class="file-selection" id="${prefix}-file-list" aria-live="polite">${state==='selected'?`<li>검토용 자료.${product.brand==='k-aquas'?'png':product.brand==='d-road'?'tif':'zip'} · 12.4 MB (상태 견본)</li>`:''}</ul>`;
      if(state==='disabled') content+='<div class="banner banner--warning" role="status"><span class="bd"><strong class="tt">업로드 권한이 없습니다</strong><span class="ms">조회는 가능하며 권한은 관리자에게 요청하세요.</span></span></div>';
      if(state==='loading') content+='<div class="banner banner--info" role="status"><span class="bd"><strong class="tt">파일을 처리하고 있습니다</strong><span class="ms">선택한 자료를 처리 중입니다. 완료되면 결과를 안내합니다.</span></span></div>';
      footer=button(disabled?'닫기':'취소','secondary','data-close')+`<button type="${live?'submit':'button'}" class="btn btn--md btn--primary"${disabled?' disabled':''}${state==='loading'?' aria-busy="true"':''}${live?'':' data-preview-action'}>${state==='loading'?'처리 중':'업로드'}</button>`;
    }
    if(kind==='detail') content='<dl class="dialog-properties"><div><dt>자료 이름</dt><dd>검토용 자료 01</dd></div><div><dt>등록 날짜</dt><dd>2026-10-02</dd></div><div><dt>처리 상태</dt><dd><span class="bdg bdg--success">완료</span></dd></div></dl><section class="dialog-section"><h3>설명</h3><p class="dialog-note">기존 자료의 내용과 순서를 유지하고 글자·간격·상태 표현을 공통 스타일로 정리합니다.</p></section>';
    if(kind==='settings') content=['배경 지도','업무 레이어','측정 결과'].map((label,i)=>`<label class="chrow"><input class="ch" type="checkbox"${i<2?' checked':''}><span>${label}</span></label>`).join('')+'<p class="dialog-note">변경 즉시 표시하는 설정은 별도 저장 버튼을 두지 않습니다.</p>';
    if(kind==='confirm') {content='<p><strong>검토용 자료 01</strong>을 삭제하시겠습니까?</p><p class="dialog-note">삭제 후 복구할 수 없습니다. 대상과 영향을 확인하세요.</p>';footer=button('취소','secondary','data-close')+button('삭제','danger','data-preview-action');}
    const titleId=live?'overlay-live-title':`${prefix}-title`;
    const heading=`<strong class="tt" id="${titleId}">${titles[kind]}</strong>${close()}`;
    if(kind==='settings'&&!live) return `<div class="floating-panel" role="group" aria-labelledby="${titleId}"><header>${heading}</header><div class="floating-body">${content}</div></div>`;
    const inside=`<div class="hd dialog-heading">${heading}</div><div class="bd">${content}<p class="dialog-note dialog-status" role="status"></p></div><div class="ft">${footer}</div>`;
    return live?`<form class="overlay-form">${inside}</form>`:`<div class="dialog${kind==='upload'?' dialog--form':''}" role="group" aria-labelledby="${titleId}">${inside}</div>`;
  }
  function render() {
    document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
    $('overlay-state-label').hidden=kind!=='upload';
    $('overlay-grid').innerHTML=products.map(p=>`<section class="overlay-product" data-brand="${p.brand}" data-scheme="${p.scheme}" data-density="default"><header><h2>${p.name}</h2>${button('창 열기','secondary',`data-open="${p.brand}"`)}</header>${markup(p,p.brand)}<p class="overlay-demo-note">공통 구조 · ${p.scheme==='light'?'밝은':'어두운'} 표면 · 검토 중</p></section>`).join('');
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.kind){kind=b.dataset.kind;render();announce('');return;}
    if(b.dataset.open){const p=products.find(p=>p.brand===b.dataset.open),dialog=$('overlay-live');returnFocus=b;
      dialog.dataset.brand=p.brand;dialog.dataset.scheme=p.scheme;dialog.dataset.density='default';dialog.dataset.kind=kind;
      dialog.innerHTML=markup(p,'live',true);dialog.showModal();return;}
    if(b.hasAttribute('data-close')) {if(b.closest('dialog'))$('overlay-live').close();else announce('정적 시안입니다. “창 열기”에서 실제 모달의 닫기 동작을 확인할 수 있습니다.');return;}
    if(b.dataset.choice||b.hasAttribute('data-preview-action')){
      const message=b.dataset.choice?`${b.dataset.choice} 진입 시연입니다. 실제 페이지로 이동하지 않습니다.`:'디자인 동작 시연입니다. 실제 저장·전송·삭제는 실행하지 않습니다.';
      const status=b.closest('.dialog')?.querySelector('.dialog-status');if(status)status.textContent=message;else announce(message);
    }
  });
  $('overlay-state').addEventListener('change',render);
  document.addEventListener('change',e=>{if(e.target.matches('.file-input')){
    const list=e.target.closest('.bd')?.querySelector('.file-selection');if(!list)return;
    list.replaceChildren(...Array.from(e.target.files||[],file=>{const li=document.createElement('li');li.textContent=`${file.name} · ${(file.size/1024/1024).toFixed(1)} MB`;return li;}));
    e.target.removeAttribute('aria-invalid');e.target.parentElement.classList.remove('is-error');const help=e.target.parentElement.querySelector('.help');if(help)help.textContent=e.target.files.length?'파일을 선택했습니다. 시안에서는 내용을 읽거나 전송하지 않습니다.':'파일을 선택하세요. 시안에서는 내용을 읽거나 전송하지 않습니다.';
  }});
  $('overlay-live').addEventListener('submit',e=>{e.preventDefault();$('overlay-live').close();announce('파일 선택·양식 동작 시연 완료. 실제 업로드·저장은 없습니다.');});
  $('overlay-live').addEventListener('close',()=>returnFocus?.isConnected&&returnFocus.focus());
  render();
})();
