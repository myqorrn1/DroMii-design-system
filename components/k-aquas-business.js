/* K-AQUAS 제품 조합의 HTML 디자인 시연.
 * 근거: UploadPopup / AreaPopup / Infopopup / StatelandInfopopup /
 * WaterQualityChart / satelliteLayers / websocket. 실제 API·파일 읽기 없음.
 * MUI·FilePond·Chart.js·영상 뷰어를 대체하는 제품 라이브러리가 아니다. */
window.DromiiKaquasBusiness = (() => {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><use href="#ps-icon-${name}"/></svg>`;
  const button = (label, action, extra='') => `<button type="button" class="btn btn--sm btn--secondary" data-kb-action="${action}" ${extra}>${label}</button>`;
  const field = (label,id,control) => `<div class="f"><label class="lb" for="${id}">${label}${control.includes('required')?'<span class="req" aria-hidden="true">*</span>':''}</label>${control.replace(' ID',` id="${id}"`)}</div>`;
  const properties = rows => `<dl class="dialog-properties">${rows.map(([key,value])=>`<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
  const table = (headers, rows, label) => `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${label}"><table class="tbl"><caption class="kb-sr-only">${label}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const parameters = [
    ['BOD','생화학적 산소요구량(BOD) 발생량'],['TN','총질소(TN) 발생량'],['TP','총인(TP) 발생량'],
    ['BOD_밀도','단위 면적당 BOD 발생 밀도'],['TN_밀도','단위 면적당 TN 발생 밀도'],['TP_밀도','단위 면적당 TP 발생 밀도'],
    ['월간 합 강수량','월간 누적 강수량'],['일 최다 강수량','일 최대 강수량'],['시 최다 강수량','시간당 최대 강수량'],
    ['실시간 강수량','실시간 관측 강수량'],['단기예보 강수량','단기예보 강수량'],['강수 확률','강수 발생 확률'],
    ['하천과의 거리','하천으로부터의 거리'],['인구수','해당 지역 인구 수']
  ];
  // 제품 프리셋: 미지정 인자도 선택하고 자동(null)으로 보낸다. 숨겨진 altitude는 활성 목록에 없어 제외.
  const presets = {'장마철':[9,10,11], '농번기':[0,1,2,3,4,5], '장마후':[6,7,8,12], '자동분배':[]};
  const bound = new WeakSet();
  const uploads = new WeakMap();
  let sequence = 0;
  function uploadBox(prefix='kb-file') {
    return `<div class="f kb-upload" data-kb-upload>
      <label class="lb" for="${prefix}">파일 업로드<span class="req" aria-hidden="true">*</span></label>
      <div class="kb-dropzone"><strong>이미지·영상 파일 추가</strong><span>파일을 끌어 놓거나 선택하세요</span>
      <input id="${prefix}" class="file-input" type="file" multiple accept="image/*,video/mp4" aria-describedby="${prefix}-help ${prefix}-error" required></div>
      <p class="help" id="${prefix}-help">이미지 또는 MP4 · 파일당 1,000MB 이하 · 최대 100개</p>
      <ul class="kb-files" aria-label="선택한 파일"></ul>
      <p class="kb-error" id="${prefix}-error" role="status" hidden></p>
      <div class="kb-inline">${button('선택 예시','sample-files')}${button('오류 예시','sample-error')}</div>
      <p class="dialog-note">예시는 가상 파일입니다. 선택한 파일은 이름·형식·크기만 확인합니다.</p>
    </div>`;
  }
  function upload(prefix='kb') {
    return field('프로젝트 제목',prefix+'-name','<input ID class="ctl" required placeholder="프로젝트 제목 입력">')+
      field('프로젝트 설명',prefix+'-description','<textarea ID class="ctl ta" rows="2"></textarea>')+
      field('미디어 타입',prefix+'-media','<select ID class="ctl"><option>이미지</option><option>영상</option></select>')+
      field('우선관리지역 선택',prefix+'-area','<select ID class="ctl"><option>선택 안함</option><option>검토 지역 01</option></select>')+
      field('촬영 날짜',prefix+'-date','<input ID class="ctl" type="date" required>')+uploadBox(prefix+'-file');
  }
  function parameterEditor() {
    const id='kb-parameters-'+(++sequence);
    return `<section class="kb-parameters" data-kb-parameters>
      <div class="kb-parameter-toolbar"><p class="dialog-note">2 / 2 · 선택 <strong data-kb-selected>0</strong>개</p>
      <div class="f"><label class="lb" for="${id}-preset">프리셋 선택</label><select class="ctl" id="${id}-preset" data-kb-preset><option value="">직접 선택</option>${Object.keys(presets).map(x=>`<option>${x}</option>`).join('')}</select></div></div>
      <p class="help">수동 0.1~1.0 · 자동은 분석 시 분배됩니다.</p>
      <div class="kb-parameter-list" tabindex="0" role="region" aria-label="분석인자 14개 선택">${parameters.map(([label,help],i)=>`<div class="kb-parameter" data-kb-row="${i}">
        <div class="kb-parameter-heading"><label class="chrow"><input class="ch" type="checkbox" data-kb-param><span>${label}</span></label>
        <details class="kb-param-help"><summary aria-label="${label} 도움말">도움</summary><p>${help}</p></details></div>
        <div class="kb-weight" hidden><label class="kb-sr-only" for="${id}-${i}">${label} 가중치</label><input class="kb-range" id="${id}-${i}" type="range" min="0.1" max="1" step="0.1" value="0.1" aria-valuetext="0.1" aria-describedby="${id}-limit"><output for="${id}-${i}">0.1</output>${button('자동','parameter-auto','aria-pressed="false" aria-label="'+label+' 자동 가중치"')}</div>
      </div>`).join('')}</div>
      <div class="kb-weight-total"><span>수동 가중치 합계</span><output data-kb-total>0.0 / 1.0</output></div>
      <p class="kb-error" id="${id}-limit" data-kb-limit role="status" hidden>수동 합계가 1을 초과했습니다. 가중치를 조정하세요.</p>
    </section>`;
  }
  function metrics(mode='priority') {
    return `<div class="kb-metrics">${[['BOD','생화학적 산소요구량','128.40','4.25'],['TN','총질소','36.20','1.20'],['TP','총인','2.16','0.07']].map(([name,description,amount,density])=>`<section class="kb-metric"><h3>${name}</h3><p>${description}</p><dl><div><dt>발생량</dt><dd><strong>${amount}</strong><span>kg/day</span></dd></div>${mode==='priority'?`<div><dt>면적당 밀도</dt><dd>${density}<span>kg/d/km²</span></dd></div>`:''}</dl>${mode==='priority'?'<p class="kb-metric-context">평균 비교 · 가상 참고값</p>':''}</section>`).join('')}</div>`;
  }
  function info(variant='priority', title='검토 지역 01') {
    if(variant==='public') return `<div class="dialog-summary"><span class="dialog-note">국유지 정보</span><h2>검토 필지 01</h2></div>`+properties([['PNU','가상 식별값'],['주소','검토 지역 · 가상 주소'],['지번','검토 필지 01'],['소유자','검토 기관'],['관리 부서','검토 부서'],['지목','전'],['면적','1,240 ㎡'],['공시지가','12,000 원/㎡']]);
    if(variant==='livestock') return `<div class="dialog-summary"><span class="dialog-note">축산계 오염원</span><h2>${esc(title)}</h2></div><div class="kb-livestock">${[['닭','12.40','4.20','0.24','#FFB703'],['한우','80.00','20.00','1.40','#2A9D8F'],['돼지','36.00','12.00','0.52','#E76F51'],['총합','128.40','36.20','2.16','var(--dm-border-strong)']].map(([name,bod,tn,tp,color])=>`<section style="border-left-color:${color}"><h3>${name}</h3>${properties([['BOD',bod+' kg/day'],['TN',tn+' kg/day'],['TP',tp+' kg/day']])}</section>`).join('')}</div><p class="help">지도에서 표시한 축종만 보여주는 기존 구조입니다. 시안에서는 세 축종을 표시합니다.</p>`;
    if(variant==='detect') return imageViewer(title);
    return `<div class="kb-info-heading"><div class="dialog-summary"><span class="dialog-note">우선관리지역 정보</span><h2>${esc(title)}</h2><p class="dialog-note">영주댐 · 검토 분류 · 검토 하천</p></div><div class="kb-rank"><span>순위</span><strong>3<small>위</small></strong></div></div>
      <section class="dialog-section"><h3>오염부하 현황</h3><p class="dialog-note">발생량 kg/day · 면적당 밀도 kg/d/km²</p>${metrics()}<p class="help">평균 비교는 현황 참고값이며 순위 산정 기여도와 무관합니다.</p></section>
      <section class="dialog-section"><h3>유역 환경</h3>${properties([['면적','30.20 km²'],['인구수','1,240 명'],['하천과의 거리','180 m'],['월간 합 강수량','124 mm'],['일 최다 강수량','36 mm'],['시 최다 강수량','8 mm']])}</section>
      <div class="kb-inline">${button('세부지역 보기','map-detail','aria-pressed="false"')}${button('오염원 보기','map-source','aria-pressed="false"')}</div><p class="kb-local-status" role="status"></p>`;
  }
  function imageViewer(title) {
    return `<section data-kb-viewer class="kb-viewer"><div class="dialog-summary"><span class="dialog-note">오염원 탐지 결과</span><h2>${esc(title)}</h2><p class="dialog-note">가상 영상 · 2025-08-15</p></div>
      <div class="kb-view-toolbar">${button('탐지 결과 보기','image-mode','aria-pressed="false"')}${button('−','image-out','aria-label="영상 축소"')}${button('+','image-in','aria-label="영상 확대"')}${button('초기화','image-reset')}<output data-kb-image-scale>100%</output></div>
      <div class="kb-image-viewport" role="region" tabindex="0" aria-label="영상 영역 · 확대 후 방향키로 이동"><div class="kb-image-art" role="img" aria-label="디자인 확인용 가상 영상. 실제 탐지 자료가 아님"><span>가상 영상</span><div class="kb-detection-box" hidden><span>탐지 영역 · 시연</span></div></div></div>
      <p class="help">확대 후 드래그하거나 영상 영역에서 방향키로 이동합니다. 실제 서비스에서는 기존 영상 확대·이동 라이브러리를 유지합니다.</p></section>`;
  }
  // source: K-AQUAS config/satelliteLayers.js. 과학 데이터 색은 브랜드/상태 토큰으로 대체하지 않는다.
  const legendRows = [['매우 좋음','0 ~ 5','#21c3f0'],['좋음','6 ~ 9','#37e994'],['약간 좋음','10 ~ 14','#6beb2e'],['보통','15 ~ 20','#779494'],['약간 나쁨','21 ~ 35','#e49423'],['나쁨','36 ~ 70','#e4511b'],['매우 나쁨','70 초과','#e30b17']];
  const legends={
    '엽록소 a':{unit:'mg/m³',rows:legendRows},
    '남세균':{unit:'cells/m²',rows:[['미발령','0 ~ 999','#21c3f0'],['관심','1,000 ~ 9,999','#e49423'],['경계','10,000 ~ 99,999','#e4511b'],['조류대발생','1,000,000 이상','#e30b17']]},
    '탁도':{unit:'NTU',rows:['0.906 ~ 2.042','2.042 ~ 2.788','2.788 ~ 3.499','3.499 ~ 4.308','4.308 ~ 5.409','5.409 ~ 7.351','7.351 ~ 12.936'].map((range,i)=>['Class '+(i+1),range,legendRows[i][2]])},
    '총부유고형물(TSS)':{unit:'mg/L',rows:[['매우 좋음','0 ~ 1','#21c3f0'],['좋음','2 ~ 5','#37e994'],['보통','6 ~ 15','#779494']]}
  };
  function legend(name='엽록소 a') {
    const data=legends[name];
    return `<section class="kb-legend"><h3>${name} <span>${data.unit}</span></h3><ul>${data.rows.map(([label,range,color])=>`<li><span><i style="background:${color}" aria-hidden="true"></i>${label}</span><span>${range}</span></li>`).join('')}</ul><p class="help">색·구간·단위는 제품 범례 원본을 유지합니다.</p></section>`;
  }
  const landNames=['대지','공장용지','주유소용지','유원지','도로·주차장·철도·수도','학교·창고·종교','답','전','과수원','임야','체육용지','목장·공원·묘지·사적지','하천·광천·염전 등','기타'];
  const comparisonRows=landNames.map((name,i)=>({name,a:10+i*2,b:12+i*1.5,ra:(10+i*2)/322*100,rb:(12+i*1.5)/304.5*100}));
  function comparisonTable(sort='name') {
    const rows=[...comparisonRows].sort((a,b)=>sort==='area'?(b.a+b.b)-(a.a+a.b):sort==='rate'?b.rb-a.rb:a.name.localeCompare(b.name,'ko'));
    return table(['구분','A 면적 ha','B 면적 ha','A 비율','B 비율','차이 B − A'],rows.map(row=>[row.name,row.a.toFixed(2),row.b.toFixed(2),row.ra.toFixed(2)+'%',row.rb.toFixed(2)+'%',(row.b-row.a>0?'+':'')+(row.b-row.a).toFixed(2)]),'토지피복도 비교 · 가상 수치');
  }
  function comparison() {
    const id='kb-compare-'+(++sequence);
    return `<section class="dialog-section" data-kb-comparison><h3>토지피복도 비교 결과</h3><div class="kb-comparison-context"><span>A · 검토 자료 01 / 2024-08-15</span><span>B · 검토 자료 02 / 2025-08-15</span></div>
      <div class="kb-metrics">${[['BOD',120,128.4],['TN',34,36.2],['TP',2.1,2.16]].map(([name,a,b])=>`<section class="kb-metric"><h3>${name}</h3><dl><div><dt>A · kg/일</dt><dd>${a.toFixed(2)}</dd></div><div><dt>B · kg/일</dt><dd>${b.toFixed(2)}</dd></div></dl><p class="kb-metric-context">변화 +${(b-a).toFixed(2)} kg/일</p></section>`).join('')}</div>
      <div class="kb-section-heading" style="margin-top:16px"><h3>토지피복 면적</h3><label for="${id}">정렬</label><select class="ctl" id="${id}" data-kb-comparison-sort style="width:auto"><option value="name">이름순</option><option value="area">면적순</option><option value="rate">비율순</option></select></div><div data-kb-comparison-table>${comparisonTable()}</div></section>`;
  }
  function charts() {
    const id='kb-chart-'+(++sequence);
    const categories=['생활계','산업계','토지계','축산계','양식계','매립계'];
    return `<section class="kb-chart-section"><div class="kb-section-heading"><h3>수질 측정 추이</h3><div class="kb-inline"><label for="${id}-year">연도</label><select class="ctl" id="${id}-year" data-kb-chart-year><option>2025</option><option>2024</option></select></div>${button('Excel 다운로드','excel')}</div>
      <div class="kb-inline" role="group" aria-label="수질 측정 항목">${['T-N','TOC'].map((name,i)=>button(name,'chart-metric',`data-metric="${i}" aria-pressed="${i===0}"`)).join('')}<span class="dialog-note">단위 mg/L</span></div>
      <figure class="kb-line-chart"><canvas data-kb-chart role="img" aria-label="가상 수질 추이. 정확한 수치는 아래 표에 있습니다."></canvas></figure><div data-kb-chart-table></div></section>
      <section class="dialog-section"><h3>오염원 구성비</h3><p class="dialog-note">가상 BOD 발생량 · kg/day</p><div class="kb-chart-composition"><div class="kb-donut" role="img" aria-label="오염원 구성비: 생활계 20%, 산업계 12%, 토지계 28%, 축산계 30%, 양식계 6%, 매립계 4%." style="background:conic-gradient(var(--dm-chart-series-1) 0% 20%,var(--dm-chart-series-2) 20% 32%,var(--dm-chart-series-3) 32% 60%,var(--dm-chart-series-4) 60% 90%,var(--dm-chart-series-5) 90% 96%,var(--dm-chart-series-6) 96% 100%)"><span>BOD<strong>100.00</strong><small>kg/day</small></span></div>
      ${table(['분류','발생량','구성비'],categories.map((name,i)=>[`<span class="kb-chart-key"><i style="background:var(--dm-chart-series-${i+1})"></i>${name}</span>`,['20.00','12.00','28.00','30.00','6.00','4.00'][i],['20%','12%','28%','30%','6%','4%'][i]]),'오염원 구성비 · 가상 수치')}</div></section>
      ${comparison()}<section class="dialog-section"><div class="kb-section-heading"><label for="${id}-legend">데이터 범례</label><select class="ctl" id="${id}-legend" data-kb-legend style="width:auto;max-width:100%">${Object.keys(legends).map(name=>`<option>${name}</option>`).join('')}</select></div><div data-kb-legend-content>${legend()}</div></section>`;
  }
  const stageNames = {
    satellite:['위성데이터 다운로드','초해상도 처리','토지피복도 생성'],
    priority:['요청 접수','우선순위 분석','결과 저장'],
    detection:['파일 업로드','오염원 탐지','결과 저장']
  };
  function processing() {
    return `<section class="kb-processing"><div class="kb-service-health"><span class="bdg bdg--info">상태 수신 중 · 시연</span><span>방금 상태 갱신 · 가상</span></div><p class="dialog-note">작업은 서버에서 계속 진행됩니다. 완료되면 해당 결과 목록에서 확인할 수 있습니다.</p>
      ${[['satellite','위성데이터 처리','검토 위성 자료','running'],['priority','우선관리지역 처리','검토 지역 01','waiting'],['detection','오염원탐지 처리','검토 탐지 프로젝트 01','error']].map(([type,heading,title,status])=>`<section class="kb-task-section"><h3>${heading}</h3><article class="kb-task" data-kb-task><header><div><strong>${title}</strong><p>2025-08-15 · 가상 작업</p></div><span class="bdg bdg--${status==='error'?'danger':status==='waiting'?'neutral':'info'}">${status==='error'?'처리 오류':status==='waiting'?'작업 대기 중':'처리 중'}</span></header>
      <ol class="kb-stages">${stageNames[type].map((name,i)=>`<li data-stage="${status==='waiting'?'waiting':i===0?'done':i===1?status:'waiting'}"><span class="kb-stage-mark" aria-hidden="true">${i+1}</span><span>${name}</span><small>${status==='waiting'?'대기':i===0?'완료':i===1?(status==='error'?'오류':'진행 중'):'대기'}</small></li>`).join('')}</ol>
      <p class="${status==='error'?'kb-error':'help'}">${status==='error'?'탐지 과정에서 오류가 발생했습니다. 오류 내용을 확인해 주세요.':status==='running'?'서버에서 처리 중 · 진행률 미제공':'요청 접수 대기'}</p>${button('처리 취소','cancel-task',`data-task-type="${type}" data-task-title="${title}"`)}</article></section>`).join('')}
      <p class="kb-local-status" role="status"></p></section>`;
  }
  const titles={upload:'퇴비 탐지 프로젝트 시작',parameters:'분석인자와 가중치',info:'분석·지도 상세',charts:'차트·범례·비교',processing:'처리 현황'};
  function content(kind, prefix='kb') {
    if(kind==='upload') return upload(prefix);
    if(kind==='parameters') return parameterEditor();
    if(kind==='charts') return charts();
    if(kind==='processing') return processing();
    return `<div class="kb-inline" role="group" aria-label="상세 유형">${[['priority','우선관리지역'],['public','국유지'],['livestock','축산계'],['detect','탐지 영상']].map(([value,label])=>button(label,'info-variant',`data-variant="${value}" aria-pressed="${value==='priority'}"`)).join('')}</div><div data-kb-info class="dialog-stack">${info()}</div>`;
  }
  function weightTotal(root) {
    const editor=root.matches('[data-kb-parameters]')?root:root.querySelector('[data-kb-parameters]');
    if(!editor) return {selected:0, over:false};
    const rows=[...editor.querySelectorAll('[data-kb-row]')].filter(row=>row.querySelector('[data-kb-param]').checked);
    const total=rows.reduce((sum,row)=>sum+(row.querySelector('[data-kb-action="parameter-auto"]').getAttribute('aria-pressed')==='true'?0:Number(row.querySelector('input[type="range"]').value)),0);
    const over=total>1.000001;
    editor.querySelector('[data-kb-total]').textContent=total.toFixed(1)+' / 1.0';
    editor.querySelector('[data-kb-selected]').textContent=rows.length;
    editor.querySelector('[data-kb-limit]').hidden=!over;
    const submit=editor.closest('form')?.querySelector('[type="submit"]');
    if(submit) submit.disabled=over;
    return {selected:rows.length,over};
  }
  function renderFiles(box, files) {
    uploads.set(box,files);
    const error=files.length>100?'최대 100개까지 선택할 수 있습니다.':files.find(file=>file.size>1000*1000*1000)?'파일당 1,000MB를 초과할 수 없습니다.':files.find(file=>!file.type.startsWith('image/')&&file.type!=='video/mp4')?'이미지 또는 MP4만 선택할 수 있습니다.':'';
    const input=box.querySelector('input[type="file"]');
    input.setAttribute('aria-invalid',String(!!error));
    input.setCustomValidity(error || (files.length?'':'파일을 선택하세요.'));
    input.required=!files.length;
    const message=box.querySelector('.kb-error');message.hidden=!error;message.textContent=error;
    box.querySelector('.kb-files').innerHTML=files.map((file,i)=>`<li class="kb-file-row">${icon('report')}<div><strong>${esc(file.name)}</strong><span>${(file.size/1024/1024).toFixed(1)} MB · ${esc(file.type||'형식 확인 필요')}${file.mock?' · 가상 파일':''}</span></div>${button(icon('close'),'remove-file',`data-index="${i}" aria-label="${esc(file.name)} 제거"`)}</li>`).join('');
  }
  function status(root,text) {
    const out=root.querySelector('.kb-local-status') || root.closest('.dialog')?.querySelector('[role="status"]') || document.getElementById('kb-feedback') || document.getElementById('ps-live');
    if(out) out.textContent=text;
  }
  function drawChart(root) {
    for(const canvas of root.querySelectorAll('[data-kb-chart]')) {
      const section=canvas.closest('.kb-chart-section');
      const metric=Number(section.dataset.metric||0), year=section.querySelector('[data-kb-chart-year]').value;
      const values=(metric?[3.6,4.0,3.1,4.5,3.8,3.4]:[2.2,2.5,1.9,2.8,2.3,2.1]).map(v=>year==='2024'?v*.9:v);
      const labels=['01월','03월','05월','07월','09월','11월'];
      section.querySelector('[data-kb-chart-table]').innerHTML=table(['측정일','T-N mg/L','TOC mg/L'],labels.map((name,i)=>[year+'-'+name.replace('월','')+'-15',((year==='2024'?.9:1)*[2.2,2.5,1.9,2.8,2.3,2.1][i]).toFixed(2),((year==='2024'?.9:1)*[3.6,4,3.1,4.5,3.8,3.4][i]).toFixed(2)]),'수질 측정값 · 가상 수치');
      const width=Math.max(220,canvas.getBoundingClientRect().width),height=220,dpr=window.devicePixelRatio||1;
      canvas.width=width*dpr;canvas.height=height*dpr;const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);
      const css=getComputedStyle(canvas), color=name=>css.getPropertyValue(name).trim();
      const x=i=>44+i*(width-64)/5,y=v=>180-v/5*156;
      ctx.font='12px Pretendard, sans-serif';ctx.textAlign='right';
      for(let i=0;i<=5;i++){ctx.strokeStyle=color('--dm-border-default');ctx.beginPath();ctx.moveTo(44,y(i));ctx.lineTo(width-20,y(i));ctx.stroke();ctx.fillStyle=color('--dm-text-secondary');ctx.fillText(String(i),34,y(i)+4);}
      ctx.textAlign='center';labels.forEach((label,i)=>{ctx.fillStyle=color('--dm-text-secondary');ctx.fillText(label,x(i),205);});
      ctx.strokeStyle=color('--dm-chart-series-1');ctx.lineWidth=2;ctx.beginPath();values.forEach((value,i)=>i?ctx.lineTo(x(i),y(value)):ctx.moveTo(x(i),y(value)));ctx.stroke();
      values.forEach((value,i)=>{ctx.beginPath();ctx.fillStyle=color('--dm-chart-series-1');ctx.arc(x(i),y(value),4,0,Math.PI*2);ctx.fill();});
      canvas.setAttribute('aria-label',`${year}년 ${metric?'TOC':'T-N'} 가상 수질 추이. 정확한 수치는 아래 표에 있습니다.`);
    }
  }
  function mount(root) {
    drawChart(root);
    if(bound.has(root)) return;
    bound.add(root);
    root.addEventListener('dragover',event=>{const zone=event.target.closest('.kb-dropzone');if(zone){event.preventDefault();zone.dataset.dragging='true';}});
    root.addEventListener('dragleave',event=>{const zone=event.target.closest('.kb-dropzone');if(zone&&!zone.contains(event.relatedTarget))delete zone.dataset.dragging;});
    root.addEventListener('drop',event=>{const zone=event.target.closest('.kb-dropzone');if(!zone)return;event.preventDefault();delete zone.dataset.dragging;const box=zone.closest('[data-kb-upload]');renderFiles(box,[...(uploads.get(box)||[]).filter(file=>!file.mock),...event.dataTransfer.files]);zone.querySelector('input').value='';});
    root.addEventListener('change',event=>{
      const el=event.target;
      if(el.matches('[data-kb-upload] input[type="file"]')) renderFiles(el.closest('[data-kb-upload]'),[...(uploads.get(el.closest('[data-kb-upload]'))||[]).filter(file=>!file.mock),...el.files]);
      if(el.matches('[data-kb-param]')) {
        const row=el.closest('[data-kb-row]');row.querySelector('.kb-weight').hidden=!el.checked;
        if(!el.checked) {
          const range=row.querySelector('input[type="range"]');
          row.querySelector('[data-kb-action="parameter-auto"]').setAttribute('aria-pressed','false');
          range.disabled=false;range.value='0.1';range.setAttribute('aria-valuetext','0.1');
          row.querySelector('output').textContent='0.1';
        }
        weightTotal(el.closest('[data-kb-parameters]'));
      }
      if(el.matches('[data-kb-preset]')) {const editor=el.closest('[data-kb-parameters]'),manual=presets[el.value];editor.querySelectorAll('[data-kb-row]').forEach(row=>{const checked=!!manual,auto=checked&&!manual.includes(Number(row.dataset.kbRow));row.querySelector('[data-kb-param]').checked=checked;row.querySelector('.kb-weight').hidden=!checked;row.querySelector('input[type="range"]').value='0.1';row.querySelector('input[type="range"]').disabled=auto;row.querySelector('input[type="range"]').setAttribute('aria-valuetext',auto?'자동 분배 · 수치 미정':'0.1');row.querySelector('output').textContent=auto?'자동':'0.1';row.querySelector('[data-kb-action="parameter-auto"]').setAttribute('aria-pressed',String(auto));});weightTotal(editor);}
      if(el.matches('[data-kb-chart-year]')) drawChart(root);
      if(el.matches('[data-kb-comparison-sort]')) el.closest('[data-kb-comparison]').querySelector('[data-kb-comparison-table]').innerHTML=comparisonTable(el.value);
      if(el.matches('[data-kb-legend]')) el.closest('.dialog-section').querySelector('[data-kb-legend-content]').innerHTML=legend(el.value);
    });
    root.addEventListener('input',event=>{if(event.target.matches('.kb-range')){event.target.setAttribute('aria-valuetext',Number(event.target.value).toFixed(1));event.target.parentElement.querySelector('output').textContent=Number(event.target.value).toFixed(1);weightTotal(event.target.closest('[data-kb-parameters]'));}});
    root.addEventListener('click',event=>{
      const el=event.target.closest('[data-kb-action]');if(!el||!root.contains(el))return;
      const action=el.dataset.kbAction;
      if(['sample-files','sample-error','remove-file'].includes(action)) {
        const box=el.closest('[data-kb-upload]');let files=uploads.get(box)||[];
        if(action==='sample-files') files=[{name:'검토_영상_01.jpg',type:'image/jpeg',size:12582912,mock:true},{name:'검토_영상_02.mp4',type:'video/mp4',size:84934656,mock:true}];
        if(action==='sample-error') files=[{name:'검토_자료.csv',type:'text/csv',size:4096,mock:true}];
        if(action==='remove-file') {files=files.filter((_,i)=>i!==Number(el.dataset.index));box.querySelector('input').value='';}
        renderFiles(box,files);if(action==='remove-file')box.querySelector('input').focus();
      }
      if(action==='parameter-auto') {const range=el.parentElement.querySelector('input'),auto=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(auto));range.disabled=auto;range.setAttribute('aria-valuetext',auto?'자동 분배 · 수치 미정':Number(range.value).toFixed(1));el.parentElement.querySelector('output').textContent=auto?'자동':Number(range.value).toFixed(1);weightTotal(el.closest('[data-kb-parameters]'));}
      if(action==='info-variant') {el.parentElement.querySelectorAll('[data-kb-action]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)));root.querySelector('[data-kb-info]').innerHTML=info(el.dataset.variant);}
      if(action==='map-detail'||action==='map-source') {const active=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(active));el.textContent=(action==='map-detail'?'세부지역 ':'오염원 ')+(active?'닫기':'보기');status(root,'지도 표시 상태 시연입니다. 실제 지도 데이터는 연결하지 않았습니다.');}
      if(action==='chart-metric') {el.parentElement.querySelectorAll('[data-metric]').forEach(x=>x.setAttribute('aria-pressed',String(x===el)));el.closest('.kb-chart-section').dataset.metric=el.dataset.metric;drawChart(root);}
      if(action==='excel') status(root,'다운로드 진입점 시연입니다. 실제 파일은 생성하지 않습니다.');
      if(action.startsWith('image-')) {const viewer=el.closest('[data-kb-viewer]'),art=viewer.querySelector('.kb-image-art');let scale=Number(viewer.dataset.scale||1);if(action==='image-mode'){const detected=el.getAttribute('aria-pressed')!=='true';el.setAttribute('aria-pressed',String(detected));el.textContent=detected?'원본 보기':'탐지 결과 보기';art.querySelector('.kb-detection-box').hidden=!detected;}
        if(action==='image-in')scale=Math.min(3,scale+.25);if(action==='image-out')scale=Math.max(1,scale-.25);if(action==='image-reset'){scale=1;viewer.dataset.panX='0';viewer.dataset.panY='0';}viewer.dataset.scale=scale;viewer.querySelector('output').textContent=Math.round(scale*100)+'%';art.style.transform=`translate(${viewer.dataset.panX||0}px,${viewer.dataset.panY||0}px) scale(${scale})`;}
      if(action==='cancel-task') openCancel(el,root);
    });
    // 가상 영상에서만 이동. 실제 제품 TransformComponent는 유지한다.
    root.addEventListener('pointerdown',event=>{const viewport=event.target.closest('.kb-image-viewport');if(!viewport||Number(viewport.closest('[data-kb-viewer]').dataset.scale||1)<=1)return;const viewer=viewport.closest('[data-kb-viewer]');viewport.setPointerCapture(event.pointerId);viewer.drag={x:event.clientX,y:event.clientY,px:Number(viewer.dataset.panX||0),py:Number(viewer.dataset.panY||0)};});
    root.addEventListener('pointermove',event=>{const viewer=event.target.closest('[data-kb-viewer]');if(!viewer?.drag)return;viewer.dataset.panX=Math.max(-180,Math.min(180,viewer.drag.px+event.clientX-viewer.drag.x));viewer.dataset.panY=Math.max(-120,Math.min(120,viewer.drag.py+event.clientY-viewer.drag.y));viewer.querySelector('.kb-image-art').style.transform=`translate(${viewer.dataset.panX}px,${viewer.dataset.panY}px) scale(${viewer.dataset.scale})`;});
    root.addEventListener('keydown',event=>{if(!event.target.matches('.kb-image-viewport')||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;const viewer=event.target.closest('[data-kb-viewer]');if(Number(viewer.dataset.scale||1)<=1)return;event.preventDefault();viewer.dataset.panX=Math.max(-180,Math.min(180,Number(viewer.dataset.panX||0)+(event.key==='ArrowLeft'?-20:event.key==='ArrowRight'?20:0)));viewer.dataset.panY=Math.max(-120,Math.min(120,Number(viewer.dataset.panY||0)+(event.key==='ArrowUp'?-20:event.key==='ArrowDown'?20:0)));viewer.querySelector('.kb-image-art').style.transform=`translate(${viewer.dataset.panX}px,${viewer.dataset.panY}px) scale(${viewer.dataset.scale})`;});
    const stopDrag=event=>{const viewer=event.target.closest('[data-kb-viewer]');if(viewer)viewer.drag=null;};root.addEventListener('pointerup',stopDrag);root.addEventListener('pointercancel',stopDrag);
  }
  function openCancel(trigger,root) {
    const dialog=document.createElement('dialog');dialog.className='dialog dialog--form kb-cancel';dialog.setAttribute('aria-labelledby','kb-cancel-title');
    const title=esc(trigger.dataset.taskTitle),satellite=trigger.dataset.taskType==='satellite';
    dialog.innerHTML=`<form method="dialog"><header class="hd dialog-heading"><strong class="tt" id="kb-cancel-title">처리를 취소하시겠습니까?</strong><button class="icon-btn dialog-close" value="back" aria-label="창 닫기">${icon('close')}</button></header><div class="bd dialog-stack"><p><strong>${title}</strong></p><p>${satellite?'다운로드와 분석을 중단하고 해당 날짜의 위성데이터·분석 결과를 삭제합니다.':'작업을 중단하고 업로드 원본·중간 결과·분석 결과를 삭제합니다.'}</p><p class="dialog-note">디자인 확인용 가상 작업입니다. 실제 삭제는 실행하지 않습니다.</p></div><footer class="ft"><button class="btn btn--md btn--secondary" value="back" autofocus>돌아가기</button><button class="btn btn--md btn--danger" value="cancel">처리 취소</button></footer></form>`;
    document.body.append(dialog);dialog.addEventListener('close',()=>{if(dialog.returnValue==='cancel')status(root,`${trigger.dataset.taskTitle} 취소 확인 시연. 실제 작업·자료는 변경하지 않았습니다.`);dialog.remove();trigger.focus();},{once:true});dialog.showModal();
  }
  return {titles,content,uploadBox,parameterEditor,info,legend,processing,mount,weightTotal,drawChart};
})();
