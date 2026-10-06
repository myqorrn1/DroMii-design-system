/* 승인된 원본의 작은 시각 예시를 모은다. 토큰·CSS·제품 소스 변경 없음.
 * 전체 상호작용은 각 원본 페이지에서 확인한다. 스크립트와 API는 복제하지 않는다. */
(() => {
  const documents=new Map();
  async function source(path) {
    if(!documents.has(path)) documents.set(path,fetch(path+'?rev=20261006-ready1').then(response=>{
      if(!response.ok) throw new Error('원본 로드 실패');
      return response.text();
    }).then(html=>new DOMParser().parseFromString(html,'text/html')));
    return documents.get(path);
  }
  let serial=0;
  function clone(node) {
    const copy=node.cloneNode(true),prefix='ready-sample-'+(++serial)+'-',ids=new Map();
    for(const el of [copy,...copy.querySelectorAll('[id]')]) if(el.id){ids.set(el.id,prefix+el.id);el.id=prefix+el.id;}
    for(const el of [copy,...copy.querySelectorAll('*')]) {
      for(const attr of ['for','aria-labelledby','aria-describedby','aria-controls']) if(el.hasAttribute(attr)) el.setAttribute(attr,el.getAttribute(attr).split(' ').map(id=>ids.get(id)||id).join(' '));
      if(el.getAttribute('href')?.startsWith('#')&&ids.has(el.getAttribute('href').slice(1))) el.setAttribute('href','#'+ids.get(el.getAttribute('href').slice(1)));
    }
    return copy;
  }
  const spec={
    icons:{path:'foundations/icons.html',blocks:[{selector:'.icon-grid'}]},
    buttons:{path:'components/button.html',blocks:[{title:'종류',selector:'.row'},{title:'크기',selector:'.row'},{title:'상태',selector:'.row'}]},
    inputs:{path:'components/input.html',blocks:[{title:'텍스트 입력',selector:'.states'},{title:'업무 입력 변형',selector:'.states'},{title:'셀렉트',selector:'.states'},{title:'텍스트에어리어',selector:'.states'},{title:'체크박스 · 라디오 · 스위치',selector:'.states'}]},
    badges:{path:'components/badge.html',blocks:[{title:'상태 배지',selector:'.row'},{title:'필터 칩',selector:'.row'}]},
    feedback:{path:'components/feedback.html',blocks:[{selector:'.feedback-stack'},{selector:'.demo.feedback-stack'}]},
    table:{path:'components/table.html',blocks:[{selector:'.doc-section .demo'}]},
    form:{path:'components/form.html',blocks:[{selector:'.doc-section .demo'}]}
  };
  async function load(key,slot) {
    const rule=spec[key],doc=await source(rule.path);
    for(const block of rule.blocks) {
      const group=block.title?[...doc.querySelectorAll('.grp')].find(el=>el.querySelector('.head h2')?.textContent.trim()===block.title):doc;
      const node=group?.querySelector(block.selector);
      if(!node) throw new Error(rule.path+'의 견본 구조를 확인하세요.');
      if(block.title){const label=document.createElement('h3');label.className='ready-subtitle';label.textContent=block.title;slot.append(label);}
      slot.append(clone(node));
    }
  }
  Promise.allSettled([...document.querySelectorAll('[data-source]')].map(async slot=>{
    try {await load(slot.dataset.source,slot);}catch(error){slot.textContent='미리보기를 불러오지 못했습니다. 위 원본 보기 링크를 이용하세요.';throw error;}
  })).then(results=>{document.getElementById('ready-load-status').textContent=results.some(r=>r.status==='rejected')?'일부 원본 미리보기를 확인해 주세요.':'확정된 Core 원본을 불러왔습니다.';});
  const notes={'k-aquas':'K-AQUAS · 밝은 표면 · 파란 버튼과 흰 글자','d-road':'D-ROAD · 어두운 표면 · 보라 버튼','d-find':'D-FIND · 어두운 표면 · 녹색 강조와 기존 흰색 주요 버튼'};
  document.querySelectorAll('[data-ready-brand]').forEach(button=>button.addEventListener('click',()=>{
    const brand=button.dataset.readyBrand;document.body.dataset.brand=brand;document.body.dataset.scheme=brand==='k-aquas'?'light':'dark';
    document.querySelectorAll('[data-ready-brand]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
    document.getElementById('ready-brand-note').textContent=notes[brand];
  }));
  document.addEventListener('submit',event=>{event.preventDefault();document.getElementById('ready-load-status').textContent='폼 표현 확인용입니다. 실제 저장하지 않습니다.';});
  const frame=document.getElementById('ready-overlays');
  frame.addEventListener('load',()=>{
    const root=frame.contentDocument?.querySelector('.overlay-review');if(!root)return;
    const resize=()=>{const height=Math.min(Math.ceil(root.getBoundingClientRect().height)+16,Math.max(240,window.innerHeight-48));if(Math.abs(frame.clientHeight-height)>2)frame.style.height=height+'px';};
    new ResizeObserver(resize).observe(root);window.addEventListener('resize',resize);resize();
  });
})();
