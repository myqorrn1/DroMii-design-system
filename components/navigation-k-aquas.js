/* K-AQUAS HTML 디자인 시연. 이름·계층: YeongjuMeuncontrol.js / ko/menubar.json.
 * 현재 위성·조사 배치: SatelliteComparisonWorkspace.js / PollutionSurveyWorkspace.js.
 * 모든 수치·사람·프로젝트는 가상. API·인증·실제 지도·저장은 연결하지 않는다. */
window.DromiiKaquasPreview = (() => {
  const tasks = [['home','Home','map'],['cover','토지피복도','layers'],['priority','우선관리지역','map'],['detect','오염원탐지','search'],['livestock','축산계 오염원','folder'],['survey','전국 오염원 조사','report'],['satellite','위성데이터','layers']];
  const en = ['Home','Land cover','Priority areas','Pollution detection','Livestock sources','National survey','Satellite data'];
  const bands = ['RGB','RGB-super','NDVI','NDWI','토지피복도','엽록소 a','남세균','탁도','총부유고형물(TSS)'];
  const dams = ['영주댐','대청댐','용담댐','보현산댐'];
  const state = { dam:'영주댐', role:'admin', language:'ko', sub:{cover:'환경부 기준',priority:'우선관리지역선정',satellite:'조회 목록'}, selected:'검토 지역 01', layers:new Set(['하천','중분류 (22)']), basemap:'일반 지도', tool:'', opacity:80, date:'2025-08-15', boundary:'리 단위', mode:'배출량', year:'2022', status:'normal', search:'', archive:false, actionKind:'', removed:new Set(), logField:'이메일', users:[['검토 사용자 01','user01@example.invalid','검토 기관 A','승인'],['검토 사용자 02','user02@example.invalid','검토 기관 B','승인'],['검토 사용자 03','user03@example.invalid','검토 기관 A','대기'],['검토 사용자 04','user04@example.invalid','검토 기관 C','거절']] };
  state.company='검토 기관 A';
  state.selectedRegions=new Set(['검토 지역 01']);
  let host;
  let returnFocusSelector;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const glyph = name => `<svg aria-hidden="true"><use href="#ps-icon-${name}"/></svg>`;
  const action = (label,name,secondary=false) => `<button type="button" class="btn btn--md btn--${secondary?'secondary':'primary'}" data-ka-action="${name}">${label}</button>`;
  const field = (label,id,control) => `<div class="f"><label class="lb" for="ka-${id}">${label}</label>${control.replace('ID',`id="ka-${id}"`)}</div>`;
  const select = (id,label,values,value) => `<label class="ka-select-label" for="ka-${id}">${label}<select class="ctl" id="ka-${id}" data-ka-setting="${id}">${values.map(v=>`<option${v===value?' selected':''}>${v}</option>`).join('')}</select></label>`;
  const check = label => `<label class="ka-layer"><span>${label}</span><input type="checkbox" role="switch" class="sw" data-ka-layer="${label}"${state.layers.has(label)?' checked':''}></label>`;
  const tabs = (task,labels) => `<div class="ka-tabs" role="group" aria-label="${tasks.find(t=>t[0]===task)[1]} 하위 메뉴">${labels.map(l=>`<button type="button" data-ka-sub="${l}" aria-pressed="${state.sub[task]===l}">${l}</button>`).join('')}</div>`;
  const notice = (title,detail) => `<div class="ka-state"><strong>${title}</strong><p>${detail}</p>${action('다시 보기','reset',true)}</div>`;
  const records = (kind,labels) => labels.filter(l=>!state.removed.has(l)).map((l,i)=>`<details class="ka-record"${i===0?' open':''}><summary>${l}<span class="ka-record-meta">가상 자료 · 2025.08</span></summary><p>디자인 확인용 ${kind}입니다.</p><div class="ka-inline-actions">${action('지도에서 보기',`record-${i}`,true)}${kind==='드론데이터'?action('Point Cloud','pointcloud',true):''}<button type="button" class="btn btn--sm btn--secondary" data-ka-delete-record="${esc(l)}">삭제</button>${kind==='우선관리지역'?action('분석결과 다운로드','export-result',true):''}</div></details>`).join('');
  function panel(task) {
    if(task==='home') return '<p class="ka-help">분석할 유역을 선택하세요.</p>'+dams.map(d=>`<button type="button" class="ps-nav-row" data-ka-dam="${d}"${d===state.dam?' aria-current="page"':''}>${d}<span class="ka-record-meta">${d==='영주댐'?'전체 업무 메뉴 시연':'자료 준비 상태 시연'}</span></button>`).join('');
    if(state.dam!=='영주댐') return notice('아직 제공되지 않는 기능입니다',`${state.dam}에서는 준비 중입니다. 분석 유역·하천 경계는 계속 확인할 수 있습니다.`);
    if(state.status!=='normal') return notice(state.status==='loading'?'자료를 불러오는 중입니다':state.status==='empty'?'데이터가 없습니다':state.status==='error'?'자료를 불러오지 못했습니다':'접근 권한이 없습니다',state.status==='error'?'조회 실패와 자료 없음은 구분합니다. 이전 선택은 유지합니다.':'현재 메뉴의 상태 디자인을 보여주는 시연입니다.');
    let s='';
    if(task==='cover') s=tabs(task,['환경부 기준','K-WATER'])+(state.sub.cover==='환경부 기준'?`<details class="ka-section" open><summary>대분류 (7)</summary>${check('[2010년대 말] 환경부')}</details><details class="ka-section" open><summary>중분류 (22)</summary>${check('중분류 (22)')}${check('[2025년] K-WATER · 중분류 (13)')}</details><details class="ka-section"><summary>세분류 (41)</summary>${check('[2025년] 환경부 · 세분류')}</details><p class="ka-help">자료 출처 · 환경공간정보서비스</p>`:`${check('토지피복도 데이터 보기')}${records('피복도',['검토용 2025년 토지피복도','검토용 2024년 토지피복도'])}`)+action('피복도 비교','cover-compare');
    if(task==='priority') s=tabs(task,['우선관리지역선정','드론데이터'])+(state.sub.priority==='우선관리지역선정'?`${check('우선관리지역 보기')}${records('우선관리지역',['검토 지역 01','검토 지역 02'])}${action('우선관리지역생성','priority-create')}`:`${check('드론 데이터 보기')}${records('드론데이터',['검토 드론 자료 01','검토 드론 자료 02'])}`)+`<details class="ka-section" open><summary>선택한 지역 목록</summary><label class="chrow"><input class="ch" type="checkbox" data-ka-region="검토 지역 01"${state.selectedRegions.has('검토 지역 01')?' checked':''}><span>검토 지역 01</span></label><label class="chrow"><input class="ch" type="checkbox" data-ka-region="검토 지역 02"${state.selectedRegions.has('검토 지역 02')?' checked':''}><span>검토 지역 02</span></label><button type="button" class="btn btn--md btn--secondary" data-ka-action="region-compare"${state.selectedRegions.size<2?' disabled':''}>지역비교</button><p class="ka-help">비교할 지역을 두 개 선택하세요.</p></details>`;
    if(task==='detect') s=`${field('프로젝트 검색','detect-search','<input ID class="ctl" type="search" placeholder="프로젝트명 검색" data-ka-filter>')}${records('탐지 프로젝트',['검토 탐지 프로젝트 01','검토 탐지 프로젝트 02'])}<div class="ka-list-footer"><span>1 / 1 페이지</span></div>${action('Upload','upload')}`;
    if(task==='livestock') s=`<details class="ka-section" open><summary>축산계 분포 히트맵</summary>${['닭','한우','돼지'].map(x=>check('히트맵 · '+x)).join('')}</details><details class="ka-section" open><summary>축산계 농가 위치</summary>${['닭','한우','돼지'].map(x=>check('농가 위치 · '+x)).join('')}</details><p class="ka-help">레이어별 켜짐·꺼짐은 독립적으로 유지합니다.</p>`;
    if(task==='survey') s=`<p class="ka-help">조사 구역을 선택하고 연도·집계 기준별 현황을 비교합니다.</p>${select('boundary','조사 구역 단위',['리 단위','63구역'],state.boundary)}${select('year','조사 연도',['2022','2021','2020','2019','2018','2017','2016'],state.year)}${select('mode','집계 기준',['배출량','발생량'],state.mode)}<p class="ps-field">선택 구역</p><strong>${state.selected}</strong>`;
    if(task==='satellite') s=`<p class="ka-help">촬영일을 선택해 9개 분석 항목을 함께 비교합니다.</p>${select('date','촬영일',['2025-08-15','2025-07-20'],state.date)}${action('위성데이터 다운로드','satellite-download',true)}<details class="ka-section" open><summary>선택 데이터</summary>${bands.map((x,i)=>`<button type="button" class="ps-nav-row" data-ka-band="${i}">${x}</button>`).join('')}</details>`;
    return s+`<details class="ka-section ka-selected-layers" open><summary>레이어 목록 <span>${state.layers.size}</span></summary>${state.layers.size?[...state.layers].map(x=>`<div class="ka-layer"><span>${esc(x)}</span><button type="button" class="ps-icon-action" data-ka-remove="${esc(x)}" aria-label="${esc(x)} 레이어 제거">${glyph('close')}</button></div>`).join(''):'<p class="ka-help">선택한 레이어가 없습니다.</p>'}<label class="ka-opacity" for="ka-opacity">불투명도 <output>${state.opacity}%</output><input id="ka-opacity" type="range" min="0" max="100" value="${state.opacity}" data-ka-opacity></label></details>`;
  }
  function mapArt(id='main') {
    return `<svg class="ka-map-art" viewBox="0 0 900 650" preserveAspectRatio="xMidYMid slice" role="img" aria-label="디자인 시연용 가상 유역 지도, 실제 지리 자료 아님"><defs><pattern id="ka-grid-${id}" width="65" height="65" patternUnits="userSpaceOnUse"><path d="M65 0H0V65" class="ka-grid-path"/></pattern></defs><rect width="900" height="650" class="ka-map-ground"/><path d="M0 0h290l60 100-85 80-180-20L0 200ZM900 0H500l-90 90 120 95 200-50 170 70ZM0 650V410l110-40 190 60 70 140-120 80ZM900 650V390l-210-60-190 130-10 190Z" class="ka-map-forest"/><path d="m300 190 90-20 70 100-65 90-120-30ZM80 240l145-25 20 100-100 25ZM600 210l150-25 60 120-100 60-90-70ZM160 460l80-20 50 75-90 40Z" class="ka-map-fields"/><path d="M370-40c-35 115 110 140 50 245s80 130 20 215S450 545 360 700" class="ka-map-water"/><path d="M-20 170 170 200l155-35 155 60 240-35 200 70 M50 650l120-200 130-80 200 60 160-210 240-95 M0 540l290-45 190 95 190-65 240 45" class="ka-map-road"/><path d="M100 70 690 60l120 220-60 260-500 70L60 340Z" class="ka-map-boundary"/><rect width="900" height="650" fill="url(#ka-grid-${id})" opacity=".3"/></svg>`;
  }
  const tools = () => `<div class="ka-map-heading"><strong>${state.dam}</strong><span>가상 지도 · 실측 자료 아님</span></div><div class="ka-basemaps" role="group" aria-label="배경 지도">${['일반 지도','야간 지도','위성 지도'].map(x=>`<button type="button" data-ka-basemap="${x}" aria-pressed="${x===state.basemap}">${x.replace(' 지도','')}</button>`).join('')}</div><div class="ka-map-controls" role="group" aria-label="지도 도구">${['분석 유역','하천','주요 시설물','지적도','거리측정','면적측정','거리/면적 지우기','화면 캡처','Home Point','Layer Reset'].map((x,i)=>`<button type="button" data-ka-tool="${x}" aria-label="${x}" title="${x}"${(state.tool===x||state.layers.has(x))?' aria-pressed="true"':' aria-pressed="false"'}>${glyph(i<4?'layers':i<7?'measure':i===7?'report':'map')}<span>${x}</span></button>`).join('')}</div><div class="ka-map-foot"><span>표시 레이어 ${state.layers.size}개</span><span>디자인 시연 · 위치·면적 계산 없음</span></div>`;
  function work(task) {
    if(task==='home') return `<div class="ka-home"><p class="ps-eyebrow">분석 유역 선택</p><h2>유역별 업무 공간</h2><p class="ka-help">현재 유역에 맞는 기능과 자료를 확인합니다.</p><div class="ka-dam-grid">${dams.map(d=>`<button type="button" data-ka-dam="${d}">${glyph('map')}<strong>${d}</strong><span>${d==='영주댐'?'전체 메뉴 구성 시연':'유역·하천 / 자료 준비 상태'}</span></button>`).join('')}</div></div>`;
    if(task==='satellite' && state.dam==='영주댐' && state.status==='normal') return `<div class="ka-work-heading"><div><h2>위성데이터 상세비교</h2><span>${state.dam} · ${state.date} · 가상 자료</span></div>${action('위성데이터 다운로드','satellite-download',true)}</div><div class="ka-satellite-grid">${bands.map((x,i)=>`<button type="button" class="ka-satellite-cell" data-ka-band="${i}">${mapArt('band-'+i)}<span>${x}</span></button>`).join('')}</div><p class="ka-work-note">9개 분석 항목의 배치 시연입니다. 영상 동기화·분석 수치는 제품 지도 연결 후 제공합니다.</p>`;
    if(task==='survey' && state.dam==='영주댐' && state.status==='normal') return `<div class="ka-work-heading"><div><h2>전국오염원조사</h2><span>${state.dam} · ${state.year}년 · ${state.boundary} · ${state.mode}</span></div><span class="bdg bdg--neutral">가상 자료</span></div><div class="ka-survey-layout"><div class="ka-survey-map">${mapArt('survey')}<button class="ka-map-pin" type="button" data-ka-action="survey-area">${state.selected}</button></div><div class="ka-survey-data"><h3>${state.selected}</h3><p class="ka-help">${state.mode} · 디자인 확인용 가상 수치</p>${surveyResults()}<p class="ka-help">구역 선택 → 연도·집계 기준 → 표·그래프 확인 순서를 유지합니다.</p></div></div>`;
    return `${mapArt()}${tools()}${['priority','detect','livestock'].includes(task)?`<button type="button" class="ka-map-pin" data-ka-action="map-record">${state.selected}</button>`:''}<div class="ka-map-legend"><strong>${tasks.find(x=>x[0]===task)?.[1]}</strong><span><i></i>산림</span><span><i></i>농업지역</span><span><i></i>수역</span></div>`;
  }
  function surveyResults() {
    const categories=['생활계','산업계','토지계','축산계','양식계','매립계'];
    const rows=['BOD','TN','TP'].map((metric,m)=>[metric,...categories.map((_,i)=>String(10+i+m)),String(75+m*6)]);
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
  const satelliteList = () => state.sub.satellite==='보관함' && !state.archive ? '<p class="ka-help">보관한 자료가 없습니다.</p>' : records('위성데이터',['검토용 2025-08-15']);
  function openDialog(kind, extra='') {
    const trigger=document.activeElement;
    const attr=['data-ka-action','data-ka-edit-user','data-ka-delete-user','data-ka-key','data-ka-delete-record','data-ka-band'].find(x=>trigger.hasAttribute(x));
    returnFocusSelector=attr?`[${attr}="${CSS.escape(trigger.getAttribute(attr))}"]`:null;
    state.actionKind=kind;
    const titles={upload:'퇴비 탐지 프로젝트 시작','priority-create':'우선관리지역생성','satellite-download':'위성데이터 다운로드','cover-compare':'피복도 비교','region-compare':'지역비교',pointcloud:'Point Cloud','export-result':'분석결과 다운로드','delete-record':'자료 삭제 확인','user-edit':'사용자 수정','delete-user':'사용자 삭제 확인',key:'API Key 상세/수정',processing:'처리 현황',layers:'분석 유역',band:'선택 데이터',detail:'선택 자료 상세'};
    let content='<p>선택 항목의 디자인 시연입니다. 실제 데이터나 서버는 변경하지 않습니다.</p>';
    if(kind==='upload') content=field('프로젝트 제목','project-title','<input ID class="ctl" required placeholder="디자인 시연용 프로젝트">')+field('프로젝트 설명','description','<textarea ID class="ctl ta" rows="3"></textarea>')+field('미디어 타입','media','<select ID class="ctl"><option>이미지</option><option>영상</option></select>')+field('우선관리지역 선택','area','<select ID class="ctl"><option>선택 안함</option><option>검토 지역 01</option></select>')+field('촬영 날짜','date','<input ID class="ctl" type="date" required>')+field('파일 업로드','file','<input ID class="ctl" type="file" accept="image/*,video/*" required>')+'<p class="ka-help">파일 이름만 표시합니다. 파일 내용 읽기·업로드는 하지 않습니다.</p>';
    if(kind==='priority-create') content=field('제목','priority-title','<input ID class="ctl" required>')+field('설명','priority-description','<textarea ID class="ctl ta" rows="2"></textarea>')+select('pollution-group','오염원 구분',['토지계','축산계'],'토지계')+field('토지피복도','landcover','<select ID class="ctl"><option>검토용 2025년 토지피복도</option></select>')+`<details class="ka-section" open><summary>분석 조건</summary><div class="form-grid form-grid--pair">${['BOD','TN','TP','BOD_밀도','TN_밀도','TP_밀도','월간 합 강수량','일 최다 강수량','시 최다 강수량','실시간 강수량','단기예보 강수량','강수 확률','하천과의 거리','인구수'].map((x,i)=>field(x,'param-'+i,'<input ID class="ctl" type="number" min="0" value="0">')).join('')}</div></details>`;
    if(kind==='satellite-download') content='<h3>구름 없는 촬영일 조회</h3>'+select('cloud-year','연도',['2025','2024'],'2025')+select('cloud-month','월',['8','7','6'],'8')+action('조회','cloud-query',true)+tabs('satellite',['조회 목록','보관함'])+'<div id="ka-satellite-records">'+satelliteList()+'</div>'+action('다운로드','mock-download',true)+'<p class="ka-help">조회·보관 상태만 시연하며 영상은 다운로드하지 않습니다.</p>';
    if(kind==='export-result') content=table(['자료','파일 형식'],[['검토 지역 분석결과','CSV']],'분석결과 내보내기')+'<p class="ka-help">다운로드 진입과 자료 구성을 확인하는 시안입니다. 실제 분석 결과·파일은 생성하지 않습니다.</p>';
    if(kind==='cover-compare'||kind==='region-compare') content=`<div class="ka-compare">${[0,1].map(i=>`<div>${mapArt('compare-'+i)}<strong>${i?'비교 자료':'기준 자료'}</strong></div>`).join('')}</div><p class="ka-help">두 자료 비교 배치. 가상 지도이며 분석 결과는 아닙니다.</p>`;
    if(kind==='pointcloud') content='<div class="ka-pointcloud" aria-label="가상 포인트 클라우드 영역">3D 자료 영역</div><p class="ka-help">기존 드론 자료의 Point Cloud 진입을 유지합니다. 실제 3D 렌더러 연결 전입니다.</p>';
    if(kind==='delete-record'||kind==='delete-user') content=`<p>검토용 ${kind==='delete-user'?'사용자':'자료'}를 삭제하시겠습니까?</p><p class="ka-help">이 시안의 가상 자료에만 반영됩니다. 실제 서비스에는 영향을 주지 않습니다.</p>`;
    if(kind==='user-edit') { const user=state.users.find(u=>u[1]===extra)||state.users[0]; content=field('이름','user-name',`<input ID class="ctl" value="${esc(user[0])}" required>`)+field('이메일','user-email',`<input ID class="ctl" value="${esc(user[1])}" type="email" required>`)+field('전화번호','user-phone','<input ID class="ctl" type="tel">')+field('회사','user-company',`<input ID class="ctl" value="${esc(user[2])}">`); }
    if(kind==='key') content=`<p>서비스 유형: ${esc(extra)}</p>`+field('API 이름','key-name',`<input ID class="ctl" value="${esc(extra)}" required>`)+'<button type="button" class="btn btn--sm btn--secondary" disabled title="시연에 실제 키가 없습니다">APIKEY 복사</button>'+field('API Key 값','key-value','<input ID class="ctl" type="password" placeholder="시연용 입력, 저장하지 않음" autocomplete="off">')+field('서비스 유형','service-type',`<select ID class="ctl">${['SENTINELHUB','NCP','RAINFALL'].map(x=>`<option${x===extra?' selected':''}>${x}</option>`).join('')}</select>`)+'<label class="chrow"><input class="ch" type="checkbox" checked><span>활성화</span></label><p class="ka-help">실제 키 조회·복사·저장은 연결하지 않습니다.</p>';
    if(kind==='processing') content=table(['작업','상태'],[['검토 탐지 프로젝트 01','처리 중'],['검토 위성 자료','완료'],['검토 지역 생성','오류']],'가상 처리 현황')+'<p class="ka-help">영주댐 관리자용 진입. 가상 상태이며 진행률 수치는 만들지 않습니다.</p>';
    if(kind==='layers') content=['소유역 (Li)','11개 소유역','4개 소유역'].map(check).join('');
    if(kind==='band') content=`<strong>${bands[Number(extra)]}</strong><div class="ka-compare">${mapArt('detail')}</div><p class="ka-help">선택 분석 항목의 상세 자리. 실제 수치·범례는 제품 데이터에서 제공합니다.</p>`;
    const dialog=document.getElementById('ka-dialog'); dialog.innerHTML=`<form id="ka-dialog-form"><div class="hd"><strong class="tt" id="ka-dialog-title">${titles[kind]||'자료 상세'}</strong><button type="button" class="ps-icon-action" data-ka-close aria-label="창 닫기">${glyph('close')}</button></div><div class="bd">${content}<p class="ka-dialog-status" role="status"></p></div><div class="ft"><button type="button" class="btn btn--md btn--secondary" data-ka-close>닫기</button>${['upload','priority-create','user-edit','key','delete-record','delete-user'].includes(kind)?'<button type="submit" class="btn btn--md btn--primary">'+(kind.startsWith('delete')?'삭제':kind==='upload'?'프로젝트 시작':kind==='priority-create'?'생성':'저장')+'</button>':''}</div></form>`;
    dialog.dataset.extra=extra; dialog.showModal();
  }
  function render({task,view}) {
    document.getElementById('ka-preview-tools').hidden=false;
    document.getElementById('ka-role').value=state.role; document.getElementById('ka-status').value=state.status;
    document.getElementById('ps-context-name').innerHTML=`<label class="ka-dam-label" for="ka-dam">분석 유역<select class="ctl" id="ka-dam" data-ka-setting="dam">${dams.map(d=>`<option${d===state.dam?' selected':''}>${d}</option>`).join('')}</select></label>`;
    document.getElementById('ps-context-label').textContent=view==='manage'?'관리자페이지':'';
    const rail=document.getElementById('ps-rail');
    rail.querySelectorAll('[data-task]').forEach(el=>{const index=tasks.findIndex(t=>t[0]===el.dataset.task);el.querySelector('span').innerHTML=state.language==='en'?en[index]:['Home','토지피복도','우선관리<br>지역','오염원탐지','축산계<br>오염원','전국 오염원<br>조사','위성데이터'][index];el.setAttribute('aria-label',state.language==='en'?en[index]:tasks[index][1]);el.hidden=el.dataset.task==='satellite'&&state.role!=='admin';el.disabled=el.dataset.task==='survey'&&state.dam!=='영주댐'; if(state.dam!=='영주댐'&&!['home'].includes(el.dataset.task)) { el.classList.add('ka-not-ready'); el.title=tasks[index][1]+' · 준비 중'; }});
    rail.querySelector('[data-open-admin]').hidden=state.role!=='admin'; rail.querySelector('[data-open-admin]').setAttribute('aria-label','관리자 페이지'); rail.querySelector('[data-open-admin] span').innerHTML='관리자<br>페이지';
    if(state.role==='admin'&&state.dam==='영주댐') rail.insertAdjacentHTML('beforeend',`<button type="button" class="ps-rail-item" data-ka-action="processing" aria-label="처리 현황">${glyph('report')}<span>처리 현황</span></button>`);
    document.getElementById('ps-manage-link').hidden=state.role!=='admin'; document.querySelector('button[data-view="manage"]').disabled=state.role!=='admin';
    document.getElementById('ka-language-controls').hidden=false;
    document.querySelectorAll('[data-ka-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.kaLanguage===state.language)));
    document.getElementById('ka-map-content').hidden=view!=='map'; document.getElementById('ka-map-content').innerHTML=work(task); document.getElementById('ka-map-content').dataset.task=task; document.getElementById('ka-map-content').dataset.basemap=state.basemap;
    document.getElementById('ka-map-content').style.setProperty('--ka-opacity',String(state.opacity/100));
    document.getElementById('ka-admin-content').hidden=view!=='manage'; if(view==='manage') document.getElementById('ka-admin-content').innerHTML=admin(host.admin());
    document.getElementById('ka-admin-placeholder').hidden=true;
  }
  function refresh(focusSelector) { host.refresh(); if(focusSelector) document.querySelector(focusSelector)?.focus(); }
  function click(b) {
    if(b.hasAttribute('data-ka-close')) { document.getElementById('ka-dialog').close(); return true; }
    if(b.dataset.kaDam) { state.dam=b.dataset.kaDam;host.task('cover');return true; }
    if(b.dataset.kaSub) { if(document.getElementById('ka-dialog').open) {state.sub.satellite=b.dataset.kaSub;document.querySelectorAll('#ka-dialog [data-ka-sub]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.kaSub===state.sub.satellite)));document.getElementById('ka-satellite-records').innerHTML=satelliteList();} else {state.sub[host.currentTask()]=b.dataset.kaSub;refresh(`[data-ka-sub="${b.dataset.kaSub}"]`);} return true; }
    if(b.dataset.kaLanguage) {state.language=b.dataset.kaLanguage;refresh(`[data-ka-language="${state.language}"]`);host.announce('메뉴 언어 '+state.language+'. 본문 번역은 제품 번역 파일 연결 후 적용합니다.');return true;}
    if(b.dataset.kaBasemap) {state.basemap=b.dataset.kaBasemap;refresh(`[data-ka-basemap="${state.basemap}"]`);return true;}
    if(b.dataset.kaTool) { const x=b.dataset.kaTool; if(x==='Layer Reset') state.layers.clear();else if(x==='Home Point') state.tool='';else if(x==='거리/면적 지우기') state.tool='';else if(x==='분석 유역') {openDialog('layers');return true;}else if(x==='화면 캡처') {host.announce('화면 캡처 진입 시연입니다. 실제 지도 캡처는 연결하지 않았습니다.');return true;}else if(['하천','주요 시설물','지적도'].includes(x)) {state.layers.has(x)?state.layers.delete(x):state.layers.add(x);} else state.tool=state.tool===x?'':x;refresh(`[data-ka-tool="${x}"]`);return true; }
    if(b.dataset.kaRemove) {state.layers.delete(b.dataset.kaRemove);refresh();return true;}
    if(b.dataset.kaBand) {openDialog('band',b.dataset.kaBand);return true;}
    if(b.dataset.kaKey) {openDialog('key',b.dataset.kaKey);return true;}
    if(b.dataset.kaDeleteRecord) {openDialog('delete-record',b.dataset.kaDeleteRecord);return true;}
    if(b.dataset.kaEditUser) {openDialog('user-edit',b.dataset.kaEditUser);return true;}
    if(b.dataset.kaDeleteUser) {openDialog('delete-user',b.dataset.kaDeleteUser);return true;}
    const a=b.dataset.kaAction;if(!a)return false;
    if(a==='reset') {state.status='normal';refresh();return true;}
    if(a==='approve'||a==='reject') { const user=state.users.find(u=>u[3]==='대기');if(user) user[3]=a==='approve'?'승인':'거절';refresh();host.announce('가상 사용자 '+(a==='approve'?'승인':'거절')+' 상태를 변경했습니다.');return true; }
    if(a==='cloud-query'||a==='mock-download') {document.querySelector('.ka-dialog-status').textContent=a==='cloud-query'?'검토용 날짜 1건을 표시했습니다. 실제 조회는 하지 않습니다.':'가상 자료를 보관함에 표시했습니다. 파일 다운로드는 하지 않습니다.';if(a==='mock-download')state.archive=true;document.getElementById('ka-satellite-records').innerHTML=satelliteList();return true;}
    if(a==='survey-area') {state.selected=state.selected==='검토 지역 01'?'검토 지역 02':'검토 지역 01';refresh();return true;}
    if(a.startsWith('record-')) {state.selected='검토 지역 0'+(Number(a.split('-')[1])+1);refresh();host.announce('가상 지도에서 '+state.selected+' 선택');return true;}
    openDialog(a==='map-record'?'detail':a);return true;
  }
  function change(el) {
    if(el.hasAttribute('data-ka-opacity')) {state.opacity=Number(el.value);const out=el.parentElement.querySelector('output');out.textContent=state.opacity+'%';document.getElementById('ka-map-content').style.setProperty('--ka-opacity',String(state.opacity/100));return true;}
    if(el.dataset.kaLayer) {el.checked?state.layers.add(el.dataset.kaLayer):state.layers.delete(el.dataset.kaLayer);if(!document.getElementById('ka-dialog').open)refresh(`[data-ka-layer="${el.dataset.kaLayer}"]`);return true;}
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
    document.getElementById('ka-dialog').addEventListener('close',()=>{
      refresh();
      const target=(returnFocusSelector&&document.querySelector(returnFocusSelector))||document.querySelector('.ps-panel [aria-current]')||document.getElementById('ps-panel-close');
      target?.focus(); host.announce('시연 창을 닫았습니다.');
    });
    document.getElementById('ka-dialog').addEventListener('submit',e=>{e.preventDefault();if(state.actionKind==='delete-user') state.users=state.users.filter(u=>u[1]!==e.currentTarget.dataset.extra);if(state.actionKind==='delete-record') state.removed.add(e.currentTarget.dataset.extra);
      if(state.actionKind==='user-edit') {const user=state.users.find(u=>u[1]===e.currentTarget.dataset.extra); if(user) {user[0]=document.getElementById('ka-user-name').value;user[1]=document.getElementById('ka-user-email').value;user[2]=document.getElementById('ka-user-company').value;}}
      document.getElementById('ka-dialog').close();refresh();host.announce('가상 '+(state.actionKind.startsWith('delete')?'삭제':'처리')+' 시연 완료. 실제 서비스 변경 없음.');});
  }
  return {tasks,state,panel,render,click,change,input,init};
})();
