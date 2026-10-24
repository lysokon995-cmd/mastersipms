/* Review devices resize an actual iframe, preserving the current page and form state. */
(()=>{
 const channel='mastersip-preview-v2',params=new URLSearchParams(location.search);
 const valid=v=>['desktop','tablet','phone'].includes(v)?v:'desktop';
 let device=valid(params.get('device'));
 const applyDevice=(u,d)=>{if(d==='desktop')u.searchParams.delete('device');else u.searchParams.set('device',d);return u};
 if(params.get('preview')==='1'||(window.matchMedia('(max-width:600px)').matches&&!params.has('device'))){
  document.body.classList.add('preview-content');window.conceptApp=startConceptApp();
  if(['#faq','#foundation','#sip-comfort','#sip-benefits'].includes(location.hash))requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
  const state=()=>parent.postMessage({channel,type:'state',path:location.pathname,hash:location.hash,label:pageTitle(pageKey)},location.origin);
  window.addEventListener('hashchange',state);
  window.addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||e.data?.channel!==channel)return;if(e.data.type==='device'){device=valid(e.data.device);history.replaceState(null,'',applyDevice(new URL(location),device))}});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||!u.pathname.startsWith(baseURL.pathname))return;applyDevice(u,device);u.searchParams.delete('v');u.searchParams.delete('preview');if(a.target==='_blank'||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey){a.href=u.href;return}if(a.getAttribute('href').startsWith('#'))return;e.preventDefault();u.searchParams.set('preview','1');location.assign(u)});
  state();return;
 }
 document.body.classList.add('preview-shell');
 const bar=document.createElement('div');bar.className='review-bar';document.body.prepend(bar);bar.innerHTML=withActionIcons(`<div class="preview-brand"><span>МАСТЕРСИП</span><span id="concept-label">${pageTitle(pageKey)}</span></div><div class="device-switch" role="group" aria-label="Размер экрана">${[['desktop','Компьютер','M3 3h18v13H3zM8 21h8m-4-5v5'],['tablet','Планшет','M4 2h16v20H4zM11 18h2'],['phone','Телефон','M6 2h12v20H6zM11 18h2']].map(([d,t,p])=>`<button type="button" data-device="${d}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg><span>${t}</span></button>`).join('')}</div><div class="preview-tools"><output id="viewport-size" aria-label="Размер окна сайта"></output></div>`);
 const stage=document.getElementById('stage');stage.innerHTML='<div class="preview-workspace"><div class="preview-bounds"><iframe class="preview-frame" title="МастерСип — содержимое сайта"></iframe></div></div>';
 const workspace=stage.querySelector('.preview-workspace'),bounds=stage.querySelector('.preview-bounds'),frame=stage.querySelector('iframe');
 function fit(){const s=getComputedStyle(workspace),w=workspace.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),h=workspace.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);const width=device==='phone'?390:device==='tablet'?820:Math.max(280,w),scale=Math.min(1,w/width),height=Math.max(200,Math.floor(h/scale));bounds.style.width=width*scale+'px';bounds.style.height=height*scale+'px';frame.style.width=width+'px';frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;document.getElementById('viewport-size').textContent=`${Math.round(width)} × ${height}`}
 function select(d){device=valid(d);document.body.dataset.device=device;document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.device===device));history.replaceState(null,'',applyDevice(new URL(location),device));fit();frame.contentWindow?.postMessage({channel,type:'device',device},location.origin)}
 document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.device)));
 window.addEventListener('message',e=>{const m=e.data;if(e.source!==frame.contentWindow||e.origin!==location.origin||m?.channel!==channel||m.type!=='state')return;const u=new URL(location);if(typeof m.path!=='string'||!m.path.startsWith(baseURL.pathname))return;u.pathname=m.path;u.hash=m.hash||'';u.searchParams.delete('preview');u.searchParams.delete('v');history.replaceState(null,'',applyDevice(u,device));document.getElementById('concept-label').textContent=m.label;document.title=m.label+' · МастерСип'});
 window.addEventListener('resize',fit);new ResizeObserver(fit).observe(workspace);select(device);const initial=applyDevice(new URL(location),device);initial.searchParams.delete('v');initial.searchParams.set('preview','1');frame.src=initial.href;
})();
