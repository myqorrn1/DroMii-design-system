/* K-AQUAS HTML 디자인 시연. 이름·계층: YeongjuMeuncontrol.js / ko/menubar.json.
 * 현재 위성·조사 배치: SatelliteComparisonWorkspace.js / PollutionSurveyWorkspace.js.
 * 모든 수치·사람·프로젝트는 가상. API·인증·실제 지도·저장은 연결하지 않는다. */
window.DromiiKaquasPreview = (() => {
  const tasks = [['cover','토지피복도','layers'],['priority','우선관리지역','map'],['detect','오염원탐지','search'],['livestock','축산계 오염원','folder'],['survey','전국 오염원 조사','report'],['satellite','위성데이터','layers']];
  const en = ['Land cover','Priority areas','Pollution detection','Livestock sources','National survey','Satellite data'];
  const bands = ['RGB','RGB-super','NDVI','NDWI','토지피복도','엽록소 a','남세균','탁도','총부유고형물(TSS)'];
  const state = { dam:'영주댐', role:'admin', language:'ko', sub:{cover:'환경부 기준',priority:'우선관리지역선정',satellite:'조회 목록'}, selected:'검토 지역 01', layers:new Set(['하천','[2025년] K-WATER']), basemap:'일반 지도', tool:'', opacity:80, date:'2025-08-15', boundary:'리 단위', mode:'배출량', year:'2022', status:'normal', search:'', archive:false, actionKind:'', removed:new Set(), logField:'이메일', users:[['검토 사용자 01','user01@example.invalid','검토 기관 A','승인'],['검토 사용자 02','user02@example.invalid','검토 기관 B','승인'],['검토 사용자 03','user03@example.invalid','검토 기관 A','대기'],['검토 사용자 04','user04@example.invalid','검토 기관 C','거절']] };
  state.company='검토 기관 A';
  state.recordSelection={priority:'검토 지역 01',detect:'검토 탐지 프로젝트 01'};
  const selectedRecord = () => state.recordSelection[host.currentTask()]??state.selected;
  state.loadedLayers=new Set(state.layers); state.band=0; state.layerList=true; state.priorityStep=1; state.priorityDraft={}; state.zoom=1;
  state.selectedRegions=new Set(['검토 지역 01']);
  let host;
  let returnFocusSelector;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glyph = name => `<svg aria-hidden="true"><use href="#ps-icon-${name}"/></svg>`;
  const icons = {cover:'coverageicon.png',priority:'warningareaicon.png',detect:'excludeicon.png',livestock:'livestokeicon.png',survey:'ChartIcon.png',satellite:'sentinelicon.png',processing:'autoplay.svg'};
  // PNG의 흰 캔버스/투명 도형은 제품이 배경색으로 표시하던 원본 구조다.
  // 원본 알파를 역마스크로 사용해 같은 도형에 현재 메뉴 색을 적용한다. 파일은 수정하지 않는다.
  const menuIcon = id => `<i class="ka-product-icon${id==='processing'?' ka-product-icon--positive':''}" aria-hidden="true" style="--ka-icon:url('../assets/icons/k-aquas/${icons[id]}')"></i>`;
  const action = (label,name,secondary=false) => `<button type="button" class="btn btn--md btn--${secondary?'secondary':'primary'}" data-ka-action="${name}">${label}</button>`;
  const field = (label,id,control,hidden=false) => `<div class="f"${hidden?' hidden':''}><label class="lb" for="ka-${id}">${label}${/\brequired(?:\s|>)/.test(control)?'<span class="req" aria-hidden="true">*</span>':''}</label>${control.replace('ID',`id="ka-${id}"`)}</div>`;
  const select = (id,label,values,value,inDialog=false) => {
    const control=`<select class="ctl" ID data-ka-setting="${id}">${values.map(v=>`<option${v===value?' selected':''}>${v}</option>`).join('')}</select>`;
    return inDialog?field(label,id,control):`<label class="ka-select-label" for="ka-${id}">${label}${control.replace('ID',`id="ka-${id}"`)}</label>`;
  };
  const check = (label,key=label,left=false) => `<label class="ka-layer${left?' ka-layer--left':''}">${left?'':`<span>${label}</span>`}<input type="checkbox" role="switch" class="sw" aria-label="${esc(key)}" data-ka-layer="${esc(key)}"${state.layers.has(key)?' checked':''}>${left?`<span>${label}</span>`:''}</label>`;
  const tabs = (task,labels) => `<div class="ka-tabs" role="group" aria-label="${tasks.find(t=>t[0]===task)[1]} 하위 메뉴">${labels.map(l=>`<button type="button" data-ka-sub="${l}" aria-pressed="${state.sub[task]===l}">${l}</button>`).join('')}</div>`;
  const notice = (title,detail) => `<div class="ka-state"><strong>${title}</strong><p>${detail}</p>${action('다시 보기','reset',true)}</div>`;
  const statusNotice = () => notice(state.status==='loading'?'자료를 불러오는 중입니다':state.status==='empty'?'데이터가 없습니다':state.status==='error'?'자료를 불러오지 못했습니다':'접근 권한이 없습니다','현재 메뉴의 가상 상태입니다. 기존 선택과 작업 배치를 유지합니다.');
  const source = text => `<p class="ka-help ka-source">⁕ 데이터 출처: ${text}</p>`;
  const block = (title,body) => `<section class="ka-cover-block"><h2>${title}</h2>${body}</section>`;
  const pagination = () => `<nav class="ka-pagination" aria-label="자료 페이지"><button type="button" class="btn btn--sm btn--secondary" disabled aria-label="이전 페이지">‹</button><span>1 / 1</span><button type="button" class="btn btn--sm btn--secondary" disabled aria-label="다음 페이지">›</button></nav>`;
  const records = (kind,labels) => {
    const visible=labels.filter(l=>!state.removed.has(l));
    return `<section class="ka-record-list" aria-label="${kind} 목록"><div class="ka-list-heading"><h2>${kind==='우선관리지역'?'분석 지역':'탐지 프로젝트'}</h2><span>${visible.length}개 · 가상 자료</span></div>${visible.map(l=>`<details class="ka-record ka-study-record" data-ka-record-name="${esc(l)}"${l===selectedRecord()?' open data-selected="true"':''}><summary data-ka-record="${esc(l)}"${l===selectedRecord()?' aria-current="true"':''}><span class="ka-record-title">${l}</span><span class="ka-record-meta">${kind==='우선관리지역'?'토지계 · ':''}2025-08-15</span></summary><div class="ka-record-body">${kind==='우선관리지역'?'<dl class="ka-record-detail"><div><dt>오염부하량 계산 날짜</dt><dd>2025-08-15</dd></div><div><dt>오염원 그룹</dt><dd>토지계</dd></div><div><dt>설명</dt><dd>디자인 확인용 가상 자료</dd></div></dl>':'<p class="ka-record-description">디자인 확인용 가상 자료입니다.</p>'}<div class="ka-inline-actions">${kind==='우선관리지역'?action('분석결과 다운로드','export-result',true):''}<button type="button" class="btn btn--sm btn--secondary" data-ka-delete-record="${esc(l)}" aria-label="${esc(l)} 삭제">삭제</button></div></div></details>`).join('')||'<p class="ka-help">표시할 자료가 없습니다.</p>'}</section>`;
  };
  function panel(task) {
    if(['survey','satellite'].includes(task)) return '';
    if(state.dam!=='영주댐') return notice('아직 제공되지 않는 기능입니다',`${state.dam}에서는 준비 중입니다. 분석 유역·하천 경계는 계속 확인할 수 있습니다.`);
    if(state.status!=='normal') return statusNotice();
    let body='',top='',foot='',selected='';
    if(task==='cover') {
      top=tabs(task,['환경부 기준','K-WATER']);
      body=state.sub.cover==='환경부 기준'?
        block('대분류 (7)',check('[2010년대 말] 환경부','[2010년대 말] 환경부',true))+
        block('중분류 (22)',check('[2025년] 환경부','[2025년] 환경부 · 중분류 (22)',true))+
        block('중분류 (13)',check('[2025년] K-WATER','[2025년] K-WATER',true))+
        block('세분류 (41)',check('[2025년] 환경부','[2025년] 환경부 · 세분류 (41)',true))+
        source('[환경공간정보서비스: (토지피복지도)]'):
        check('토지피복도 데이터 보기','토지피복도 데이터 보기',true)+['2025.08.15','2024.08.15'].map(d=>block('',check(`[${d}] 영주댐`,`[${d}] 영주댐`,true))).join('');
      foot=(state.sub.cover==='K-WATER'?pagination():'')+action('피복도 비교','cover-compare');
    }
    if(task==='priority') {
      top=tabs(task,['우선관리지역선정','드론데이터']);
      if(state.sub.priority==='우선관리지역선정') {
        body=check('우선관리지역 보기','우선관리지역 보기',true)+records('우선관리지역',['검토 지역 01','검토 지역 02']);
        foot=pagination()+action('우선관리지역생성','priority-create');
      } else {
        body=`<details class="ka-record" open><summary>검토 드론 자료 그룹</summary>${['검토 지역 01','검토 지역 02'].map(x=>`<label class="chrow"><input class="ch" type="checkbox" data-ka-region="${x}"${state.selectedRegions.has(x)?' checked':''}><span>${x}</span></label>`).join('')}</details>`;
        selected=`<section class="ka-region-selection"><h2>선택한 지역 목록</h2><div>${[...state.selectedRegions].map(x=>`<div class="ka-selected-region"><span>${x}</span><button type="button" class="ps-icon-action" data-ka-unselect="${x}" aria-label="${x} 선택 해제">${glyph('close')}</button></div>`).join('')||'<p class="ka-help">선택한 지역이 없습니다.</p>'}${state.selectedRegions.size?action('Point Cloud','pointcloud',true):''}</div></section>`;
        foot=`<button type="button" class="btn btn--md btn--primary" data-ka-action="region-compare"${state.selectedRegions.size<2?' disabled':''}>지역비교</button>`;
      }
    }
    if(task==='detect') {body=records('탐지 프로젝트',['검토 탐지 프로젝트 01','검토 탐지 프로젝트 02']);foot=pagination()+action('Upload','upload');}
    if(task==='livestock') body=block('축산계 분포 히트맵',['닭','한우','돼지'].map(x=>check(x,'히트맵 · '+x,true)).join(''))+source('[환경부 전국오염원조사]')+block('축산계 농가 위치',['닭','한우','돼지'].map(x=>check(x,'농가 위치 · '+x,true)).join(''))+source('[행정안전부 개별축산농가]');
    return `${top}<div class="ka-panel-scroll">${body}</div>${selected}${foot?`<footer class="ka-panel-footer">${foot}</footer>`:''}`;
  }
  function mapArt(id='main') {
    return `<svg class="ka-map-art" viewBox="0 0 900 650" preserveAspectRatio="xMidYMid slice" role="img" aria-label="디자인 시연용 가상 유역 지도, 실제 지리 자료 아님"><defs><pattern id="ka-grid-${id}" width="65" height="65" patternUnits="userSpaceOnUse"><path d="M65 0H0V65" class="ka-grid-path"/></pattern></defs><rect width="900" height="650" class="ka-map-ground"/><path d="M0 0h290l60 100-85 80-180-20L0 200ZM900 0H500l-90 90 120 95 200-50 170 70ZM0 650V410l110-40 190 60 70 140-120 80ZM900 650V390l-210-60-190 130-10 190Z" class="ka-map-forest"/><path d="m300 190 90-20 70 100-65 90-120-30ZM80 240l145-25 20 100-100 25ZM600 210l150-25 60 120-100 60-90-70ZM160 460l80-20 50 75-90 40Z" class="ka-map-fields"/><path d="M370-40c-35 115 110 140 50 245s80 130 20 215S450 545 360 700" class="ka-map-water"/><path d="M-20 170 170 200l155-35 155 60 240-35 200 70 M50 650l120-200 130-80 200 60 160-210 240-95 M0 540l290-45 190 95 190-65 240 45" class="ka-map-road"/><path d="M100 70 690 60l120 220-60 260-500 70L60 340Z" class="ka-map-boundary"/><rect width="900" height="650" fill="url(#ka-grid-${id})" opacity=".3"/></svg>`;
  }
  const weather = () => `<span class="ka-weather"><i aria-hidden="true"></i><strong>21.6°C</strong><small>가상 날씨</small></span>`;
  const mapTools = window.DromiiMapToolsPreview;
  const mapGlyph = mapTools.icon;
  const toolButton = (name,label,icon,toggle=true) => mapTools.button(label,icon,`data-ka-tool="${name}"${name==='분석 유역'?' aria-haspopup="dialog"':''}`,toggle?state.tool===name||state.layers.has(name):null);
  const tools = () => `
    <section class="ka-basin-card" aria-label="유역과 레이어"><div class="ka-basin-info"><span>K-AQUAS</span><strong>${state.dam}</strong><p>${state.dam==='영주댐'?'경상북도 영주시 · 내성천':'선택 유역 · 위치 연결 전'}</p>${host.currentTask()==='priority'?`<p class="ka-priority-context">${esc(selectedRecord())} · 가상 분석</p>`:''}<div class="ka-basin-legend"><span><i></i>분석 유역</span><span><i></i>하천</span></div><button type="button" data-ka-action="layer-list" aria-expanded="${state.layerList}" aria-controls="ka-layer-list"><span>레이어 목록</span><span class="ka-layer-count">${[...state.loadedLayers].filter(x=>state.layers.has(x)).length}/${state.loadedLayers.size}</span> ${state.layerList?'▴':'▾'}</button></div><div id="ka-layer-list"${state.layerList?'':' hidden'}>${state.loadedLayers.size?[...state.loadedLayers].map(x=>check(esc(x),x)).join(''):'<p class="ka-help">선택한 레이어가 없습니다.</p>'}</div></section>
    <div class="ka-basemaps dm-map-basemaps" role="group" aria-label="배경 지도">${mapTools.basemaps([['일반 지도','general','일반'],['야간 지도','night','야간'],['위성 지도','satellite','위성']],state.basemap,'data-ka-basemap')}</div>
    <div class="ka-map-controls"><div class="dm-map-tool-group" role="group" aria-label="지도 레이어">${[['분석 유역','분석 유역','boundary',false],['하천','하천','river'],['주요 시설물','주요 시설물','facility'],['지적도','지적도','parcel']].map(x=>toolButton(...x)).join('')}</div><div class="dm-map-tool-group" role="group" aria-label="측정과 캡처">${[['거리측정','거리 측정','distance',true],['면적측정','면적 측정','area',true],['거리/면적 지우기','측정 지우기','eraser',false],['화면 캡처','화면 캡처','capture',false]].map(x=>toolButton(...x)).join('')}</div><div class="ka-map-navigation dm-map-tool-group" role="group" aria-label="지도 이동과 초기화"><button type="button" class="dm-map-tool" data-ka-zoom="1" aria-label="지도 확대" data-map-tooltip="지도 확대">${mapGlyph('plus')}</button><button type="button" class="dm-map-tool" data-ka-zoom="-1" aria-label="지도 축소" data-map-tooltip="지도 축소">${mapGlyph('minus')}</button>${toolButton('Home Point','유역 위치로 이동','locate',false)}${toolButton('Layer Reset','레이어 초기화','reset',false)}</div></div>
    ${host.currentTask()==='cover'?`<label class="ka-map-opacity" for="ka-opacity">불투명도 <output>${state.opacity}%</output><input id="ka-opacity" type="range" min="0" max="100" value="${state.opacity}" data-ka-opacity></label>`:''}<div class="ka-map-foot"><span>가상 지도 · 실제 지리·분석 자료 아님</span><span>시연 확대 ${state.zoom}단계</span></div>`;
  const settingButtons = (id,label,values) => `<div class="ka-segments" role="group" aria-label="${label}">${values.map(x=>`<button type="button" data-ka-value="${x}" data-ka-setting-button="${id}" aria-pressed="${state[id]===x}">${x}</button>`).join('')}</div>`;
  function work(task) {
    if(['satellite','survey'].includes(task)) {
      const unavailable=state.dam!=='영주댐';
      const heading=`<div class="ka-work-heading"><div><h2>${task==='satellite'?'위성데이터 상세비교':'전국오염원조사'}</h2><span>${state.dam} · ${task==='satellite'?'동일 AOI':'지역별 오염원 현황'} · 가상 자료</span></div><div class="ka-work-actions">${weather()}${task==='satellite'?select('date','촬영일',['2025-08-15','2025-07-20'],state.date)+action('위성데이터 다운로드','satellite-download',true):`<span>${state.boundary} · ${state.selected}</span>`}</div></div>`;
      if(unavailable||state.status!=='normal') return heading+`<div class="ka-work-state">${unavailable?notice('아직 제공되지 않는 기능입니다',`${state.dam}의 작업 공간입니다.`):statusNotice()}</div>`;
      if(task==='satellite') return heading+`<div class="ka-satellite-layout"><div class="ka-satellite-grid" role="group" aria-label="위성 분석 항목">${bands.map((x,i)=>`<button type="button" class="ka-satellite-cell" data-ka-band="${i}" aria-label="${x} 선택" aria-pressed="${state.band===i}">${mapArt('band-'+i)}<span>${x}</span></button>`).join('')}</div><aside class="ka-satellite-detail" aria-label="선택 데이터 상세"><h3>선택 데이터</h3><strong>${bands[state.band]}</strong><p class="ka-help">${state.date}<br>${state.dam} · 가상 영상</p>${state.band>=5?window.DromiiKaquasBusiness.legend(bands[state.band]):`<div class="ka-detail-legend"><h4>범례</h4><p class="ka-help">제품 분석 자료의 범례를 연결할 영역입니다.</p></div>`}<p class="ka-help">${state.band<2?'기본 영상과 강조 영상의 비교 영역입니다.':'선택한 분석 항목의 분포를 확인하는 영역입니다.'}</p><p class="ka-help ka-sync-note">9개 지도의 동일 AOI 배치를 유지합니다. 이동·확대 동기화는 실제 지도 연결 후 제공합니다.</p></aside></div>`;
      return heading+`<div class="ka-survey-layout"><div class="ka-survey-map">${mapArt('survey')}<div class="ka-survey-map-toolbar">${settingButtons('boundary','조사 구역 단위',['리 단위','63구역'])}</div><button class="ka-map-pin" type="button" data-ka-action="survey-area">${state.selected}</button></div><div class="ka-survey-data"><div class="ka-survey-filters">${settingButtons('year','조사 연도',['2022','2021','2020','2019','2018','2017','2016'])}${settingButtons('mode','집계 기준',['배출량','발생량'])}</div><h3>${state.selected}</h3><p class="ka-help">${state.year}년 · ${state.mode} (kg/day) · 가상 수치</p>${surveyResults()}${source('[환경부 전국오염원조사]')}</div></div>`;
    }
    return `${mapArt()}${tools()}${['priority','detect','livestock'].includes(task)&&selectedRecord()?`<button type="button" class="ka-map-pin" data-ka-action="map-record">${esc(selectedRecord())}</button>`:''}`;
  }
  function surveyResults() {
    const categories=['생활계','산업계','토지계','축산계','양식계','매립계'];
    const rows=['BOD','TN','TP'].map((metric,m)=>[metric,...categories.map((_,i)=>(10+i+m).toFixed(3)),(75+m*6).toFixed(3)]);
    return table(['항목',...categories,'전체'],rows,'조사 수치')+`<div class="ka-survey-charts">${rows.map(row=>{
      let start=0; const total=Number(row[7]);
      const stops=row.slice(1,7).map((v,i)=>{const end=start+Number(v)/total*100;const stop=`var(--dm-chart-series-${i+1}) ${start}% ${end}%`;start=end;return stop;}).join(',');
      return `<div class="ka-survey-chart"><strong>${row[0]}</strong><div class="ka-donut" role="img" aria-label="${row[0]} 오염원 구성비, 가상 수치이며 정확한 값은 위 조사 수치 표에 있음" style="background:conic-gradient(${stops})"></div></div>`;
    }).join('')}</div><div class="ka-chart-legend">${categories.map((c,i)=>`<span><i style="background:var(--dm-chart-series-${i+1})"></i>${c}</span>`).join('')}</div>`;
  }
  function table(headers,rows,label) { return `<div class="tbl-wrap ka-table-wrap" role="region" tabindex="0" aria-label="${label}"><table class="tbl"><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}">표시할 자료가 없습니다.</td></tr>`}</tbody></table></div>`; }
  function admin(name) {
    if(state.status!=='normal') return notice(state.status==='loading'?'자료를 불러오는 중입니다':state.status==='error'?'자료를 불러오지 못했습니다':state.status==='empty'?'표시할 자료가 없습니다':'관리 권한이 없습니다','관리 업무의 상태 시연입니다.');
    if(name==='사용자 관리') {
      const filtered=state.users.filter(u=>u.join(' ').toLowerCase().includes(state.search.toLowerCase()));
      return `<div class="ka-stats">${['전체 사용자','승인 대기','승인된 사용자','거절된 사용자'].map((x,i)=>`<div><span>${x}</span><strong>${i===0?state.users.length:state.users.filter(u=>u[3]===['','대기','승인','거절'][i]).length}</strong></div>`).join('')}</div><section class="ka-admin-section"><h3>승인 대기 사용자 목록</h3>${table(['이름','이메일','전화번호','회사','액션'],state.users.filter(u=>u[3]==='대기').map(u=>[esc(u[0]),esc(u[1]),'—',esc(u[2]),action('승인','approve',true)+action('거절','reject',true)]),'승인 대기 사용자')}</section><section class="ka-admin-section"><div class="ka-section-heading"><h3>사용자 목록</h3>${field('사용자 검색','users-search',`<input ID class="ctl" type="search" value="${esc(state.search)}" placeholder="이름·이메일·회사 검색" data-ka-users-search>`)}</div>${table(['이름','이메일','전화번호','회사','활동','액션'],filtered.map(u=>[esc(u[0]),esc(u[1]),'—',esc(u[2]),`<span class="bdg bdg--${u[3]==='승인'?'success':'neutral'}">${u[3]==='승인'?'활성':'비활성'}</span>`,`<button type="button" class="btn btn--sm btn--secondary" data-ka-edit-user="${esc(u[1])}">수정</button>`+`<button type="button" class="btn btn--sm btn--secondary" data-ka-delete-user="${esc(u[1])}">삭제</button>`]),'사용자 목록')}<div class="ka-list-footer"><span>가상 사용자 ${filtered.length}명 · 1 / 1 페이지</span></div></section>`;
    }
    if(name==='로그 관리') return `<div class="ka-section-heading"><h3>사용자 로그</h3>${select('log-field','검색 기준',['이메일','사용자명','IP 주소','작업'],state.logField)}${field('검색어 입력','logs-search',`<input ID class="ctl" type="search" value="${esc(state.search)}" placeholder="로그 검색" data-ka-users-search>`)}</div>${table(['Index','이메일','사용자명','IP 주소','작업','접속일시'],[0,1].filter(i=>[`user0${i+1}@example.invalid`,`검토 사용자 0${i+1}`,`192.0.2.${i+1}`,'로그인'][['이메일','사용자명','IP 주소','작업'].indexOf(state.logField)].toLowerCase().includes(state.search.toLowerCase())).map(i=>[String(i+1),`user0${i+1}@example.invalid`,`검토 사용자 0${i+1}`,`192.0.2.${i+1}`,'로그인','2025.08.15 09:00']),'사용자 로그')}<div class="ka-list-footer">가상 로그 · 선택·일괄 삭제 기능은 추가하지 않았습니다.</div>`;
    return `<div class="ka-section-heading"><h3>API Key 관리</h3><span class="bdg bdg--neutral">실제 키 없음</span></div>${select('company','회사',['검토 기관 A','검토 기관 B'],state.company)}<div class="ka-key-grid">${['SENTINELHUB','NCP','RAINFALL'].map(x=>`<button type="button" class="ka-key-card" data-ka-key="${x}"><strong>${x}</strong><span>${state.company} · ${x}</span><span class="bdg bdg--success">활성</span><span class="ka-help">가상 설정 · 상세/수정</span></button>`).join('')}</div>`;
  }
  let drawerReturn;
  const downloadResult = () => `<div class="ka-download-row"><span>2025-08-15<small>가상 자료 · 구름 없는 촬영일</small></span>${state.archive?'<span class="bdg bdg--success">완료</span>':action('다운로드','mock-download',true)}</div>`;
  function closeDrawer(focus=true) {const drawer=document.getElementById('ka-drawer');if(!drawer||drawer.hidden)return;drawer.hidden=true;if(focus&&drawerReturn) document.querySelector(drawerReturn)?.focus();}
  function openDrawer(kind) {
    host.revealMain();
    drawerReturn=`[data-ka-action="${kind}"]`;
    const drawer=document.getElementById('ka-drawer');drawer.dataset.task=host.currentTask();drawer.dataset.kind=kind;
    drawer.innerHTML=`<header><div><strong id="ka-drawer-title">${kind==='processing'?'처리 현황':'위성데이터 다운로드'}</strong><span>가상 상태 시연</span></div><button type="button" class="icon-btn dialog-close" data-ka-drawer-close aria-label="서랍 닫기">${glyph('close')}</button></header><div class="ka-drawer-body">${kind==='processing'?window.DromiiKaquasBusiness.processing():`<p class="ka-help">구름 없는 촬영일 조회</p><div class="ka-download-query">${select('cloud-year','연도',['2025','2024'],'2025')}${select('cloud-month','월',['8','7','6'],'8')}${action('조회','cloud-query',true)}</div><div id="ka-download-result">${downloadResult()}</div>`}<p class="ka-help">실제 서버 조회·파일 다운로드·처리는 연결하지 않습니다.</p><p id="ka-drawer-status" role="status"></p></div>`;
    window.DromiiKaquasBusiness.mount(drawer);drawer.hidden=false;drawer.querySelector('[data-ka-drawer-close]').focus();
  }
  function priorityStepContent() {
    if(state.priorityStep===1) return field('제목','priority-title',`<input ID class="ctl" required value="${esc(state.priorityDraft.title||'')}">`)+field('설명','priority-description',`<textarea ID class="ctl ta" rows="2" required>${esc(state.priorityDraft.description||'')}</textarea>`)+select('pollution-group','오염원 구분',['토지계','축산계'],state.priorityDraft.group||'토지계',true)+field('토지피복도','landcover','<select ID class="ctl"><option>검토용 2025년 토지피복도</option></select>',state.priorityDraft.group==='축산계')+field('오염부하량 계산 날짜','calculation-date','<input ID class="ctl" value="2025-08-15" readonly>')+action('분석인자 선택','priority-next');
    return window.DromiiKaquasBusiness.parameterEditor()+`<div class="ka-inline-actions">${action('이전','priority-back',true)}</div>`;
  }
  function showPriorityStep() {
    const dialog=document.getElementById('ka-dialog'),body=dialog.querySelector('.bd');
    if(state.priorityStep===1) state.priorityEditor=body.querySelector('[data-kb-parameters]');
    body.innerHTML=priorityStepContent()+'<p class="ka-dialog-status" role="status"></p>';
    if(state.priorityStep===2&&state.priorityEditor) body.querySelector('[data-kb-parameters]').replaceWith(state.priorityEditor);
    dialog.querySelector('button[type="submit"]').hidden=state.priorityStep!==2;
    window.DromiiKaquasBusiness.mount(body); window.DromiiKaquasBusiness.weightTotal(body);
    body.querySelector('input,select')?.focus();
  }
  function openDialog(kind, extra='') {
    const trigger=document.activeElement;
    const attr=['data-ka-action','data-ka-edit-user','data-ka-delete-user','data-ka-key','data-ka-delete-record','data-ka-band','data-ka-tool'].find(x=>trigger.hasAttribute(x));
    returnFocusSelector=attr?`[${attr}="${CSS.escape(trigger.getAttribute(attr))}"]`:null;
    state.actionKind=kind;
    const titles={upload:'퇴비 탐지 프로젝트 시작','priority-create':'우선관리지역생성','satellite-download':'위성데이터 다운로드','cover-compare':'이동할 페이지 선택',help:'도움말','region-compare':'지역비교',pointcloud:'Point Cloud','export-result':'분석결과 다운로드','delete-record':'자료 삭제 확인','user-edit':'사용자 수정','delete-user':'사용자 삭제 확인',key:'API Key 상세/수정',processing:'처리 현황',layers:'분석 유역',band:'선택 데이터',detail:'선택 자료 상세'};
    let content='<p>선택 항목의 디자인 시연입니다. 실제 데이터나 서버는 변경하지 않습니다.</p>';
    if(kind==='detail') {
      const task=host.currentTask();
      content=window.DromiiKaquasBusiness.info(task==='detect'?'detect':task==='livestock'?'livestock':'priority',selectedRecord());
      titles.detail=task==='priority'?'우선관리지역 정보':task==='detect'?'탐지 결과':'축산계 오염원';
    }
    if(kind==='help') content='<p>기존 K-AQUAS 카테고리 배치를 유지한 Core 스타일 시안입니다. 모든 지도·자료·날씨는 가상입니다.</p>';
    if(kind==='upload') content=field('프로젝트 제목','project-title','<input ID class="ctl" required placeholder="디자인 시연용 프로젝트">')+field('프로젝트 설명','description','<textarea ID class="ctl ta" rows="3"></textarea>')+field('미디어 타입','media','<select ID class="ctl"><option>이미지</option><option>영상</option></select>')+field('우선관리지역 선택','area','<select ID class="ctl"><option>선택 안함</option><option>검토 지역 01</option></select>')+field('촬영 날짜','upload-date','<input ID class="ctl" type="date" required>')+window.DromiiKaquasBusiness.uploadBox('ka-file');
    if(kind==='priority-create') {state.priorityStep=1;state.priorityDraft={};state.priorityEditor=null;content=priorityStepContent();}
    if(kind==='export-result') content=table(['자료','파일 형식'],[[selectedRecord()+' 분석결과','CSV']],'분석결과 내보내기')+'<p class="dialog-note">다운로드 진입과 자료 구성을 확인하는 시안입니다. 실제 분석 결과·파일은 생성하지 않습니다.</p>';
    if(kind==='cover-compare') content='<div class="dialog-choice-list"><button type="button" class="dialog-choice" data-ka-action="compare-numeric"><strong>데이터 수치 비교</strong><span>피복도별 수치를 비교합니다.</span></button><button type="button" class="dialog-choice" data-ka-action="compare-detail"><strong>피복도 상세 비교</strong><span>분류별 피복도 상세를 확인합니다.</span></button></div>';
    if(kind==='region-compare') content=`<div class="ka-compare">${[0,1].map(i=>`<div>${mapArt('compare-'+i)}<strong>${i?'비교 자료':'기준 자료'}</strong></div>`).join('')}</div><p class="dialog-note">두 자료 비교 배치. 가상 지도이며 분석 결과는 아닙니다.</p>`;
    if(kind==='pointcloud') content='<div class="ka-pointcloud" aria-label="가상 포인트 클라우드 영역">3D 자료 영역</div><p class="dialog-note">기존 드론 자료의 Point Cloud 진입을 유지합니다. 실제 3D 렌더러 연결 전입니다.</p>';
    if(kind==='delete-record'||kind==='delete-user') content=`<p><strong>${esc(extra)}</strong>${kind==='delete-user'?' 사용자를':' 자료를'} 삭제하시겠습니까?</p><p class="dialog-note">이 시안의 ${kind==='delete-user'?'사용자 목록':'자료 목록'}에서 제거됩니다. 실제 서비스에는 영향을 주지 않습니다.</p>`;
    if(kind==='user-edit') { const user=state.users.find(u=>u[1]===extra)||state.users[0]; content=field('이름','user-name',`<input ID class="ctl" value="${esc(user[0])}" required>`)+field('이메일','user-email',`<input ID class="ctl" value="${esc(user[1])}" type="email" required>`)+field('전화번호','user-phone','<input ID class="ctl" type="tel">')+field('회사','user-company',`<input ID class="ctl" value="${esc(user[2])}">`); }
    if(kind==='key') content=`<p>서비스 유형: ${esc(extra)}</p>`+field('API 이름','key-name',`<input ID class="ctl" value="${esc(extra)}" required>`)+'<button type="button" class="btn btn--sm btn--secondary" disabled title="시연에 실제 키가 없습니다">APIKEY 복사</button>'+field('API Key 값','key-value','<input ID class="ctl" type="password" placeholder="시연용 입력, 저장하지 않음" autocomplete="off">')+field('서비스 유형','service-type',`<select ID class="ctl">${['SENTINELHUB','NCP','RAINFALL'].map(x=>`<option${x===extra?' selected':''}>${x}</option>`).join('')}</select>`)+'<label class="chrow"><input class="ch" type="checkbox" checked><span>활성화</span></label><p class="dialog-note">실제 키 조회·복사·저장은 연결하지 않습니다.</p>';
    if(kind==='layers') content=['소유역 (Li)','11개 소유역','4개 소유역'].map(x=>check(x)).join('');
    const dialog=document.getElementById('ka-dialog'); dialog.innerHTML=`<form id="ka-dialog-form"><div class="hd dialog-heading"><strong class="tt" id="ka-dialog-title">${titles[kind]||'자료 상세'}</strong><button type="button" class="icon-btn dialog-close" data-ka-close aria-label="창 닫기">${glyph('close')}</button></div><div class="bd dialog-stack">${content}<p class="ka-dialog-status" role="status"></p></div><div class="ft"><button type="button" class="btn btn--md btn--secondary" data-ka-close>${['upload','priority-create','user-edit','key','delete-record','delete-user'].includes(kind)?'취소':'닫기'}</button>${['upload','priority-create','user-edit','key','delete-record','delete-user'].includes(kind)?'<button type="submit" class="btn btn--md '+(kind.startsWith('delete')?'btn--danger':'btn--primary')+'">'+(kind.startsWith('delete')?'삭제':kind==='upload'?'프로젝트 시작':kind==='priority-create'?'생성':'저장')+'</button>':''}</div></form>`;
    dialog.dataset.extra=extra;dialog.dataset.kind=kind;if(kind==='priority-create') dialog.querySelector('button[type="submit"]').hidden=true;window.DromiiKaquasBusiness.mount(dialog.querySelector('.bd'));dialog.showModal();
  }
  function renderMap(task) {
    const map=document.getElementById('ka-map-content');
    const next=document.createRange().createContextualFragment(work(task));
    const currentChildren=[...map.children],nextChildren=[...next.children];
    if(currentChildren.length!==nextChildren.length||currentChildren.some((child,i)=>child.getAttribute('class')!==nextChildren[i].getAttribute('class'))) {map.replaceChildren(next);return;}
    // 도구 DOM을 유지해야 선택 색 전환과 세로 스크롤 위치가 재렌더 뒤에도 이어진다.
    for(const selector of ['.ka-map-controls','.ka-basemaps']) {
      const current=map.querySelector(selector),replacement=next.querySelector(selector);
      if(!current||!replacement) continue;
      for(const button of replacement.querySelectorAll('button[aria-label]')) {
        const existing=current.querySelector(`button[aria-label="${CSS.escape(button.getAttribute('aria-label'))}"]`);
        if(existing&&button.hasAttribute('aria-pressed')) existing.setAttribute('aria-pressed',button.getAttribute('aria-pressed'));
      }
    }
    currentChildren.forEach((child,i)=>{if(!child.matches('.ka-map-controls,.ka-basemaps')) child.replaceWith(nextChildren[i]);});
  }
  let motionKey;
  function render({task,view}) {
    const workspace=document.getElementById('ps-workspace');
    workspace.dataset.kaTask=task;
    const fullWorkspace=view==='map'&&['survey','satellite'].includes(task);
    if(fullWorkspace) {document.getElementById('ps-panel').hidden=true;document.getElementById('ps-panel-open').hidden=true;workspace.dataset.panel='closed';}
    document.getElementById('ps-panel-content').classList.toggle('ka-panel-content',view==='map');
    document.getElementById('ps-panel-title').parentElement.querySelector('.ps-eyebrow').hidden=view==='map';
    document.getElementById('ka-panel-context')?.remove();
    if(view==='map'&&!fullWorkspace) document.getElementById('ps-panel-close').insertAdjacentHTML('beforebegin',`<div id="ka-panel-context"><button type="button" class="ka-info" data-ka-action="help" aria-label="${tasks.find(t=>t[0]===task)[1]} 도움말">i</button>${weather()}</div>`);
    if(document.getElementById('ka-drawer').dataset.task!==task||view!=='map') closeDrawer(false);
    document.getElementById('ka-preview-tools').hidden=false;
    document.getElementById('ka-role').value=state.role; document.getElementById('ka-status').value=state.status;
    document.getElementById('ps-context-name').textContent=view==='manage'?host.admin():'';
    document.getElementById('ps-context-label').textContent=view==='manage'?'관리자페이지':'';
    const rail=document.getElementById('ps-rail');
    rail.querySelectorAll('[data-task]').forEach(el=>{const index=tasks.findIndex(t=>t[0]===el.dataset.task);el.querySelector('span').innerHTML=state.language==='en'?en[index]:['토지<br>피복도','우선관리<br>지역','오염원<br>탐지','축산계<br>오염원','전국 오염원<br>조사','위성<br>데이터'][index];el.setAttribute('aria-label',state.language==='en'?en[index]:tasks[index][1]);el.querySelector('svg')?.replaceWith(document.createRange().createContextualFragment(menuIcon(el.dataset.task)));el.hidden=el.dataset.task==='satellite'&&state.role!=='admin';el.disabled=el.dataset.task==='survey'&&state.dam!=='영주댐'; if(state.dam!=='영주댐') { el.classList.add('ka-not-ready'); el.dataset.kaTooltip=(state.language==='en'?en[index]:tasks[index][1])+' · 준비 중'; }});
    rail.querySelector('[data-open-admin]').hidden=state.role!=='admin'; rail.querySelector('[data-open-admin]').setAttribute('aria-label','관리자 페이지'); rail.querySelector('[data-open-admin] span').textContent='관리';
    if(state.role==='admin'&&state.dam==='영주댐') rail.querySelector('.ps-rail-bottom').insertAdjacentHTML('afterbegin',`<button type="button" class="ps-rail-item" data-ka-action="processing" aria-label="처리 현황">${menuIcon('processing')}<span>처리<br>현황</span></button>`);
    rail.querySelector('.ps-rail-bottom').hidden=state.role!=='admin';
    rail.querySelectorAll('.ps-rail-item').forEach(el=>{
      el.removeAttribute('title');
      // Visible Korean labels need no duplicate tooltip. English labels can exceed two lines.
      if(state.language==='en'&&el.dataset.task)el.dataset.mapTooltip=el.getAttribute('aria-label');
      if(el.disabled)el.dataset.mapTooltip=(el.dataset.kaTooltip||el.getAttribute('aria-label'));
    });
    document.getElementById('ps-manage-link').hidden=state.role!=='admin'; document.querySelector('button[data-view="manage"]').disabled=state.role!=='admin';
    document.getElementById('ka-language-controls').hidden=false;
    document.querySelectorAll('[data-ka-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.kaLanguage===state.language)));
    document.getElementById('ka-map-content').dataset.density='compact'; document.getElementById('ka-map-content').hidden=view!=='map'; renderMap(task); document.getElementById('ka-map-content').dataset.task=task; document.getElementById('ka-map-content').dataset.basemap=state.basemap;
    document.getElementById('ka-map-content').style.setProperty('--ka-opacity',String(state.opacity/100));
    document.getElementById('ka-admin-content').hidden=view!=='manage'; if(view==='manage') document.getElementById('ka-admin-content').innerHTML=admin(host.admin());
    document.getElementById('ka-admin-placeholder').hidden=true;
    // 업무·하위 탭 전환에만 등장 모션. 체크·확대·검색의 재렌더에서는 재생하지 않는다.
    const nextMotionKey = [task,view,state.sub[task],view==='manage'?host.admin():''].join('|');
    for(const id of ['ps-panel-content','ka-admin-content']) {
      const content=document.getElementById(id);content.classList.remove('ka-content-enter');
      if(nextMotionKey!==motionKey&&!content.hidden) {void content.offsetWidth;content.classList.add('ka-content-enter');}
    }
    motionKey=nextMotionKey;
  }
  function refresh(focusSelector) { host.refresh(); if(focusSelector) document.querySelector(focusSelector)?.focus(); }
  function click(b) {
    if(b.hasAttribute('data-ka-close')) { document.getElementById('ka-dialog').close(); return true; }
    if(b.dataset.kaDam) { state.dam=b.dataset.kaDam;host.task('cover');return true; }
    if(b.dataset.kaSub) {state.sub[host.currentTask()]=b.dataset.kaSub;refresh(`[data-ka-sub="${b.dataset.kaSub}"]`);return true;}
    if(b.dataset.kaLanguage) {state.language=b.dataset.kaLanguage;refresh(`[data-ka-language="${state.language}"]`);host.announce('메뉴 언어 '+state.language+'. 본문 번역은 제품 번역 파일 연결 후 적용합니다.');return true;}
    if(b.dataset.kaBasemap) {state.basemap=b.dataset.kaBasemap;refresh(`[data-ka-basemap="${state.basemap}"]`);return true;}
    if(b.dataset.kaTool) { const x=b.dataset.kaTool; if(x==='Layer Reset') {state.layers.clear();state.loadedLayers.clear();}else if(x==='Home Point') state.tool='';else if(x==='거리/면적 지우기') state.tool='';else if(x==='분석 유역') {openDialog('layers');return true;}else if(x==='화면 캡처') {host.announce('화면 캡처 진입 시연입니다. 실제 지도 캡처는 연결하지 않았습니다.');return true;}else if(['하천','주요 시설물','지적도'].includes(x)) {state.loadedLayers.add(x);state.layers.has(x)?state.layers.delete(x):state.layers.add(x);} else state.tool=state.tool===x?'':x;refresh(`[data-ka-tool="${x}"]`);return true; }
    if(b.dataset.kaRemove) {state.layers.delete(b.dataset.kaRemove);refresh();return true;}
    if(b.dataset.kaBand) {state.band=Number(b.dataset.kaBand);refresh(`[data-ka-band="${state.band}"]`);host.announce(bands[state.band]+' 선택 데이터 상세');return true;}
    if(b.dataset.kaZoom) {state.zoom=Math.max(1,Math.min(5,state.zoom+Number(b.dataset.kaZoom)));refresh(`[data-ka-zoom="${b.dataset.kaZoom}"]`);host.announce('가상 확대 단계 '+state.zoom+'. 실제 지도 확대는 연결하지 않았습니다.');return true;}
    if(b.dataset.kaSettingButton) {state[b.dataset.kaSettingButton]=b.dataset.kaValue;refresh(`[data-ka-setting-button="${b.dataset.kaSettingButton}"][data-ka-value="${b.dataset.kaValue}"]`);return true;}
    if(b.dataset.kaUnselect) {state.selectedRegions.delete(b.dataset.kaUnselect);refresh('[data-ka-sub="드론데이터"]');return true;}
    if(b.hasAttribute('data-ka-drawer-close')) {closeDrawer();return true;}
    if(b.dataset.kaKey) {openDialog('key',b.dataset.kaKey);return true;}
    if(b.dataset.kaDeleteRecord) {openDialog('delete-record',b.dataset.kaDeleteRecord);return true;}
    if(b.dataset.kaEditUser) {openDialog('user-edit',b.dataset.kaEditUser);return true;}
    if(b.dataset.kaDeleteUser) {openDialog('delete-user',b.dataset.kaDeleteUser);return true;}
    const a=b.dataset.kaAction;if(!a)return false;
    if(a==='layer-list') {state.layerList=!state.layerList;refresh('[data-ka-action="layer-list"]');return true;}
    if(a==='satellite-download'||a==='processing') {openDrawer(a);return true;}
    if(a==='compare-numeric'||a==='compare-detail') {document.querySelector('.ka-dialog-status').textContent=(a==='compare-numeric'?'데이터 수치 비교':'피복도 상세 비교')+'의 기존 페이지로 연결하는 진입점입니다. 시안에서는 실제 이동하지 않습니다.';return true;}
    if(a==='priority-next') {const form=document.getElementById('ka-dialog-form');if(!form.reportValidity())return true;state.priorityDraft.title=document.getElementById('ka-priority-title').value;state.priorityDraft.description=document.getElementById('ka-priority-description').value;state.priorityDraft.group=document.getElementById('ka-pollution-group').value;state.priorityStep=2;showPriorityStep();return true;}
    if(a==='priority-back') {state.priorityStep=1;showPriorityStep();return true;}

    if(a==='reset') {state.status='normal';refresh();return true;}
    if(a==='approve'||a==='reject') { const user=state.users.find(u=>u[3]==='대기');if(user) user[3]=a==='approve'?'승인':'거절';refresh();host.announce('가상 사용자 '+(a==='approve'?'승인':'거절')+' 상태를 변경했습니다.');return true; }
    if(a==='cloud-query'||a==='mock-download') {if(a==='mock-download')state.archive=true;document.getElementById('ka-drawer-status').textContent=a==='cloud-query'?'가상 날짜 1건 표시. 실제 조회 없음.':'완료 상태 시연. 실제 파일 다운로드 없음.';document.getElementById('ka-download-result').innerHTML=downloadResult();return true;}
    if(a==='survey-area') {state.selected=state.selected==='검토 지역 01'?'검토 지역 02':'검토 지역 01';refresh();return true;}
    if(a.startsWith('record-')) {state.selected='검토 지역 0'+(Number(a.split('-')[1])+1);refresh();host.announce('가상 지도에서 '+state.selected+' 선택');return true;}
    openDialog(a==='map-record'?'detail':a);return true;
  }
  function change(el) {
    if(el.hasAttribute('data-ka-opacity')) {state.opacity=Number(el.value);const out=el.parentElement.querySelector('output');out.textContent=state.opacity+'%';document.getElementById('ka-map-content').style.setProperty('--ka-opacity',String(state.opacity/100));return true;}

    if(el.dataset.kaSetting==='pollution-group') {document.getElementById('ka-landcover').closest('.f').hidden=el.value!=='토지계';return true;}
    if(el.dataset.kaLayer) {const card=!!el.closest('#ka-layer-list');state.loadedLayers.add(el.dataset.kaLayer);el.checked?state.layers.add(el.dataset.kaLayer):state.layers.delete(el.dataset.kaLayer);if(!document.getElementById('ka-dialog').open)refresh(`${card?'#ka-layer-list':'#ps-panel'} [data-ka-layer="${CSS.escape(el.dataset.kaLayer)}"]`);return true;}
    if(el.dataset.kaRegion) {el.checked?state.selectedRegions.add(el.dataset.kaRegion):state.selectedRegions.delete(el.dataset.kaRegion);refresh(`[data-ka-region="${el.dataset.kaRegion}"]`);return true;}
    if(el.dataset.kaSetting) { const id=el.dataset.kaSetting;if(id==='dam') {state.dam=el.value;host.task('cover');}else if(id==='log-field') {state.logField=el.value;refresh('#ka-log-field');}else if(['company','date','boundary','mode','year'].includes(id)) {state[id]=el.value;refresh(`#ka-${id}`);}return true; }
    if(el.id==='ka-role') {state.role=el.value;host.task('cover');return true;}
    if(el.id==='ka-status') {state.status=el.value;refresh('#ka-status');return true;}
    return false;
  }
  function input(el) {

    if(el.hasAttribute('data-ka-opacity')) return change(el);
    if(el.hasAttribute('data-ka-users-search')) {const pos=el.selectionStart;state.search=el.value;refresh('#'+el.id);document.getElementById(el.id)?.setSelectionRange(pos,pos);return true;}
    if(el.hasAttribute('data-ka-filter')) {document.querySelectorAll('.ka-record').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(el.value.toLowerCase()));return true;}
    return false;
  }
  function init(api) {
    host=api;
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('ka-drawer').hidden&&!document.querySelector('dialog[open]')){closeDrawer();e.preventDefault();}});
    document.addEventListener('click',e=>{const summary=e.target.closest('summary[data-ka-record]');if(summary){state.recordSelection[host.currentTask()]=summary.dataset.kaRecord;state.selected=summary.dataset.kaRecord;document.querySelectorAll('.ka-study-record').forEach(record=>{const selected=record.dataset.kaRecordName===state.selected;record.dataset.selected=String(selected);const item=record.querySelector('summary');selected?item.setAttribute('aria-current','true'):item.removeAttribute('aria-current');});const context=document.querySelector('.ka-priority-context');if(context)context.textContent=state.selected+' · 가상 분석';const pin=document.querySelector('[data-ka-action="map-record"]');if(pin)pin.textContent=state.selected;host.announce('가상 자료 선택 · '+state.selected);}});
    document.getElementById('ka-dialog').addEventListener('close',()=>{
      if(document.getElementById('ka-dialog').open)return;
      refresh();
      const target=(returnFocusSelector&&document.querySelector(returnFocusSelector))||document.querySelector('.ps-panel [aria-current]')||document.getElementById('ps-panel-close');
      target?.focus(); host.announce('시연 창을 닫았습니다.');
    });
    document.getElementById('ka-dialog').addEventListener('submit',e=>{e.preventDefault();if(state.actionKind==='priority-create'&&state.priorityStep===1){click(document.querySelector('[data-ka-action="priority-next"]'));return;}if(state.actionKind==='priority-create'){const validity=window.DromiiKaquasBusiness.weightTotal(e.currentTarget);if(validity.over)return;if(!validity.selected){document.querySelector('.ka-dialog-status').textContent='분석인자를 하나 이상 선택하세요.';document.querySelector('[data-kb-param]').focus();return;}}if(state.actionKind==='delete-user') state.users=state.users.filter(u=>u[1]!==e.currentTarget.dataset.extra);if(state.actionKind==='delete-record') {const name=e.currentTarget.dataset.extra;state.removed.add(name);if(selectedRecord()===name){const next=[...document.querySelectorAll('.ka-study-record')].find(el=>!state.removed.has(el.dataset.kaRecordName));state.recordSelection[host.currentTask()]=next?.dataset.kaRecordName||'';state.selected=state.recordSelection[host.currentTask()];}}
      if(state.actionKind==='user-edit') {const user=state.users.find(u=>u[1]===e.currentTarget.dataset.extra); if(user) {user[0]=document.getElementById('ka-user-name').value;user[1]=document.getElementById('ka-user-email').value;user[2]=document.getElementById('ka-user-company').value;}}
      document.getElementById('ka-dialog').close();refresh();host.announce('가상 '+(state.actionKind.startsWith('delete')?'삭제':'처리')+' 시연 완료. 실제 서비스 변경 없음.');});
  }
  return {tasks,state,panel,render,click,change,input,init};
})();
