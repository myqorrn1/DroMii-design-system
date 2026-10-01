/* 승인된 플랫폼 배치의 HTML 시연 전용. 제품 라우팅·API·인증 연결 없음. */
(() => {
  const $ = (id) => document.getElementById(id);
  const ka = window.DromiiKaquasPreview;
  const configs = {
    'k-aquas': { name: 'K-AQUAS', scheme: 'light', logo: 'k-aquas-horizontal.svg', panel: 280, rail: 72, contextLabel: '분석 유역', context: '검토용 유역', tasks: ka.tasks, initial: 'cover', admin: ['사용자 관리','로그 관리','시스템 관리'] },
    'd-road': { name: 'D-ROAD', scheme: 'dark', logo: 'd-road-horizontal.svg', panel: 320, rail: 0, contextLabel: '조사 프로젝트', context: '검토용 조사 프로젝트', tasks: [], initial: 'projects', admin: ['사용자 관리','로그 관리'] },
    'd-find': { name: 'D-FIND', scheme: 'dark', logo: 'd-find.png', panel: 360, rail: 80, contextLabel: '현재 프로젝트', context: '검토용 탐지 프로젝트', tasks: [['projects','프로젝트','folder'],['detect','객체 탐지','search'],['change','변화 탐지','layers'],['measure','측정','measure'],['report','보고서','report']], initial: 'detect', admin: ['회원 관리'] }
  };
  const params = new URLSearchParams(location.search);
  let brand = Object.hasOwn(configs, params.get('brand')) ? params.get('brand') : 'k-aquas';
  let view = params.get('view') === 'manage' ? 'manage' : 'map';
  let task = brand==='k-aquas' && ka.tasks.some(t=>t[0]===params.get('task')) ? params.get('task') : configs[brand].initial;
  let adminItem = configs[brand].admin.includes(params.get('admin')) ? params.get('admin') : configs[brand].admin[0];
  let panelOpen = true;
  const icon = (name) => `<svg aria-hidden="true"><use href="#ps-icon-${name}"/></svg>`;
  const announce = (text) => { $('ps-live').textContent = text; };
  const menuRow = (label, active = false, attrs = '') => `<button type="button" class="ps-nav-row" ${active ? 'aria-current="page"' : ''} ${attrs}>${label}</button>`;
  function closePopovers(focus = false) {
    document.querySelectorAll('.ps-popover[open]').forEach((el) => { el.open = false; if (focus) el.querySelector('summary').focus(); });
  }
  function syncURL() {
    const url = new URL(location.href); url.searchParams.set('brand', brand); url.searchParams.set('view', view);
    if(brand==='k-aquas') {url.searchParams.set('task',task); if(view==='manage') url.searchParams.set('admin',adminItem); else url.searchParams.delete('admin');} else {url.searchParams.delete('task');url.searchParams.delete('admin');}
    history.replaceState(null, '', url);
  }
  const narrowScreen = matchMedia('(max-width: 760px)');
  function syncOverlay() {
    $('ps-main').inert = view === 'map' && panelOpen && narrowScreen.matches;
  }
  narrowScreen.addEventListener('change', () => {
    syncOverlay();
    if ($('ps-main').inert && $('ps-main').contains(document.activeElement)) $('ps-panel-close').focus();
  });
  function setPanel(open, focus = false) {
    panelOpen = open;
    $('ps-panel').hidden = !open;
    $('ps-workspace').dataset.panel = open ? 'open' : 'closed';
    $('ps-panel-open').hidden = open || view !== 'map';
    $('ps-panel-close').setAttribute('aria-expanded', String(open));
    $('ps-panel-open').setAttribute('aria-expanded', String(open));
    syncOverlay();
    if (focus) (open ? $('ps-panel-close') : $('ps-panel-open')).focus();
  }
  function panelContent() {
    if (view === 'manage') return `<nav aria-label="${configs[brand].name} 관리 메뉴">${configs[brand].admin.map((label) => menuRow(label, label === adminItem, `data-admin="${label}"`)).join('')}</nav>`;
    if (brand === 'd-road') return `<div class="ps-panel-tabs" role="group" aria-label="업무 종류"><button type="button" aria-pressed="true" data-road-tab="projects">프로젝트</button><button type="button" aria-pressed="false" data-road-tab="manage">운영관리</button></div><label class="ps-field" for="ps-project-search">프로젝트 그룹 검색</label><input class="ctl" id="ps-project-search" type="search" placeholder="그룹명 검색"><nav class="ps-tree" aria-label="프로젝트 계층"><details open data-project-group="검토용 조사 그룹"><summary>검토용 조사 그룹</summary><div>${menuRow('검토용 조사 프로젝트', true, 'data-project="검토용 조사 프로젝트"')}${menuRow('검토용 분석 데이터', false, 'data-project="검토용 분석 데이터"')}</div></details><details data-project-group="지난 조사 그룹"><summary>지난 조사 그룹</summary><div>${menuRow('검토용 이전 프로젝트', false, 'data-project="검토용 이전 프로젝트"')}</div></details></nav><p class="ps-small" id="ps-search-empty" hidden>일치하는 프로젝트 그룹이 없습니다.</p><p class="ps-panel-note">업로드·분석과 결과 목록은 제품에서 연결합니다.</p>`;
    if (brand === 'k-aquas') return ka.panel(task);
    if (task === 'report') return `<p class="ps-field">프로젝트 보고서</p><nav aria-label="보고서 선택">${menuRow('검토용 탐지 보고서', true, 'data-record')}</nav><p class="ps-panel-note">작업 레일은 유지하고 지도 자리가 문서 미리보기로 바뀝니다.</p>`;
    if (task === 'projects') return `<label class="ps-field" for="ps-find-search">프로젝트 검색</label><input class="ctl" id="ps-find-search" type="search" placeholder="검토용 프로젝트 검색"><nav aria-label="프로젝트 선택">${menuRow('검토용 탐지 프로젝트', true, 'data-record')}</nav>`;
    return `<p class="ps-field">${configs[brand].tasks.find(([id]) => id === task)?.[1]} 작업</p><div class="ps-empty-panel"><strong>제품 작업 패널</strong><p>선택한 기능의 설정·목록·결과를 연결합니다.</p></div><p class="ps-panel-note">탐지·변화·측정의 도메인 제어는 제품별로 유지합니다.</p>`;
  }
  function render() {
    const c = configs[brand];
    document.body.dataset.brand = brand; document.body.dataset.scheme = c.scheme;
    document.body.style.setProperty('--ps-panel-width', `${c.panel}px`);
    document.body.style.setProperty('--ps-rail-width', `${c.rail}px`);
    $('ps-product-logo').src = `../assets/logos/${c.logo}`; $('ps-product-logo').alt = c.name;
    $('ps-solution').querySelector('summary').setAttribute('aria-label', `현재 솔루션 ${c.name}, 솔루션 전환`);
    $('ps-context-label').textContent = view === 'map' ? c.contextLabel : '관리 업무';
    $('ps-context-name').textContent = view === 'map' ? c.context : adminItem;
    document.querySelectorAll('[data-brand-choice]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.brandChoice === brand)));
    document.querySelectorAll('button[data-view]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.view === view)));
    $('ps-workspace').dataset.view = view;
    $('ps-rail').hidden = view !== 'map' || !c.rail;
    $('ps-rail').innerHTML = c.tasks.map(([id,label,glyph]) => `<button type="button" class="ps-rail-item" data-task="${id}" aria-label="${label}" ${task === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span></button>`).join('') + `<button type="button" class="ps-rail-item ps-rail-admin" data-open-admin aria-label="관리 업무">${icon('user')}<span>관리</span></button>`;
    $('ps-panel').dataset.density = view === 'map' ? 'compact' : 'default';
    $('ps-panel-title').textContent = view === 'manage' ? '운영관리' : brand === 'd-road' ? '프로젝트' : c.tasks.find(([id]) => id === task)?.[1];
    $('ps-panel-content').innerHTML = panelContent();
    const isReport = view === 'map' && brand === 'd-find' && task === 'report';
    $('ps-map').hidden = view !== 'map' || isReport; $('ps-results').hidden = view !== 'map' || brand !== 'd-road';
    $('ps-report-slot').hidden = !isReport; $('ps-management').hidden = view !== 'manage';
    $('ps-manage-title').textContent = adminItem; $('ps-admin-slot-label').textContent = `${c.name} ${adminItem} 영역`;
    $('ps-panel-close').hidden = view === 'manage';
    if (view === 'manage') { $('ps-panel').hidden = brand === 'd-find'; $('ps-panel-open').hidden = true; }
    else { setPanel(panelOpen); if (isReport) $('ps-panel-open').hidden = true; }
    // 보고서에서도 접힌 패널을 열 수 있게 같은 제어를 본문 첫 자리에 둔다.
    (isReport ? $('ps-report-slot') : $('ps-map')).prepend($('ps-panel-open'));
    if (isReport) $('ps-panel-open').hidden = panelOpen;
    $('ps-panel-open').classList.toggle('ps-panel-reopen--report', isReport);
    document.querySelector('[data-map-tool="레이어"]').hidden = brand === 'd-road';
    document.getElementById('ka-preview-tools').hidden = brand !== 'k-aquas';
    document.getElementById('ka-language-controls').hidden = brand !== 'k-aquas';
    document.getElementById('ka-map-content').hidden = brand !== 'k-aquas';
    document.getElementById('ka-admin-content').hidden = brand !== 'k-aquas';
    document.getElementById('ka-admin-placeholder').hidden = brand === 'k-aquas';
    document.querySelector('.ps-map-slot').hidden = brand === 'k-aquas';
    document.querySelector('.ps-map-tools').hidden = brand === 'k-aquas';
    document.getElementById('ps-manage-link').hidden = false;
    document.querySelector('button[data-view="manage"]').disabled = false;
    if (brand === 'k-aquas') ka.render({task,view});
    syncOverlay();
    syncURL();
  }
  function changeView(next) { view = next; panelOpen = true; closePopovers(); render(); ($('ps-main').inert ? $('ps-panel-close') : $('ps-main')).focus(); announce(`${configs[brand].name} ${view === 'map' ? '지도' : '관리'} 업무`); }
  document.addEventListener('click', (event) => {
    const b = event.target.closest('button');
    if (brand === 'k-aquas' && b && ka.click(b)) return;
    if (b?.dataset.brandChoice) { brand = b.dataset.brandChoice; task = configs[brand].initial; adminItem = configs[brand].admin[0]; panelOpen = true; closePopovers(); render(); $('ps-solution').querySelector('summary').focus(); announce(`${configs[brand].name}으로 전환했습니다. 가상 화면입니다.`); }
    else if (b?.dataset.view) changeView(b.dataset.view);
    else if (b?.hasAttribute('data-open-admin') || b?.id === 'ps-manage-link') changeView('manage');
    else if (b?.id === 'ps-return-work') changeView('map');
    else if (b?.id === 'ps-panel-close') { setPanel(false, true); announce('작업 패널을 접었습니다.'); }
    else if (b?.id === 'ps-panel-open') setPanel(true, true);
    else if (b?.dataset.task || b?.id === 'ps-return-map') { task = b.dataset.task || 'detect'; panelOpen = true; render(); const target = document.querySelector(`[data-task="${task}"]`); target?.focus(); announce(`${$('ps-panel-title').textContent} 작업으로 전환했습니다.`); }
    else if (b?.dataset.admin) { if(brand==='k-aquas') ka.state.search=''; adminItem = b.dataset.admin; render(); document.querySelector(`[data-admin="${adminItem}"]`)?.focus(); }
    else if (b?.dataset.roadTab === 'manage') changeView('manage');
    else if (b?.dataset.source) { b.parentElement.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === b))); announce(`${b.dataset.source} 자료 선택. 실제 자료는 연결하지 않았습니다.`); }
    else if (b?.hasAttribute('data-record') || b?.dataset.project) { b.closest('nav').querySelectorAll('.ps-nav-row').forEach(el => el.removeAttribute('aria-current')); b.setAttribute('aria-current','page'); if (b.dataset.project) { configs[brand].context = b.dataset.project; $('ps-context-name').textContent = b.dataset.project; } announce('검토용 항목을 선택했습니다. 실제 데이터 변경은 없습니다.'); }
    else if (b?.dataset.mapTool) { const selected = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(selected)); announce(`${b.dataset.mapTool} ${selected ? '선택' : '해제'}. 실제 지도 기능은 연결하지 않았습니다.`); }
    else if (b?.id === 'ps-logout') { closePopovers(); $('ps-account').querySelector('summary').focus(); announce('로그아웃 배치 확인용입니다. 실제 계정은 변경되지 않습니다.'); }
    document.querySelectorAll('.ps-popover[open]').forEach(el => { if (!el.contains(event.target)) el.open = false; });
  });
  document.addEventListener('input', (event) => {
    if (brand === 'k-aquas' && ka.input(event.target)) return;
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
    else if (view === 'map' && panelOpen && matchMedia('(max-width: 760px)').matches && $('ps-panel').contains(document.activeElement)) { setPanel(false, true); event.preventDefault(); }
  });
  document.querySelector('.app-skip').addEventListener('click', () => {
    if (view === 'map' && narrowScreen.matches && panelOpen) setPanel(false);
  });
  ka.init({refresh:render, currentTask:()=>task, admin:()=>adminItem, announce, task:(next)=>{task=next;view='map';panelOpen=true;render();($('ps-main').inert?$('ps-panel-close'):$('ps-main')).focus();}});
  render();
})();
