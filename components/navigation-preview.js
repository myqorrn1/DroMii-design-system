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
    'd-find': { name: 'D-FIND', scheme: 'dark', logo: 'd-find.png', contextLabel: '현재 프로젝트', context: '검토용 탐지 프로젝트', tasks: [['projects','프로젝트','folder'],['detect','지장물 탐지','search'],['change','변화 탐지','layers'],['measure','측정','measure'],['report','보고서','report']], initial: 'projects', admin: ['회원 관리'] }
  };
  const params = new URLSearchParams(location.search);
  let brand = Object.hasOwn(configs, params.get('brand')) ? params.get('brand') : 'k-aquas';
  let view = params.get('view') === 'manage' ? 'manage' : 'map';
  let task = configs[brand].tasks.some(t=>t[0]===params.get('task')) ? params.get('task') : configs[brand].initial;
  let adminItem = configs[brand].admin.includes(params.get('admin')) ? params.get('admin') : configs[brand].admin[0];
  let panelOpen = true;
  let findMode = '2D';
  // D-FIND 시험안: 프로젝트를 고르기 전에는 레일에 프로젝트만 두고, 고르면 업무 항목을 보인다.
  let findProjectSelected = brand === 'd-find' && (params.get('project') === 'selected' || task !== 'projects');
  let revealFindTasks = false;
  // D-FIND 프로젝트 화면: 카드를 누르면 작업 미리보기를 펼치고, 지도에서 열기로 프로젝트를 연다.
  let findPreview = null;
  let findTask = 0;
  let findReport = 'summary';
  let findScope = 'all';
  // D-FIND 지도 레이어(로컬 D-FIND와 같은 구성): 배경 지도 선택 · 레이어 창. 빠른 켜기는 쓰지 않는다.
  let findBasemap = '일반 지도';
  let findCompare = false;
  let findLayerDetail = null;
  let findLayerOrder = false;
  const findLayersOn = new Set(['ortho']);
  const findLayerSections = [
    ['data','현장 데이터',[['ortho','정사사진',1],['grid','격자',4],['cover','토지피복도',2],['parcel','지적도',5]]],
    ['result','분석 결과',[['detect','지장물 탐지 결과',3],['change','변화 탐지 결과',6]]],
    ['work','측정',[['distance','거리 측정',4],['area','영역 측정',5]]],
  ];
  // 배경 지도는 다른 지도 도구와 같은 44px 정사각형 아이콘 버튼, 이름은 툴팁으로 보인다.
  // D-FIND 회원 관리(로컬 D-FIND와 같은 구성): 요약 카드 → 상태·검색 → 공통 표(좁은 화면은 카드).
  // [이름, 이메일, 소속, 권한, 상태, 가입일, 본인 여부] — 가상 자료.
  const findMembers = [
    ['검토 관리자','admin@example.invalid','검토 기관','관리자','active','2026-09-01',true],
    ['검토 분석 담당자','analyst@example.invalid','검토 기관','편집자','active','2026-09-05',false],
    ['검토 조회 담당자','viewer@example.invalid','검토 기관','조회자','disabled','2026-09-12',false],
    ['검토 가입 대기자','pending@example.invalid','검토 기관','조회자','pending',null,false],
  ];
  const memberStatus = {all:'전체',active:'활성',pending:'승인 대기',disabled:'비활성'};
  const memberTone = {active:'success',pending:'warning',disabled:'neutral'};
  let findMemberFilter = 'all', findMemberQuery = '';
  // 운영 D-FIND 회원 관리 구성(로컬과 같음): 회원 현황 띠 → 표 상자(상태 탭·검색 / 머리 / 행). 값은 Core 규칙을 따른다.
  const memberIcon = {active:'shield-check',pending:'user-check',disabled:'ban'};
  function findMemberList() {
    const q=findMemberQuery.trim().toLocaleLowerCase();
    const rows=findMembers.filter(m=>(findMemberFilter==='all'||m[4]===findMemberFilter)&&(!q||m.slice(0,3).join(' ').toLocaleLowerCase().includes(q)));
    if(!rows.length) return `<div class="ps-member-empty">${icon('users')}<p>조건에 맞는 회원 없음</p></div>`;
    return rows.map(m=>{
      const i=findMembers.indexOf(m),self=m[6],pending=m[4]==='pending',off=m[4]==='disabled';
      const roleLock=self?' disabled title="본인 권한은 변경할 수 없습니다."':pending?' disabled title="승인 대기 계정은 승인 후 권한을 변경할 수 있습니다."':off?' disabled title="비활성 계정은 권한을 변경할 수 없습니다."':'';
      const action=pending?`<button type="button" class="btn btn--sm btn--primary" data-find-member-approve="${i}">${icon('user-check')}승인</button>`
        :`<button type="button" class="btn btn--sm btn--ghost ps-member-toggle" data-find-member-toggle="${i}"${self?' disabled title="본인 계정은 비활성화할 수 없습니다."':''}>${icon(off?'circle-check':'ban')}${off?'활성화':'비활성화'}</button>`;
      return `<div class="ps-member-row"><div class="ps-member-id"><span class="ps-member-avatar" aria-hidden="true">${m[0].replace('검토 ','').slice(0,2)}</span><span><strong>${m[0]}</strong><small>${m[1]} · ${m[2]}</small></span></div><span class="ps-member-status ps-member-status--${m[4]}">${icon(memberIcon[m[4]])}${memberStatus[m[4]]}</span><span class="ps-member-joined"><b>가입일</b>${m[5]??'승인 전'}</span><div class="ps-member-perm"><span class="ps-member-perm-chip">${m[3]}</span><button type="button" class="btn btn--sm btn--ghost" data-find-member-role="${i}"${roleLock}>권한 변경</button></div><div class="ps-member-actions">${action}</div></div>`;
    }).join('');
  }
  function findMemberAdmin() {
    const count=(s)=>findMembers.filter(m=>s==='all'||m[4]===s).length;
    const stat=([label,s,tone])=>`<div><p><i class="ps-member-dot ps-member-dot--${tone}"></i>${label}</p><strong>${count(s)}</strong></div>`;
    const tab=([s,label])=>`<button type="button" class="ps-member-tab" data-find-member-filter="${s}" aria-pressed="${findMemberFilter===s}">${label}<span>${count(s)}</span></button>`;
    return `<section class="ps-member-summary"><h2>회원 현황</h2><div class="ps-member-stats">${[['전체','all','neutral'],['활성','active','primary'],['승인대기','pending','warning'],['비활성','disabled','neutral']].map(stat).join('')}</div></section><section class="ps-member-card" aria-label="회원 목록"><div class="ps-member-toolbar"><div class="ps-member-tabs" role="group" aria-label="회원 상태">${Object.entries(memberStatus).map(tab).join('')}</div><div class="ctl ps-find-search ps-member-search">${icon('search')}<input type="search" id="ps-member-search" value="${findMemberQuery}" placeholder="이름, 이메일, 소속 검색" aria-label="회원 검색"></div></div><div class="ps-member-head" aria-hidden="true"><span>회원</span><span>상태</span><span>가입일</span><span>권한</span><span>계정 관리</span></div><div id="ps-member-list">${findMemberList()}</div></section><p class="ps-shell-note">가상 회원 · 실제 계정·권한은 변경하지 않습니다.</p>`;
  }
  function refreshFindMembers(focusSelector) { $('ps-find-admin').innerHTML=findMemberAdmin(); if(focusSelector) document.querySelector(focusSelector)?.focus(); }
  const findBasemaps = () => [['일반 지도','general'],['위성 지도','satellite']].map(([label,glyph])=>mapTools.button(label,glyph,`data-find-basemap="${label}"`,findBasemap===label)).join('');
  // [작업명, 촬영일, 파일 수, 데이터 방식] — 실제 D-FIND 작업 카드와 같은 항목만 둔다.
  const findProjects = [
    ['검토용 탐지 프로젝트', [['검토용 작업 01', '2026-10-02', 12, 'nas']]],
    ['검토용 이전 프로젝트', [['검토용 작업 01', '2026-09-15', 8, 'nas'], ['검토용 작업 02', '2026-09-28', 5, 'upload']]],
  ];
  const openedTasks = () => findProjects.find(([name]) => name === configs['d-find'].context)?.[1] ?? [];
  const currentFindTask = () => openedTasks()[findTask] ?? openedTasks()[0];
  const findWorkLocked = () => brand === 'd-find' && !findProjectSelected;
  const icon = (name) => `<svg aria-hidden="true"><use href="#ps-icon-${name}"/></svg>`;
  const announce = (text) => { $('ps-live').textContent = text; };
  const menuRow = (label, active = false, attrs = '') => `<button type="button" class="ps-nav-row" ${active ? 'aria-current="page"' : ''} ${attrs}>${label}</button>`;
  function closePopovers(focus = false) {
    document.querySelectorAll('.ps-popover[open]').forEach((el) => { el.open = false; if (focus) el.querySelector('summary').focus(); });
  }
  function syncURL() {
    const url = new URL(location.href); url.searchParams.set('brand', brand); url.searchParams.set('view', view);
    url.searchParams.set('task',task); if(view==='manage') url.searchParams.set('admin',adminItem); else url.searchParams.delete('admin');
    if(brand==='d-find') url.searchParams.set('project', findProjectSelected ? 'selected' : 'none'); else url.searchParams.delete('project');
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
  // D-FIND 패널 조각: 제목 줄 오른쪽 건수, 날짜 선택 버튼, 기준→비교 두 칸.
  // 초기화는 필터를 바꾸면 나타나며 줄 높이(20px)를 바꾸지 않는다(.ps-find-reset).
  const findHead = (title, count, reset = false) => `<div class="ps-find-section-head"><h2>${title}</h2><div class="ps-find-section-meta"><span>${count}</span>${reset ? '<button type="button" class="ps-find-reset" data-find-reset hidden>초기화</button>' : ''}</div></div>`;
  // 날짜는 좁은 패널에서 두 칸을 나란히 둘 때 YY.MM.DD로 줄여 보인다.
  const findDate = (label, sample) => `<div class="ps-find-date-field"><span class="ps-field">${label}</span><button type="button" class="ctl ps-find-date" aria-label="${label}" data-find-date="${sample}">${icon('calendar-days')}<span>날짜 선택</span></button></div>`;
  // 기준 → 비교: 280px 패널에서 긴 값이 잘리지 않게 위아래로 두고 왼쪽 점·연결선으로 흐름을 보인다.
  const findPair = (a, b) => `<div class="ps-compare-pair"><div class="ps-compare-step">${a}</div><div class="ps-compare-step ps-compare-step-after">${b}</div></div>`;
  const findSelect = (id, label, ...options) => `<div><label class="ps-field" for="${id}">${label}</label><select class="ctl" id="${id}">${options.map((o) => `<option>${o}</option>`).join('')}</select></div>`;
  const measureChoice = (kind) => {
    const name = kind === 'distance' ? '거리 측정' : '면적 측정';
    const active = selectedTools['d-find'].has(name);
    return `<button type="button" class="ps-find-choice-btn" data-find-measure="${kind}" aria-pressed="${active}">${active ? icon('close') : `<svg aria-hidden="true"><use href="#dm-map-${kind}"/></svg>`}<span>${active ? '측정 취소' : name}</span></button>`;
  };
  function panelContent() {
    if (view === 'manage') return `<nav aria-label="${configs[brand].name} 관리 메뉴">${configs[brand].admin.map((label) => menuRow(label, label === adminItem, `data-admin="${label}"`)).join('')}</nav>`;
    if (brand === 'd-road') return `<div class="ps-panel-body"><label class="ps-field" for="ps-project-search">프로젝트 그룹 검색</label><input class="ctl" id="ps-project-search" type="search" placeholder="그룹명 검색"><nav class="ps-tree" aria-label="프로젝트 계층"><details open data-project-group="검토용 조사 그룹"><summary>검토용 조사 그룹</summary><div>${menuRow('검토용 조사 프로젝트', true, 'data-project="검토용 조사 프로젝트"')}${menuRow('검토용 분석 데이터', false, 'data-project="검토용 분석 데이터"')}<div class="ps-shell-actions">${shellAction('데이터 업로드','road-upload')}</div></div></details><details data-project-group="지난 조사 그룹"><summary>지난 조사 그룹</summary><div>${menuRow('검토용 이전 프로젝트', false, 'data-project="검토용 이전 프로젝트"')}<div class="ps-shell-actions">${shellAction('데이터 업로드','road-upload')}</div></div></details></nav><p class="ps-small" id="ps-search-empty" hidden>일치하는 프로젝트 그룹이 없습니다.</p></div><footer class="ps-panel-footer">${shellAction('프로젝트 그룹 생성','road-create',true)}</footer>`;
    if (brand === 'k-aquas') return ka.panel(task);
    if (task === 'projects' && findProjectSelected) {
      // 지도에서 연 프로젝트: D-FIND처럼 작업 데이터 목록과 작업 추가를 보인다.
      const tasks = openedTasks();
      const card = ([title, date, files, source], i) => `<div class="ps-shell-card ps-find-task"${i === findTask ? ' aria-current="true"' : ''}><div class="ps-find-task-row"><button type="button" class="ps-find-task-main" data-find-task="${i}" aria-pressed="${i === findTask}"><span class="ps-find-task-icon">${icon(source === 'nas' ? 'database' : 'cloud-upload')}</span><span class="ps-find-task-text"><strong>${title}</strong><small>${date}</small></span></button><button type="button" class="ps-icon-action ps-find-task-menu" data-find-task-menu="${title}" aria-label="${title} 메뉴">${icon('ellipsis')}</button></div>${i === findTask ? (source === 'nas' ? '<div class="ps-find-task-detail"><strong>NAS 연결</strong><small>/data/source/검토용</small><p>가상 경로 · 실제 NAS 탐색은 연결하지 않았습니다.</p></div>' : '<p class="ps-find-task-note">파일 업로드는 추후 제공됩니다. 현재는 NAS 연결 작업을 사용해 주세요.</p>') : ''}</div>`;
      return `<section class="ps-shell-section"><div class="ps-find-tasks-head"><h2>작업 데이터<span>${tasks.length}개</span></h2><button type="button" class="btn btn--sm btn--primary" data-shell-action="find-task-create"><svg aria-hidden="true"><use href="#dm-map-plus"/></svg>작업 추가</button></div>${tasks.map(card).join('')}</section>`;
    }
    if (task === 'projects') {
      // 프로젝트 선택: 로컬 D-FIND처럼 검색·기간 필터, 안내, 목록 머리(건수·프로젝트 생성), 카드 안 작업 미리보기.
      const preview = (name, tasks, i) => `<div class="ps-find-preview" id="ps-find-preview-${i}"><p class="ps-find-preview-head"><span>작업</span><span>${tasks.length}개</span></p><ul>${tasks.map(([title, date, files]) => `<li><strong>${title}</strong><small>${date} · 파일 ${files}개</small></li>`).join('')}${tasks.length ? '' : '<li class="ps-find-preview-empty">작업 없음</li>'}</ul><button type="button" class="btn btn--sm btn--primary ps-find-open" data-find-open="${name}">지도에서 열기<svg aria-hidden="true"><use href="#ps-icon-arrow-up-right"/></svg></button></div>`;
      const cards = findProjects.map(([name, tasks], i) => {
        const open = findPreview === name;
        const toggle = `data-find-project="${name}" aria-expanded="${open}" aria-controls="ps-find-preview-${i}"`;
        return `<article class="ps-shell-card ps-find-project"${open ? ' aria-current="true"' : ''}><div class="ps-find-project-row"><button type="button" class="ps-find-project-icon" ${toggle} aria-label="${name} 작업 보기">${icon('layers')}</button><button type="button" class="ps-find-task-main" ${toggle}><span class="ps-find-task-text"><strong>${name}</strong><small>작업 ${tasks.length}개</small></span></button><button type="button" class="ps-icon-action ps-find-task-menu" data-find-task-menu="${name}" aria-label="${name} 메뉴">${icon('ellipsis')}</button></div>${open ? preview(name, tasks, i) : ''}</article>`;
      }).join('');
      const date = (label, sample) => `<button type="button" class="ctl ps-find-date" aria-label="${label}" data-find-date="${sample}">${icon('calendar-days')}<span>날짜 선택</span></button>`;
      return `<section class="ps-shell-section ps-find-filters"><div class="ctl ps-find-search">${icon('search')}<input type="search" id="ps-find-search" placeholder="프로젝트 검색" aria-label="프로젝트 검색"></div><div class="ps-find-range">${date('시작일','26.10.01')}<span aria-hidden="true">–</span>${date('종료일','26.10.12')}</div></section><p class="ps-find-hint ps-find-unlock-note">프로젝트를 지도에서 열면 지장물 탐지 · 변화 탐지 · 측정 · 보고서를 사용할 수 있습니다.</p><section class="ps-find-list"><div class="ps-find-section-head"><span>${findProjects.length}개</span><button type="button" class="btn btn--sm btn--primary" data-shell-action="find-create"><svg aria-hidden="true"><use href="#dm-map-plus"/></svg>프로젝트 생성</button></div><div id="ps-find-projects" class="ps-find-cards">${cards}</div><p id="ps-find-empty" class="ps-shell-note" hidden>조건에 맞는 프로젝트가 없습니다.</p></section>`;
    }
    if (task === 'detect') return `<section class="ps-shell-section">${findHead('결과 필터','전체 2건',true)}<label class="ps-field" for="ps-find-target">탐지 대상</label><select class="ctl" id="ps-find-target"><option>전체 탐지 대상 (2건)</option><option>검토 대상 A (1건)</option><option>검토 대상 B (1건)</option></select><fieldset class="ps-find-period"><legend class="ps-field">촬영 기간</legend><div class="ps-shell-grid">${findDate('시작일','25.08.01')}${findDate('종료일','25.08.31')}</div></fieldset></section><section class="ps-shell-section">${findHead('탐지 결과','2건')}${[['검토 대상 A #001','2025-08-15 10:10 · 603 ㎡',1],['검토 대상 B #001','2025-08-15 10:20 · 40 ㎡',2]].map(([x,meta,n])=>`<button type="button" class="ps-shell-card ps-find-result" data-find-result><span class="ps-find-dot" style="background:var(--dm-chart-series-${n})"></span><span class="ps-find-result-text"><strong>${x}</strong><small>${meta}</small><small class="ps-find-address">가상 위치 · 검토 지역 0${n}</small></span></button>`).join('')}</section>`;
    if (task === 'change') return `<div class="ps-panel-tabs" role="group" aria-label="변화 탐지 화면"><button type="button" aria-pressed="true" data-find-change="results">${icon('list-filter')}탐지 결과</button><button type="button" aria-pressed="false" data-find-change="summary">${icon('chart-column')}요약</button></div><section class="ps-shell-section"><h2>비교 설정</h2>${findPair(findSelect('ps-find-before','기준 시점','2024 중분류 토지피복도 · 가상','2023 중분류 토지피복도 · 가상'),findSelect('ps-find-after','비교 시점','2025 중분류 토지피복도 · 가상'))}</section><section class="ps-shell-section" id="ps-change-results">${findHead('결과 필터','1개 유형',true)}${findPair(findSelect('ps-find-from-type','기존 유형','전체 기존 유형 (1건)','검토 유형 A (1건)'),findSelect('ps-find-to-type','변경 유형','전체 변경 유형 (1건)','검토 유형 B (1건)'))}</section><section class="ps-shell-section" id="ps-change-list">${findHead('변화 결과','1건 · 가상 면적')}<button type="button" class="ps-shell-card ps-find-result" data-find-result><span class="ps-find-dot" style="background:var(--dm-chart-series-3)"></span><span class="ps-find-result-text"><strong>검토 변화 지역 01</strong><small>검토 자료 · 실제 변화 분석 아님</small></span></button></section><section class="ps-shell-section" id="ps-change-summary" hidden><h2>변화 요약</h2><p class="ps-shell-note">가상 변화 지역 1건</p></section>`;
    if (task === 'measure') return `<section class="ps-shell-section"><h2>새 측정 시작</h2><div class="ps-find-choice-grid">${measureChoice('distance')}${measureChoice('area')}</div></section><section class="ps-find-empty-wrap"><div class="ps-empty">${icon('measure')}<strong>저장된 측정 결과가 없습니다</strong></div></section>`;
    const reportTypes = [['summary','종합','report',3],['detect','지장물 탐지','search',2],['change','변화 탐지','layers',1],['measure','측정','measure',0]];
    const scope = findReport === 'summary' ? '<div class="ps-find-choice-grid"><span class="ps-find-choice-btn ps-find-scope-all" aria-current="true">전체 결과</span></div>'
      : `<div class="ps-find-choice-grid">${[['all','전체 결과'],['item','개별 결과']].map(([id,label])=>`<button type="button" class="ps-find-choice-btn ps-find-scope-btn" data-find-scope="${id}" aria-pressed="${findScope===id}">${label}</button>`).join('')}</div>${findScope==='item'?'<p class="ps-shell-note">개별 결과 선택 목록은 제품 결과와 연결합니다.</p>':''}`;
    return `<section class="ps-shell-section"><h2>보고서 유형</h2><div class="ps-find-type-list">${reportTypes.map(([id,label,glyph,count])=>`<button type="button" class="ps-find-choice-btn ps-find-type" data-find-report="${id}" aria-pressed="${findReport===id}"${id!=='summary'&&count===0?' disabled':''}>${icon(glyph)}<span>${label}</span><span class="ps-find-type-count">${count}</span></button>`).join('')}</div></section><section class="ps-shell-section ps-find-last"><h2>출력 범위</h2>${scope}<p class="ps-shell-note">가상 보고서 · 실제 분석 이미지 연결 전</p></section>`;
  }
  // D-FIND 레이어 창 규격: 머리(제목·순서, 닫기 버튼 없음: 바깥 클릭·Esc·레이어 버튼으로 닫는다) → 접지 않는 구역 제목 → 한 줄(색 점·이름·스위치·상세) → 상세 한 단계.
  function findLayerWindow() {
    const row=([id,name,color])=>{const open=findLayerDetail===id;return `<div class="ps-find-layer${open?' is-open':''}"><div class="ps-find-layer-row"><i class="ps-find-layer-swatch" style="background:var(--dm-chart-series-${color})"></i><span class="ps-find-layer-name">${name}</span><input type="checkbox" role="switch" class="sw" aria-label="${name} 표시" data-find-layer="${id}"${findLayersOn.has(id)?' checked':''}><button type="button" class="ps-find-layer-more" data-find-layer-more="${id}" aria-expanded="${open}"${open?` aria-controls="ps-find-layer-detail-${id}"`:''} aria-label="${name} 상세">${icon('chevron')}</button></div>${open?`<div class="ps-find-layer-detail ps-content-enter" id="ps-find-layer-detail-${id}"><label class="ps-find-layer-opacity"><span>투명도</span><input type="range" min="0" max="100" value="100" aria-label="${name} 투명도" data-find-opacity><output>100%</output></label></div>`:''}</div>`;};
    const sections=findLayerSections.map(([id,label,rows])=>`<section class="ps-find-layer-section"><div class="ps-find-layer-head"><h3>${label}</h3><span>${rows.filter(([x])=>findLayersOn.has(x)).length}/${rows.length}</span></div><div class="ps-find-layer-list">${rows.map(row).join('')}</div></section>`).join('');
    return `<header><strong id="ps-find-layers-title">레이어</strong><button type="button" class="ps-find-layers-order" data-find-layer-order aria-pressed="${findLayerOrder}">${icon('arrow-up-down')}${findLayerOrder?'완료':'순서'}</button></header><div class="floating-body"><section class="ps-find-layers-basemap"><div class="ps-find-layer-head"><h3>배경 지도</h3></div><div class="dm-map-tool-group ps-find-basemaps-inline" role="group" aria-label="배경 지도">${findBasemaps()}</div></section>${sections}<p class="ps-shell-note">가상 레이어 · 실제 지도 연동 전</p></div>`;
  }
  function refreshFindLayers(focusSelector) {
    const panel=$('ps-find-layers');if(panel&&brand==='d-find') panel.innerHTML=findLayerWindow();
    if(focusSelector) document.querySelector(focusSelector)?.focus();
  }
  function productMapControls() {
    const group=(name,buttons,extra='')=>`<div class="dm-map-tool-group ${extra}" role="group" aria-label="${name}">${buttons}</div>`;
    const tool=(label,glyph)=>mapTools.button(label,glyph,`data-map-tool="${label}"`,selectedTools[brand].has(label));
    const command=(label,glyph,action,extra='')=>mapTools.button(label,glyph,`data-map-command="${action}" ${extra}`);
    if (brand === 'd-find' && !findProjectSelected) {
      // D-FIND 프로젝트 선택 화면의 전체 지도: 확대·축소·내 위치·전체화면만 위쪽에 둔다.
      document.querySelector('.ps-map-tools').innerHTML = group('지도 이동',command('확대','plus','zoom-in')+command('축소','minus','zoom-out')+command('내 위치','locate','locate')+'<button type="button" class="dm-map-tool" aria-label="전체화면" data-map-tooltip="전체화면" data-map-command="fullscreen"><span class="ps-tool-text">전체<br>화면</span></button>','ps-map-navigation');
    } else if (brand === 'd-find') {
      // D-FIND: 레이어 / 거리·영역 도구 / 확대·축소·내 위치·전체화면 (측정 지우기·캡처·초기화 없음)
      document.querySelector('.ps-map-tools').innerHTML =
        group('지도 레이어',mapTools.button('레이어','layers','data-map-tool="레이어" aria-controls="ps-find-layers" aria-expanded="false"',false)) +
        group('측정',mapTools.button('거리 도구','distance','data-map-tool="거리 측정"',selectedTools[brand].has('거리 측정'))+mapTools.button('영역 도구','area','data-map-tool="면적 측정"',selectedTools[brand].has('면적 측정'))) +
        group('지도 이동',command('확대','plus','zoom-in')+command('축소','minus','zoom-out')+command('내 위치','locate','locate')+'<button type="button" class="dm-map-tool" aria-label="전체화면" data-map-tooltip="전체화면" data-map-command="fullscreen"><span class="ps-tool-text">전체<br>화면</span></button>','ps-map-navigation');
    } else document.querySelector('.ps-map-tools').innerHTML =
      group('지도 레이어',mapTools.button('레이어','layers','data-map-tool="레이어" aria-controls="ps-find-layers" aria-expanded="false"',false)) +
      group('측정과 캡처',tool('거리 측정','distance')+tool('면적 측정','area')+command('측정 지우기','eraser','clear','data-map-separator')+command('화면 캡처','capture','capture')) +
      group('지도 이동과 초기화',command('지도 확대','plus','zoom-in')+command('지도 축소','minus','zoom-out')+command('내 위치로 이동','locate','locate')+command('레이어 초기화','reset','reset')+(brand==='d-find'?'<button type="button" class="dm-map-tool" aria-label="전체화면" data-map-tooltip="전체화면" data-map-command="fullscreen"><span class="ps-tool-text">전체<br>화면</span></button>':''),'ps-map-navigation');
    const mode=brand==='d-find'?`<div class="ps-mode" role="group" aria-label="지도 보기 방식"><button type="button" aria-pressed="${findMode==='2D'}" data-find-mode="2D">2D</button><button type="button" aria-pressed="${findMode==='3D'}" data-find-mode="3D">3D</button></div>`:'';
    if(brand==='d-find') {
      // 배경 지도는 2D 왼쪽의 선택 묶음(K-AQUAS와 같은 dm-map-basemaps), 3D에서는 숨긴다.
      const compare=task==='change'?(findCompare
        ?`<div class="ps-compare-bar"><div class="ps-compare-start"><button type="button" class="ps-compare-toggle" data-find-compare="close" aria-label="비교 종료">${icon('close')}<span>비교 종료</span></button><span class="ps-compare-year">2024년</span></div><span class="ps-compare-year">2025년</span></div><div class="ps-compare-divider" aria-hidden="true"><span>${icon('arrow-left-right')}</span></div>`
        :`<button type="button" class="ps-compare-toggle ps-compare-open" data-find-compare="open">${icon('columns-2')}<span>시점 좌우 비교</span></button>`):'';
      $('ps-find-controls').innerHTML=(findCompare&&task==='change'?'':`<div class="ps-find-toprow"><div class="dm-map-tool-group ps-find-basemaps" role="group" aria-label="배경 지도"${findMode==='3D'?' hidden':''}>${findBasemaps()}</div>${mode}</div><aside id="ps-find-layers" class="ps-find-layers floating-panel" aria-labelledby="ps-find-layers-title" hidden>${findLayerWindow()}</aside>`)+compare;
    } else {
      const layers=['검토 조사 영상','검토 분석 결과'];
      $('ps-find-controls').innerHTML=mode+`<aside id="ps-find-layers" class="ps-find-layers floating-panel" aria-labelledby="ps-find-layers-title" hidden><header><strong id="ps-find-layers-title">레이어</strong><button type="button" class="icon-btn dialog-close" data-find-close-layers aria-label="레이어 닫기">${icon('close')}</button></header><div class="floating-body">${layers.map(label=>`<label class="chrow"><input class="ch" type="checkbox" checked><span>${label}</span></label>`).join('')}<p class="ps-shell-note">가상 레이어 · 실제 지도 연동 전</p></div></aside>`;
    }
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
    document.querySelector('.ps-context').hidden = (brand === 'k-aquas' && view === 'map') || (findWorkLocked() && view === 'map');
    $('ps-context-label').textContent = view === 'map' ? c.contextLabel : '관리 업무';
    $('ps-context-name').textContent = view === 'map' ? c.context : adminItem;
    // 현재 위치 칩: 관리 화면은 설정, K-AQUAS 유역은 지도, 프로젝트형 제품은 폴더. D-FIND는 선택한 작업까지 보인다.
    $('ps-context-glyph').setAttribute('href', view === 'manage' ? '#ps-icon-settings' : brand === 'k-aquas' ? '#ps-icon-map' : '#ps-icon-folder-open');
    $('ps-context-sub').hidden = !(brand === 'd-find' && view === 'map' && findProjectSelected);
    $('ps-road-result-name').textContent = configs['d-road'].context;
    document.querySelectorAll('[data-brand-choice]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.brandChoice === brand)));
    document.querySelectorAll('button[data-view]').forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.view === view)));
    $('ps-workspace').dataset.view = view;
    $('ps-rail').hidden = false;
    const railTasks = findWorkLocked() ? c.tasks.filter(([id]) => id === 'projects') : c.tasks;
    const workItems = railTasks.map(([id,label,glyph]) => `<button type="button" class="ps-rail-item${revealFindTasks&&id!=='projects'?' ps-rail-reveal':''}" data-task="${id}" aria-label="${label}" ${view==='map'&&task===id?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></button>`).join('');
    $('ps-rail').innerHTML = `<div class="ps-rail-work">${workItems}</div><div class="ps-rail-bottom" role="group" aria-label="관리와 처리"><button type="button" class="ps-rail-item ps-rail-admin" data-open-admin aria-label="관리 업무"${view==='manage'?' aria-current="page"':''}>${icon('settings')}<span>관리</span></button></div>`;
    $('ps-panel').dataset.density = view === 'map' ? 'compact' : 'default';
    const findOpened = brand === 'd-find' && view === 'map' && task === 'projects' && findProjectSelected;
    const findReportPanel = brand === 'd-find' && view === 'map' && task === 'report';
    $('ps-panel-title').textContent = view === 'manage' ? '운영관리' : brand === 'd-road' ? '프로젝트' : findOpened ? c.context : findReportPanel ? 'PDF 보고서' : c.tasks.find(([id]) => id === task)?.[1];
    $('ps-find-back').hidden = !findOpened;
    $('ps-find-pdf').hidden = !findReportPanel;
    $('ps-weather').hidden = brand !== 'd-find';
    if (brand === 'd-find') $('ps-context-sub-name').textContent = currentFindTask()?.[0] ?? '검토용 작업 01';
    if (task !== 'change' || view !== 'map' || brand !== 'd-find') findCompare = false;
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
    const findOverview=brand==='d-find'&&!findProjectSelected;
    $('ps-find-controls').hidden=brand==='k-aquas'||view!=='map'||isReport||findOverview;
    document.querySelector('.ps-map-tools').classList.toggle('ps-map-tools--overview',findOverview);
    document.getElementById('ka-preview-tools').hidden = brand !== 'k-aquas';
    document.getElementById('ka-language-controls').hidden = brand !== 'k-aquas';
    document.getElementById('ka-map-content').hidden = brand !== 'k-aquas';
    document.getElementById('ka-admin-content').hidden = brand !== 'k-aquas';
    const findAdmin = brand === 'd-find' && view === 'manage';
    document.getElementById('ka-admin-placeholder').hidden = brand === 'k-aquas' || findAdmin;
    $('ps-find-admin').hidden = !findAdmin;
    if (findAdmin) $('ps-find-admin').innerHTML = findMemberAdmin();
    document.querySelector('.ps-map-slot').hidden = brand === 'k-aquas';
    // 시점 좌우 비교 중에는 지도 도구를 숨긴다(로컬 D-FIND와 같다).
    document.querySelector('.ps-map-tools').hidden = brand === 'k-aquas' || findCompare;
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
    revealFindTasks = false;
    syncOverlay();
    syncURL();
  }
  let shellReturn;
  function openShellDialog(action) {
    if(action==='find-pdf') {announce('PDF 저장 진입 시연입니다. 실제 파일은 생성하지 않습니다.');return;}
    if(action==='find-leave') {findProjectSelected=false;findPreview=null;findTask=0;task='projects';render();document.querySelector('[data-find-project]')?.focus();announce('프로젝트 선택을 해제했습니다. 업무 항목은 프로젝트를 다시 선택하면 나타납니다.');return;}
    closePopovers();
    shellReturn=document.activeElement;
    const title=action==='road-upload'?'데이터 업로드':action==='road-create'?'프로젝트 그룹 생성':action==='find-task-create'?'작업 추가':'프로젝트 생성';
    const field=(label,id,html)=>`<div class="f"><label class="lb" for="${id}">${label}${/\brequired(?:\s|>)/.test(html)?'<span class="req" aria-hidden="true">*</span>':''}</label>${html}</div>`;
    let content=field(action==='road-upload'?'데이터 이름':action==='find-task-create'?'작업명':'프로젝트명','ps-shell-name','<input class="ctl" id="ps-shell-name" required>');
    if(action==='find-task-create') content+=field('촬영일','ps-shell-date','<input class="ctl" id="ps-shell-date" type="date">')+field('NAS 경로','ps-shell-path','<input class="ctl" id="ps-shell-path" placeholder="projects/2026/검토용" aria-describedby="ps-path-help"><span class="help" id="ps-path-help">파일 업로드는 추후 제공됩니다. 현재는 NAS 연결 작업을 사용합니다.</span>');
    if(action==='road-upload') content+=field('설명','ps-shell-description','<textarea class="ctl ta" id="ps-shell-description" rows="3"></textarea>')+field('TIFF 파일','ps-shell-file','<input class="file-input" id="ps-shell-file" type="file" accept=".tif,.tiff" aria-describedby="ps-file-help" required><span class="help" id="ps-file-help">TIFF 파일(.tif, .tiff)을 선택하세요.</span>');
    $('ps-shell-dialog').innerHTML=`<form><div class="hd dialog-heading"><strong class="tt" id="ps-shell-dialog-title">${title}</strong><button type="button" class="icon-btn dialog-close" data-shell-close aria-label="창 닫기">${icon('close')}</button></div><div class="bd dialog-stack">${content}<p class="dialog-note">가상 양식입니다. 저장·업로드·분석을 실행하지 않습니다.</p></div><div class="ft"><button type="button" class="btn btn--md btn--secondary" data-shell-close>취소</button><button type="submit" class="btn btn--md btn--primary">${action==='road-upload'?'업로드':'생성'}</button></div></form>`;
    $('ps-shell-dialog').showModal();$('ps-shell-name').focus();
  }
  function selectMeasurement(tool) {
    const selected=!selectedTools[brand].has(tool);
    const refocus=document.activeElement?.dataset?.findMeasure;
    selectedTools[brand].delete('거리 측정');selectedTools[brand].delete('면적 측정');if(selected) selectedTools[brand].add(tool);
    document.querySelectorAll('[data-map-tool="거리 측정"],[data-map-tool="면적 측정"],[data-find-measure]').forEach(el=>{
      const name=el.dataset.findMeasure?(el.dataset.findMeasure==='distance'?'거리 측정':'면적 측정'):el.dataset.mapTool;
      el.setAttribute('aria-pressed',String(selectedTools[brand].has(name)));
      if(el.dataset.findMeasure) el.outerHTML=measureChoice(el.dataset.findMeasure);
    });
    if(refocus) document.querySelector(`[data-find-measure="${refocus}"]`)?.focus();announce(`${tool} ${selected?'선택':'해제'}. 실제 지도 측정은 연결하지 않았습니다.`);
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
    if(b?.dataset.findMode) {findMode=b.dataset.findMode;b.parentElement.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));const basemaps=document.querySelector('.ps-find-basemaps');if(basemaps)basemaps.hidden=findMode==='3D';announce(`${b.dataset.findMode} 지도 선택. 실제 지도 엔진 연결 전입니다.`);return;}
    if(b?.dataset.findChange) {b.parentElement.querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$('ps-change-results').hidden=b.dataset.findChange!=='results';$('ps-change-list').hidden=b.dataset.findChange!=='results';$('ps-change-summary').hidden=b.dataset.findChange!=='summary';return;}
    if(b?.dataset.findReport) {findReport=b.dataset.findReport;findScope='all';render();document.querySelector(`[data-find-report="${findReport}"]`)?.focus();announce(`${b.textContent.replace(/\d+$/,'').trim()} 보고서 유형 선택. 실제 문서는 연결하지 않았습니다.`);return;}
    if(b?.hasAttribute('data-find-result')) {document.querySelectorAll('[data-find-result]').forEach(el=>el.removeAttribute('aria-current'));b.setAttribute('aria-current','true');announce('가상 결과 선택. 실제 분석 위치는 연결하지 않았습니다.');return;}
    if(b?.dataset.findProject) {const name=b.dataset.findProject;findPreview=findPreview===name?null:name;render();document.querySelector(`[data-find-project="${name}"]`)?.focus();announce(findPreview?`${name} 작업 미리보기. 지도에서 열기로 프로젝트를 엽니다.`:`${name} 미리보기를 닫았습니다.`);return;}
    if(b?.dataset.findTask) {findTask=Number(b.dataset.findTask);render();document.querySelector(`[data-find-task="${findTask}"]`)?.focus();announce(`${currentFindTask()[0]} 작업을 선택했습니다. 헤더의 현재 작업도 바뀝니다.`);return;}
    if(b?.id==='ps-weather') {announce('날씨 정보는 추후 제공됩니다.');return;}
    if(b?.dataset.findTaskMenu) {announce(`${b.dataset.findTaskMenu} 메뉴 진입 시연입니다. 제품의 이름 변경 · 데이터 추가 · 썸네일 보기 · 삭제를 연결합니다.`);return;}
    if(b?.dataset.findBasemap) {findBasemap=b.dataset.findBasemap;document.querySelectorAll('[data-find-basemap]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.findBasemap===findBasemap)));announce(`${findBasemap} 선택. 실제 배경 지도는 연결하지 않았습니다.`);return;}
    if(b?.dataset.findLayerMore) {const id=b.dataset.findLayerMore;findLayerDetail=findLayerDetail===id?null:id;refreshFindLayers(`[data-find-layer-more="${id}"]`);return;}
    if(b?.hasAttribute('data-find-layer-order')) {findLayerOrder=!findLayerOrder;refreshFindLayers('[data-find-layer-order]');announce(findLayerOrder?'레이어 순서 편집 시연입니다. 실제 순서 변경은 연결하지 않았습니다.':'레이어 순서 편집을 마쳤습니다.');return;}
    if(b?.dataset.findCompare) {findCompare=b.dataset.findCompare==='open';render();document.querySelector('.ps-compare-toggle')?.focus();announce(findCompare?'시점 좌우 비교 시연입니다. 실제 지도 비교는 연결하지 않았습니다.':'시점 비교를 마쳤습니다.');return;}
    if(b?.dataset.findDate) {const span=b.querySelector('span');span.textContent=span.textContent===b.dataset.findDate?'날짜 선택':b.dataset.findDate;showFindReset(b);return;}
    if(b?.hasAttribute('data-find-reset')) {const section=b.closest('.ps-shell-section');section.querySelectorAll('select').forEach(el=>{el.selectedIndex=0;});section.querySelectorAll('[data-find-date] span').forEach(el=>{el.textContent='날짜 선택';});b.hidden=true;section.querySelector('select')?.focus();announce('필터를 초기화했습니다.');return;}
    if(b?.dataset.findMemberApprove) {const m=findMembers[b.dataset.findMemberApprove];m[4]='active';m[5]='2026-10-12';refreshFindMembers('[data-find-member-filter="all"]');announce(`${m[0]} 회원을 승인했습니다. 가상 자료입니다.`);return;}
    if(b?.dataset.findMemberToggle) {const i=b.dataset.findMemberToggle,m=findMembers[i];m[4]=m[4]==='disabled'?'active':'disabled';refreshFindMembers(`[data-find-member-toggle="${i}"]`);announce(`${m[0]} 회원을 ${m[4]==='disabled'?'비활성화':'활성화'}했습니다. 가상 자료입니다.`);return;}
    if(b?.dataset.findMemberRole) {announce(`${findMembers[b.dataset.findMemberRole][0]} 권한 변경 시연입니다. 제품에서는 권한 칩 자리에서 고르고, 관리자로 올릴 때 확인 창을 띄웁니다.`);return;}
    if(b?.dataset.findMemberFilter) {findMemberFilter=b.dataset.findMemberFilter;refreshFindMembers(`[data-find-member-filter="${findMemberFilter}"]`);return;}
    if(b?.dataset.findScope) {findScope=b.dataset.findScope;render();document.querySelector(`[data-find-scope="${findScope}"]`)?.focus();return;}
    if(b?.dataset.findOpen) {const name=b.dataset.findOpen,unlocked=!findProjectSelected;revealFindTasks=unlocked;findProjectSelected=true;findPreview=null;findTask=0;configs[brand].context=name;render();document.querySelector('[data-find-task="0"]')?.focus();announce(`${name}을(를) 지도에서 열었습니다.${unlocked?' 지장물 탐지, 변화 탐지, 측정, 보고서를 사용할 수 있습니다.':''}`);return;}
    if (b?.dataset.brandChoice) { brand = b.dataset.brandChoice; task = configs[brand].initial; findProjectSelected = false; findPreview = null; adminItem = configs[brand].admin[0]; panelOpen = true; closePopovers(); render(); $('ps-solution').querySelector('summary').focus(); announce(`${configs[brand].name}으로 전환했습니다. 가상 화면입니다.`); }
    else if (b?.dataset.view) changeView(b.dataset.view);
    else if (b?.hasAttribute('data-open-admin')) changeView('manage');
    else if (b?.id === 'ps-return-work') changeView('map');
    else if (b?.id === 'ps-panel-close') { setPanel(false, true); announce('작업 패널을 접었습니다.'); }
    else if (b?.id === 'ps-panel-open') setPanel(true, true);
    else if (b?.dataset.task || b?.id === 'ps-return-map') { task = b.dataset.task || (findWorkLocked() ? 'projects' : 'detect'); view='map'; panelOpen = true; render(); const target = document.querySelector(`.ps-rail-item[data-task="${task}"]`); target?.focus(); announce(`${$('ps-panel-title').textContent} 작업으로 전환했습니다.`); }
    else if (b?.dataset.admin) { if(brand==='k-aquas') ka.state.search=''; adminItem = b.dataset.admin; render(); document.querySelector(`[data-admin="${adminItem}"]`)?.focus(); }
    else if (b?.dataset.source) { b.parentElement.querySelectorAll('button').forEach(el => el.setAttribute('aria-pressed', String(el === b))); announce(`${b.dataset.source} 자료 선택. 실제 자료는 연결하지 않았습니다.`); }
    else if (b?.hasAttribute('data-record') || b?.dataset.project) { b.closest('nav').querySelectorAll('.ps-nav-row').forEach(el => el.removeAttribute('aria-current')); b.setAttribute('aria-current','page'); if (b.dataset.project) { configs[brand].context = b.dataset.project; $('ps-context-name').textContent = b.dataset.project; $('ps-road-result-name').textContent=b.dataset.project; } announce('검토용 항목을 선택했습니다. 실제 데이터 변경은 없습니다.'); }
    else if (brand!=='k-aquas'&&['거리 측정','면적 측정'].includes(b?.dataset.mapTool)) selectMeasurement(b.dataset.mapTool);
    else if (b?.dataset.mapTool) { const selected = b.getAttribute('aria-pressed') !== 'true'; selected ? selectedTools[brand].add(b.dataset.mapTool) : selectedTools[brand].delete(b.dataset.mapTool); b.setAttribute('aria-pressed', String(selected)); if(brand!=='k-aquas'&&b.dataset.mapTool==='레이어') {$('ps-find-layers').hidden=!selected;b.setAttribute('aria-expanded',String(selected));$('ps-find-layers').classList.toggle('ps-content-enter',selected);} announce(`${b.dataset.mapTool} ${selected ? '선택' : '해제'}. 실제 지도 기능은 연결하지 않았습니다.`); }
    else if (b?.id === 'ps-logout') { closePopovers(); announce('로그아웃 배치 확인용입니다. 실제 계정은 변경되지 않습니다.'); }
    document.querySelectorAll('.ps-popover[open]').forEach(el => { if (!el.contains(event.target)) el.open = false; });
  });
  document.addEventListener('input', (event) => {
    if (brand === 'k-aquas' && ka.input(event.target)) return;
    if(event.target.id==='ps-member-search') {findMemberQuery=event.target.value;$('ps-member-list').innerHTML=findMemberList();return;}
    if(event.target.matches?.('[data-find-opacity]')) {event.target.nextElementSibling.textContent=`${event.target.value}%`;return;}
    if(event.target.id==='ps-find-search') {const query=event.target.value.trim().toLocaleLowerCase();const items=[...document.querySelectorAll('.ps-find-project')];items.forEach(el=>el.hidden=!el.querySelector('strong').textContent.toLocaleLowerCase().includes(query));$('ps-find-empty').hidden=items.some(el=>!el.hidden);return;}
    if (event.target.id !== 'ps-project-search') return;
    const query = event.target.value.trim().toLocaleLowerCase();
    const groups = [...document.querySelectorAll('[data-project-group]')];
    groups.forEach(el => { el.hidden = !el.dataset.projectGroup.toLocaleLowerCase().includes(query); });
    $('ps-search-empty').hidden = groups.some(el => !el.hidden);
  });
  function showFindReset(el) {
    const section=el.closest('.ps-shell-section'),reset=section?.querySelector('[data-find-reset]');if(!reset)return;
    reset.hidden=![...section.querySelectorAll('select')].some(s=>s.selectedIndex>0)&&![...section.querySelectorAll('[data-find-date] span')].some(s=>s.textContent!=='날짜 선택');
  }
  document.addEventListener('change', event => {
    if (brand === 'k-aquas') { ka.change(event.target); return; }
    const el=event.target;
    if(el.dataset?.findLayer) {const id=el.dataset.findLayer;el.checked?findLayersOn.add(id):findLayersOn.delete(id);refreshFindLayers(`[data-find-layer="${id}"]`);return;}
    if(el.matches?.('select')) showFindReset(el);
  });
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
  // 레이어 창 안을 다시 그리면 누른 요소가 문서에서 빠지므로(isConnected=false) 바깥 클릭으로 보지 않는다.
  document.addEventListener('click',event=>{if(brand!=='k-aquas'&&event.target.isConnected&&!event.target.closest('#ps-find-layers,[data-map-tool="레이어"]'))closeMapLayers();});
  mapTools.init();
  ka.init({revealMain:()=>{if($('ps-main').inert)setPanel(false);},refresh:render, currentTask:()=>task, admin:()=>adminItem, announce, task:(next)=>{task=next;view='map';panelOpen=true;render();document.querySelector(`.ps-rail-item[data-task="${task}"]`)?.focus();}});
  document.addEventListener('click', event => {
    if (brand !== 'k-aquas') return;
    const summary = event.target.closest('.ka-study-record>summary');
    if (summary) summary.parentElement.querySelector('.ka-record-body')?.classList.toggle('ka-content-enter', !summary.parentElement.open);
  });
  render();
})();
