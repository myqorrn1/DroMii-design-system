/* 세 제품 지도 도구의 공통 HTML 렌더링·툴팁. API·지도 엔진 연결 없는 검토안. */
window.DromiiMapToolsPreview = (() => {
  const icon = name => `<svg class="dm-map-tool-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#dm-map-${name}"/></svg>`;
  const button = (label,glyph,attrs='',pressed=null) => `<button type="button" class="dm-map-tool" aria-label="${label}" data-map-tooltip="${label}" ${attrs}${pressed===null?'':` aria-pressed="${pressed}"`}>${icon(glyph)}</button>`;
  const basemaps = (items,current,attribute) => items.map(([value,glyph,caption]) => `<button type="button" ${attribute}="${value}" aria-label="${value}" data-map-tooltip="${value}" aria-pressed="${value===current}">${icon(glyph)}<span>${caption}</span></button>`).join('');
  let tipAnchor,tipHovered,tipFocused,tipOver=false,tipDismissed,tipTimer;
  const toolAnchor = node => node instanceof Element?node.closest('.dm-map-tool, [data-map-tooltip], body[data-brand="k-aquas"] #ps-rail .ps-rail-item'):null;
  function hideMenuTooltip() {
    clearTimeout(tipTimer);tipAnchor?.removeAttribute('aria-describedby');tipAnchor=null;tipHovered=null;tipFocused=null;tipOver=false;tipDismissed=null;
    const tip=document.getElementById('ps-tool-tooltip');tip.hidden=true;tip.classList.remove('is-visible');
  }
  function syncMenuTooltip() {
    clearTimeout(tipTimer);
    const button=tipHovered||tipFocused;
    const tip=document.getElementById('ps-tool-tooltip');
    if(!button||button===tipDismissed||!button.isConnected) {
      tipAnchor?.removeAttribute('aria-describedby');tipAnchor=null;tip.hidden=true;tip.classList.remove('is-visible');return;
    }
    if(tipAnchor!==button)tipAnchor?.removeAttribute('aria-describedby');tipAnchor=button;
    tip.textContent=button.dataset.mapTooltip||button.getAttribute('aria-label');tip.hidden=false;tip.classList.add('is-visible');button.setAttribute('aria-describedby',tip.id);
    const rect=button.getBoundingClientRect();
    const leftSide=!!button.closest('.ka-map-controls,.dm-map-basemaps,.ps-map-tools,.ps-map-navigation');tip.dataset.side=leftSide?'left':'right';
    tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,leftSide?rect.left-tip.offsetWidth-8:rect.right+8))+'px';tip.style.top=Math.max(8,Math.min(innerHeight-tip.offsetHeight-8,rect.top+(rect.height-tip.offsetHeight)/2))+'px';
  }
  function initMenuTooltip() {
    const tip=document.getElementById('ps-tool-tooltip');
    document.addEventListener('pointerover',e=>{const b=toolAnchor(e.target);if(!b||b.contains(e.relatedTarget))return;tipHovered=b;tipDismissed=null;syncMenuTooltip();});
    document.addEventListener('pointerout',e=>{const b=toolAnchor(e.target);if(!b||b.contains(e.relatedTarget))return;tipHovered=null;tipTimer=setTimeout(()=>{if(!tipOver)syncMenuTooltip();},160);});
    document.addEventListener('focusin',e=>{const b=toolAnchor(e.target);if(b){tipFocused=b;tipDismissed=null;syncMenuTooltip();}});
    document.addEventListener('focusout',e=>{if(toolAnchor(e.target)){tipFocused=null;tipTimer=setTimeout(()=>{if(!tipOver)syncMenuTooltip();},160);}});
    tip.addEventListener('pointerenter',()=>{tipOver=true;clearTimeout(tipTimer);});
    tip.addEventListener('pointerleave',()=>{tipOver=false;syncMenuTooltip();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!tip.hidden){tipDismissed=tipAnchor;syncMenuTooltip();e.preventDefault();}});
    window.addEventListener('resize',()=>{if(tipAnchor)syncMenuTooltip();});
    document.addEventListener('scroll',hideMenuTooltip,true);
  }
  return {icon,button,basemaps,init:initMenuTooltip,hideTooltip:hideMenuTooltip};
})();
