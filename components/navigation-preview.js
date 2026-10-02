/* 승인된 플랫폼 배치의 HTML 시연 전용. 제품 라우팅·API·인증 연결 없음. */
(() => {
  const $ = (id) => document.getElementById(id);
  const mapTools = window.DromiiMapToolsPreview;
  const selectedTools = {'d-road':new Set(),'d-find':new Set()};
  const ka = window.DromiiKaquasPreview;
  const railWidth = 72; // One approved navigation rail for every product.
  const configs = {
    'k-aquas': { name: 'K-AQUAS', scheme: 'light', logo: 'k-aquas-horizontal.svg', contextLabel: '분석 유역', context: '검토용 유역', tasks: ka.tasks, initial: 'cover', admin: ['사용자 관리','로그 관리','시스템 관리'] },
    'd-road': { name: 'D-ROAD', scheme: 'dark', logo: 'd-road-horizontal.svg', contextLabel: '조사 프로젝트', context: '검토용 조사 프로젝트', tasks: [['projects','프로젝트','folder']], initial: 'projects', admin: ['사용자 관리','로그 관리'] },
    'd-find': { name: 'D-FIND', scheme: 'dark', logo: 'd-find.png', contextLabel: '현재 프로젝트', context: '검토용 탐지 프로젝트', tasks: [['projects','프로젝트','folder'],['detect','지장물 탐지','search'],['change','변화 탐지','layers'],['measure','측정','measure'],['report','보고서','report']], initial: 'detect', admin: ['회원 관리'] }
  };
  const params = new URLSearchParams(location.search);
  let brand = Object.hasOwn(configs, params.get('brand')) ? params.get('brand') : 'k-aquas';
  let view = params.get('view') === 'manage' ? 'manage' : 'map';
  let task = configs[brand].tasks.some(t=>t[0]===params.get('task')) ? params.get('task') : configs[brand].initial;
  let adminItem = configs[brand].admin.includes(params.get('admin')) ? params.get('admin') : configs[brand].admin[0];
  let panelOpen = true;
  let findMode = '2D';
  const icon = (name) => `<svg aria-hidden="true"><use href="#ps-icon-${name}"/></svg>`;
  const announce = (text) => { $('ps-live').textContent = text; };
  const menuRow = (label, active = false, attrs = '') => `<button type="button" class="ps-nav-row" ${active ? 'aria-current="page"' : ''} ${attrs}>${label}</button>`;
  function closePopovers(focus = false) {
    document.querySelectorAll('.ps-popover[open]').forEach((el) => { el.open = false; if (focus) el.querySelector('summary').focus(); });
  }
  function syncURL() {
    const url = new URL(location.href); url.searchParams.set('brand', brand); url.searchParams.set('view', view);
    url.searchParams.set('task',task); if(view==='manage') url.searchParams.set('admin',adminItem); else url.searchParams.delete('admin');
    history.replaceState(null, '', url);
  }
  const narrowScreen = matchMedia('(max-width: 760px)');
  function syncOverlay() {
    $('ps-main').inert = view === 'map' && panelOpen && !$('ps-panel').hidden && narrowScreen.matches;
  }
  narrowScreen.addEventListener('change', () => {
    syncOverlay();
    if ($('ps-main').inert && $('ps-main').contains(document.activeElement)) $('ps-panel-close').focus();
  });
  function setPanel(open, focus = false) {
    const wasHidden = $('ps-panel').hidden;
    panelOpen = open;
    $('ps-panel').hidden = !open;
    $('ps-panel').classList.toggle('ka-panel-reveal', brand === 'k-aquas' && open && wasHidden);
    $('ps-panel').classList.toggle('ps-panel-reveal', brand !== 'k-aquas' && open && wasHidden);
    $('ps-workspace').dataset.panel = open ? 'open' : 'closed';
    $('ps-panel-open').hidden = open || view !== 'map';
    $('ps-panel-close').setAttribute('aria-expanded', String(open));
    $('ps-panel-open').setAttribute('aria-expanded', String(open));
    syncOverlay();
    if (focus) (open ? $('ps-panel-close') : $('ps-panel-open')).focus();
  }
  const shellAction = (label,action,primary=false) => `<button type="button" class="btn btn--sm btn--${primary?'primary':'secondary'}" data-shell-action="${action}">${label}</button>`;
  const periodFields = () => `<div class="ps-shell-grid"><label><span class="ps-field">시작일</span><input class="ctl" type="date" aria-label="시작일"></label><label><span class="ps-field">종료일</span><input class="ctl" type="date" aria-label="종료일"></label></div>`;
  function panelContent() {
    if (view === 'manage') return `<nav aria-label="${configs[brand].name} 관리 메뉴">${configs[brand].admin.map((label) => menuRow(label, label === adminItem, `data-admin="${label}"`)).join('')}</nav>`;
    if (brand === 'd-road') return `<div class="ps-panel-body"><label class="ps-field" for="ps-project-search">프로젝트 그룹 검색</label><input class="ctl" id="ps-project-search" type="search" placeholder="그룹명 검색"><nav class="ps-tree" aria-label="프로젝트 계층"><details open data-project-group="검토용 조사 그룹"><summary>검토용 조사 그룹</summary><div>${menuRow('검토용 조사 프로젝트', true, 'data-project="검토용 조사 프로젝트"')}${menuRow('검토용 분석 데이터', false, 'data-project="검토용 분석 데이터"')}<div class="ps-shell-actions">${shellAction('데이터 업로드','road-upload')}</div></div></details><details data-project-group="지난 조사 그룹"><summary>지난 조사 그룹</summary><div>${menuRow('검토용 이전 프로젝트', false, 'data-project="검토용 이전 프로젝트"')}<div class="ps-shell-actions">${shellAction('데이터 업로드','road-upload')}</div></div></details></nav><p class="ps-small" id="ps-search-empty" hidden>일치하는 프로젝트 그룹이 없습니다.</p></div><footer class="ps-panel-footer">${shellAction('프로젝트 그룹 생성','road-create',true)}</footer>`;
    if (brand === 'k-aquas') return ka.panel(task);
    if (task === 'projects') return `<section class="ps-shell-section"><label class="ps-field" for="ps-find-search">프로젝트 검색</label><input class="ctl" id="ps-find-search" type="search" placeholder="프로젝트 검색">${periodFields()}</section><section class="ps-shell-section"><h2>프로젝트</h2><div id="ps-find-projects">${['검토용 탐지 프로젝트','검토용 이전 프로젝트'].map((name,i)=>`<button type="button" class="ps-shell-card" data-find-project="${name}"${name===configs['d-find'].context?' aria-current="true"':''}><strong>${name}</strong><small>가상 프로젝트 · 작업 ${i+1}개</small></button>`).join('')}</div><p id="ps-find-empty" class="ps-shell-note" hidden>조건에 맞는 프로젝트가 없습니다.</p>${shellAction('새 프로젝트','find-create',true)}</section>`;
    if (task === 'detect') return `<section class="ps-shell-section"><h2>결과 필터</h2><label class="ps-field" for="ps-find-target">탐지 대상</label><select class="ctl" id="ps-find-target"><option>전체 탐지 대상</option><option>검토 대상 A</option><option>검토 대상 B</option></select>${periodFields()}</section><section class="ps-shell-section"><h2>탐지 결과 <span class="bdg bdg--neutral">2건 · 가상</span></h2>${['검토 대상 A','검토 대상 B'].map((x,i)=>`<button type="button" class="ps-shell-card" data-find-result><strong>${x}</strong><small>검토 자료 0${i+1} · 2025.08.15</small></button>`).join('')}</section>`;
    if (task === 'change') return `<div class="ps-panel-tabs" role="group" aria-label="변화 탐지 화면"><button type="button" aria-pressed="true" data-find-change="results">탐지 결과</button><button type="button" aria-pressed="false" data-find-change="summary">요약</button></div><section class="ps-shell-section"><h2>비교 설정</h2><label class="ps-field" for="ps-find-before">기준 시점</label><select class="ctl" id="ps-find-before"><option>2024년 · 가상 자료</option></select><label class="ps-field" for="ps-find-after">비교 시점</label><select class="ctl" id="ps-find-after"><option>2025년 · 가상 자료</option></select></section><section class="ps-shell-section" id="ps-change-results"><h2>탐지 결과</h2><button type="button" class="ps-shell-card" data-find-result><strong>검토 변화 지역 01</strong><small>검토 자료 · 실제 변화 분석 아님</small></button></section><section class="ps-shell-section" id="ps-change-summary" hidden><h2>변화 요약</h2><p class="ps-shell-note">가상 변화 지역 1건</p></section>`;
    if (task === 'measure') return `<section class="ps-shell-section"><h2>새 측정 시작</h2><div class="ps-shell-choice">${mapTools.button('거리 측정','distance','data-find-measure="distance"',selectedTools['d-find'].has('거리 측정'))}${mapTools.button('면적 측정','area','data-find-measure="area"',selectedTools['d-find'].has('면적 측정'))}</div><p class="ps-shell-note">지도와 같은 측정 도구를 사용합니다.</p></section><section class="ps-shell-section"><h2>측정 결과</h2><p class="ps-shell-note">저장된 측정 결과가 없습니다.</p></section>`;
    return `<section class="ps-shell-section"><h2>보고서 유형</h2><div class="ps-shell-choice"><button type="button" class="btn btn--sm btn--secondary" aria-pressed="true" data-find-report>지장물 탐지</button><button type="button" class="btn btn--sm btn--secondary" aria-pressed="false" data-find-report>변화 탐지</button></div></section><section class="ps-shell-section"><h2>출력 범위</h2><label class="chrow"><input class="ch" type="checkbox" checked><span>검토 자료</span></label><p class="ps-shell-note">가상 보고서 · 실제 분석 이미지 연결 전</p>${shellAction('PDF 저장','find-pdf',true)}</section>`;
  }
  function productMapControls() {
    const group=(name,buttons,extra='')=>`<div class="dm-map-tool-group ${extra}" role="group" aria-label="${name}">${buttons}</div>`;
    const tool=(label,glyph)=>mapTools.button(label,glyph,`data-map-tool="${label}"`,selectedTools[brand].has(label));
    const command=(label,glyph,action,extra='')=>mapTools.button(label,glyph,`data-map-command="${action}" ${extra}`);
    document.querySelector('.ps-map-tools').innerHTML =
      group('지도 레이어',mapTools.button('레이어','layers','data-map-tool="레이어" aria-controls="ps-find-layers" aria-expanded="false"',false)) +
      group('측정과 캡처',tool('거리 측정','distance')+tool('면적 측정','area')+command('측정 지우기','eraser','clear','data-map-separator')+command('화면 캡처','capture','capture')) +
      group('지도 이동과 초기화',command('지도 확대','plus','zoom-in')+command('지도 축소','minus','zoom-out')+command('내 위치로 이동','locate','locate')+command('레이어 초기화','reset','reset')+(brand==='d-find'?'<button type="button" class="dm-map-tool" aria-label="전체화면" data-map-tooltip="전체화면" data-map-command="fullscreen"><span class="ps-tool-text">전체<br>화면</span></button>':''),'ps-map-navigation');
    const mode=brand==='d-find'?`<div class="ps-mode" role="group" aria-label="지도 보기 방식"><button type="button" aria-pressed="${findMode==='2D'}" data-find-mode="2D">2D</button><button type="button" aria-pressed="${findMode==='3D'}" data-find-mode="3D">3D</button></div>`:'';
    const layers=brand==='d-road'?['검토 조사 영상','검토 분석 결과']:['검토 정사영상','검토 탐지 결과'];
    $('ps-find-controls').innerHTML=mode+`<aside id="ps-find-layers" class="ps-find-layers floating-panel" aria-labelledby="ps-find-layers-title" hidden><header><strong id="ps-find-layers-title">레이어</strong><button type="button" class="icon-btn dialog-close" data-find-close-layers aria-label="레이어 닫기">${icon('close')}</button></header><div class="floating-body">${layers.map(label=>`<label class="chrow"><input class="ch" type="checkbox" checked><span>${label}</span></label>`).join('')}<p class="ps-shell-note">가상 레이어 · 실제 지도 연동 전</p></div></aside>`;
    selectedTools[brand].delete('레이어');
  }
  let shellMotionKey;
  function render() {
    mapTools.hideTooltip();
    const c = configs[brand];
    document.body.dataset.brand = brand; document.body.dataset.scheme = c.scheme;
    document.body.style.setProperty('--ps-rail-width', `${railWidth}px`);
    $('ka-home-link').hidden = brand !== 'k-aquas';
    $('ps-product-logo').hidden = brand === 'k-aquas';
    $('ps-product-logo').src = `../assets/logos/${c.logo}`; $('ps-product-logo').alt = c.name;
    $('ps-solution').querySelector('summary').setAttribute('aria-label', brand === 'k-aquas' ? '솔루션 전환, 현재 K-AQUAS' : `현재 솔루션 ${c.name}, 솔루션 전환`);
    document.querySelector('.ps-context').hidden = brand === 'k-aquas' && view === 'map';
    $('ps-context-label').textContent = view === 'map' ? c.contextLabel : '관리 업무';
    $('ps-context-name').textContent = view === 'map' ? c.context : adminItem;
    $('ps-road-result-name').textContent = configs['d-road'].context;
    document.querySelectorAll('[data-brand-choice]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.brandChoice === brand)));
    document.querySelectorAll('button[data-view]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.view === view)));
    $('ps-workspace').dataset.view = view;
    $('ps-rail').hidden = false;
    const workItems = c.tasks.map(([id,label,glyph]) => `<button type="button" class="ps-rail-item" data-task="${id}" aria-label="${label}" ${view==='map'&&task===id?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></button>`).join('');
    $('ps-rail').innerHTML = `<div class="ps-rail-work">${workItems}</div><div class="ps-rail-bottom" role="group" aria-label="관리와 처리"><button type="button" class="ps-rail-item ps-rail-admin" data-open-admin aria-label="관리 업무"${view==='manage'?' aria-current="page"':''}>${icon('settings')}<span>관리</span></button></div>`;
    $('ps-panel').dataset.density = view === 'map' ? 'compact' : 'default';
    $('ps-panel-title').textContent = view === 'manage' ? '운영관리' : brand === 'd-road' ? '프로젝트' : c.tasks.find(([id]) => id === task)?.[1];
    $('ps-panel-content').innerHTML = panelContent();
    const isReport = view === 'map' && brand === 'd-find' && task === 'report';
    $('ps-map').hidden = view !== 'map' || isReport; $('ps-results').hidden = view !== 'map' || brand !== 'd-road';
    $('ps-report-slot').hidden = !isReport; $('ps-management').hidden = view !== 'manage';
    $('ps-manage-title').textContent = adminItem; $('ps-admin-slot-label').textContent = `${c.name} ${adminItem} 영역`;
    $('ps-panel-close').hidden = view === 'manage';
    $('ps-panel-close').querySelector('use').setAttribute('href','#ps-icon-panel');
    $('ps-panel-open').querySelector('use').setAttribute('href','#ps-icon-panel');
    if (view === 'manage') { $('ps-panel').hidden = brand === 'd-find'; $('ps-panel-open').hidden = true; }
    else { setPanel(panelOpen); if (isReport) $('ps-panel-open').hidden = true; }
    // 보고서에서도 접힌 패널을 열 수 있게 같은 제어를 본문 첫 자리에 둔다.
    (isReport ? $('ps-report-slot') : $('ps-map')).prepend($('ps-panel-open'));
    if (isReport) $('ps-panel-open').hidden = panelOpen;
    $('ps-panel-open').classList.toggle('ps-panel-reopen--report', isReport);
    if(brand!=='k-aquas'&&view==='map'&&!isReport) productMapControls();
    $('ps-find-controls').hidden=brand==='k-aquas'||view!=='map'||isReport;
    document.getElementById('ka-preview-tools').hidden = brand !== 'k-aquas';
    document.getElementById('ka-language-controls').hidden = brand !== 'k-aquas';
    document.getElementById('ka-map-content').hidden = brand !== 'k-aquas';
    document.getElementById('ka-admin-content').hidden = brand !== 'k-aquas';
    document.getElementById('ka-admin-placeholder').hidden = brand === 'k-aquas';
    document.querySelector('.ps-map-slot').hidden = brand === 'k-aquas';
    document.querySelector('.ps-map-tools').hidden = brand === 'k-aquas';
    document.getElementById('ps-manage-link').hidden = false;
    document.querySelector('button[data-view="manage"]').disabled = false;
    $('ps-panel-content').classList.remove('ka-panel-content');
    $('ps-panel-content').classList.toggle('ps-road-panel',brand==='d-road'&&view==='map');
    $('ps-panel-title').parentElement.querySelector('.ps-eyebrow').hidden=false;
    document.getElementById('ka-panel-context')?.remove();
    if (brand === 'k-aquas') ka.render({task,view});
    else document.getElementById('ka-drawer').hidden=true;
    if(brand!=='k-aquas') {
      const key=[brand,view,task,adminItem].join('|'),content=$('ps-panel-content');content.classList.remove('ps-content-enter');
      if(key!==shellMotionKey) {void content.offsetWidth;content.classList.add('ps-content-enter');}shellMotionKey=key;
    } else {$('ps-panel-content').classList.remove('ps-content-enter');shellMotionKey=undefined;}
    syncOverlay();
    syncURL();
  }
  let shellReturn;
  function openShellDialog(action) {
    if(action==='find-pdf') {announce('PDF 저장 진입 시연입니다. 실제 파일은 생성하지 않습니다.');return;}
    closePopovers();
    shellReturn=document.activeElement;
    const title=action==='road-upload'?'데이터 업로드':action==='road-create'?'프로젝트 그룹 생성':'새 프로젝트';
    const field=(label,id,html)=>`<div class="f"><label class="lb" for="${id}">${label}${/\brequired(?:\s|>)/.test(html)?'<span class="req" aria-hidden="true">*</span>':''}</label>${html}</div>`;
    let content=field(action==='road-upload'?'데이터 이름':'프로젝트명','ps-shell-name','<input class="ctl" id="ps-shell-name" required>');
    if(action==='road-upload') content+=field('설명','ps-shell-description','<textarea class="ctl ta" id="ps-shell-description" rows="3"></textarea>')+field('TIFF 파일','ps-shell-file','<input class="file-input" id="ps-shell-file" type="file" accept=".tif,.tiff" aria-describedby="ps-file-help" required><span class="help" id="ps-file-help">TIFF 파일(.tif, .tiff)을 선택하세요.</span>');
    $('ps-shell-dialog').innerHTML=`<form><div class="hd dialog-heading"><strong class="tt" id="ps-shell-dialog-title">${title}</strong><button type="button" class="icon-btn dialog-close" data-shell-close aria-label="창 닫기">${icon('close')}</button></div><div class="bd dialog-stack">${content}<p class="dialog-note">가상 양식입니다. 저장·업로드·분석을 실행하지 않습니다.</p></div><div class="ft"><button type="button" class="btn btn--md btn--secondary" data-shell-close>취소</button><button type="submit" class="btn btn--md btn--primary">${action==='road-upload'?'업로드':'생성'}</button></div></form>`;
    $('ps-shell-dialog').showModal();$('ps-shell-name').focus();
  }
  function selectMeasurement(tool) {
    const selected=!selectedTools[brand].has(tool);
    selectedTools[brand].delete('거리 측정');selectedTools[brand].delete('면적 측정');if(selected) selectedTools[brand].add(tool);
    document.querySelectorAll('[data-map-tool="거리 측정"],[data-map-tool="면적 측정"],[data-find-measure]').forEach(el=>{
      const name=el.dataset.findMeasure?(el.dataset.findMeasure==='distance'?'거리 측정':'면적 측정'):el.dataset.mapTool;
      el.setAttribute('aria-pressed',String(selectedTools[brand].has(name)));
    });announce(`${tool} ${selected?'선택':'해제'}. 실제 지도 측정은 연결하지 않았습니다.`);
  }
  function closeMapLayers(focus=false) {
    const layers=$('ps-find-layers');if(!layers||layers.hidden)return;
    layers.hidden=true;selectedTools[brand].delete('레이어');const button=document.querySelector('[data-map-tool="레이어"]');button?.setAttribute('aria-pressed','false');button?.setAttribute('aria-expanded','false');if(focus)button?.focus();
  }
  function changeView(next) { view = next; panelOpen = true; closePopovers(); render(); ($('ps-main').inert ? $('ps-panel-close') : $('ps-main')).focus(); announce(`${configs[brand].name} ${view === 'map' ? '지도' : '관리'} 업무`); }
  document.addEventListener('click', (event) => {
    const b = event.target.closest('button');
    if (brand === 'k-aquas' && b && ka.click(b)) return;
    if(b?.dataset.shellAction) {openShellDialog(b.dataset.shellAction);return;}
    if(b?.hasAttribute('data-shell-close')) {$('ps-shell-dialog').close();return;}
    if(b?.hasAttribute('data-find-close-layers')) {closeMapLayers(true);return;}
    if(b?.dataset.findMeasure) {selectMeasurement(b.dataset.findMeasure==='distance'?'거리 측정':'면적 측정');return;}
    if(b?.dataset.mapCommand) {
      if(['clear','reset'].includes(b.dataset.mapCommand)) {
        selectedTools[brand].delete('거리 측정');selectedTools[brand].delete('면적 측정');
        document.querySelectorAll('[data-map-tool="거리 측정"],[data-map-tool="면적 측정"],[data-find-measure]').forEach(el=>el.setAttribute('aria-pressed','false'));
        if(b.dataset.mapCommand==='reset') closeMapLayers();
      }
      announce(`${b.getAttribute('aria-label')} 진입 시연입니다. 실제 지도·캡처·위치 권한·전체화면은 연결하지 않았습니다.`);return;
    }
    if(b?.dataset.findMode) {findMode=b.dataset.findMode;b.parentElement.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));announce(`${b.dataset.findMode} 지도 선택. 실제 지도 엔진 연결 전입니다.`);return;}
    if(b?.dataset.findChange) {b.parentElement.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$('ps-change-results').hidden=b.dataset.findChange!=='results';$('ps-change-summary').hidden=b.dataset.findChange!=='summary';return;}
    if(b?.hasAttribute('data-find-report')) {b.parentElement.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));announce('보고서 유형 선택. 실제 문서는 연결하지 않았습니다.');return;}
    if(b?.hasAttribute('data-find-result')) {document.querySelectorAll('[data-find-result]').forEach(el=>el.removeAttribute('aria-current'));b.setAttribute('aria-current','true');announce('가상 결과 선택. 실제 분석 위치는 연결하지 않았습니다.');return;}
    if(b?.dataset.findProject) {document.querySelectorAll('[data-find-project]').forEach(el=>el.removeAttribute('aria-current'));b.setAttribute('aria-current','true');configs[brand].context=b.dataset.findProject;$('ps-context-name').textContent=b.dataset.findProject;announce('가상 프로젝트 선택.');return;}
    if (b?.dataset.brandChoice) { brand = b.dataset.brandChoice; task = configs[brand].initial; adminItem = configs[brand].admin[0]; panelOpen = true; closePopovers(); render(); $('ps-solution').querySelector('summary').focus(); announce(`${configs[brand].name}으로 전환했습니다. 가상 화면입니다.`); }
    else if (b?.dataset.view) changeView(b.dataset.view);
    else if (b?.hasAttribute('data-open-admin') || b?.id === 'ps-manage-link') changeView('manage');
    else if (b?.id === 'ps-return-work') changeView('map');
    else if (b?.id === 'ps-panel-close') { setPanel(false, true); announce('작업 패널을 접었습니다.'); }
    else if (b?.id === 'ps-panel-open') setPanel(true, true);
    else if (b?.dataset.task || b?.id === 'ps-return-map') { task = b.dataset.task || 'detect'; view='map'; panelOpen = true; render(); const target = document.querySelector(`.ps-rail-item[data-task="${task}"]`); target?.focus(); announce(`${$('ps-panel-title').textContent} 작업으로 전환했습니다.`); }
    else if (b?.dataset.admin) { if(brand==='k-aquas') ka.state.search=''; adminItem = b.dataset.admin; render(); document.querySelector(`[data-admin="${adminItem}"]`)?.focus(); }
    else if (b?.dataset.source) { b.parentElement.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === b))); announce(`${b.dataset.source} 자료 선택. 실제 자료는 연결하지 않았습니다.`); }
    else if (b?.hasAttribute('data-record') || b?.dataset.project) { b.closest('nav').querySelectorAll('.ps-nav-row').forEach(el => el.removeAttribute('aria-current')); b.setAttribute('aria-current','page'); if (b.dataset.project) { configs[brand].context = b.dataset.project; $('ps-context-name').textContent = b.dataset.project; $('ps-road-result-name').textContent=b.dataset.project; } announce('검토용 항목을 선택했습니다. 실제 데이터 변경은 없습니다.'); }
    else if (brand!=='k-aquas'&&['거리 측정','면적 측정'].includes(b?.dataset.mapTool)) selectMeasurement(b.dataset.mapTool);
    else if (b?.dataset.mapTool) { const selected = b.getAttribute('aria-pressed') !== 'true'; selected ? selectedTools[brand].add(b.dataset.mapTool) : selectedTools[brand].delete(b.dataset.mapTool); b.setAttribute('aria-pressed', String(selected)); if(brand!=='k-aquas'&&b.dataset.mapTool==='레이어') {$('ps-find-layers').hidden=!selected;b.setAttribute('aria-expanded',String(selected));$('ps-find-layers').classList.toggle('ps-content-enter',selected);} announce(`${b.dataset.mapTool} ${selected ? '선택' : '해제'}. 실제 지도 기능은 연결하지 않았습니다.`); }
    else if (b?.id === 'ps-logout') { closePopovers(); $('ps-account').querySelector('summary').focus(); announce('로그아웃 배치 확인용입니다. 실제 계정은 변경되지 않습니다.'); }
    document.querySelectorAll('.ps-popover[open]').forEach(el => { if (!el.contains(event.target)) el.open = false; });
  });
  document.addEventListener('input', (event) => {
    if (brand === 'k-aquas' && ka.input(event.target)) return;
    if(event.target.id==='ps-find-search') {const query=event.target.value.trim().toLocaleLowerCase();const items=[...document.querySelectorAll('[data-find-project]')];items.forEach(el=>el.hidden=!el.textContent.toLocaleLowerCase().includes(query));$('ps-find-empty').hidden=items.some(el=>!el.hidden);return;}
    if (event.target.id !== 'ps-project-search') return;
    const query = event.target.value.trim().toLocaleLowerCase();
    const groups = [...document.querySelectorAll('[data-project-group]')];
    groups.forEach(el => { el.hidden = !el.dataset.projectGroup.toLocaleLowerCase().includes(query); });
    $('ps-search-empty').hidden = groups.some(el => !el.hidden);
  });
  document.addEventListener('change', event => { if (brand === 'k-aquas') ka.change(event.target); });
  document.querySelectorAll('.ps-popover').forEach(el => el.addEventListener('toggle', () => {
    if (el.open) document.querySelectorAll('.ps-popover').forEach(other => { if (other !== el) other.open = false; });
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (document.querySelector('.ps-popover[open]')) { closePopovers(true); event.preventDefault(); }
    else if(brand!=='k-aquas'&&$('ps-find-layers')&&!$('ps-find-layers').hidden) {closeMapLayers(true);event.preventDefault();}
    else if (view === 'map' && panelOpen && matchMedia('(max-width: 760px)').matches && $('ps-panel').contains(document.activeElement)) { setPanel(false, true); event.preventDefault(); }
  });
  document.querySelector('.app-skip').addEventListener('click', () => {
    if (view === 'map' && narrowScreen.matches && panelOpen) setPanel(false);
  });
  $('ps-shell-dialog').addEventListener('close',()=>{if(shellReturn?.isConnected)shellReturn.focus();});
  $('ps-shell-dialog').addEventListener('submit',event=>{event.preventDefault();$('ps-shell-dialog').close();announce('양식 동작 시연 완료. 실제 저장·업로드는 없습니다.');});
  document.addEventListener('click',event=>{if(brand!=='k-aquas'&&!event.target.closest('#ps-find-layers,[data-map-tool="레이어"]'))closeMapLayers();});
  mapTools.init();
  ka.init({revealMain:()=>{if($('ps-main').inert)setPanel(false);},refresh:render, currentTask:()=>task, admin:()=>adminItem, announce, task:(next)=>{task=next;view='map';panelOpen=true;render();document.querySelector(`.ps-rail-item[data-task="${task}"]`)?.focus();}});
  document.addEventListener('click', event => {
    if (brand !== 'k-aquas') return;
    const summary = event.target.closest('.ka-study-record>summary');
    if (summary) summary.parentElement.querySelector('.ka-record-body')?.classList.toggle('ka-content-enter', !summary.parentElement.open);
  });
  render();
})();
