const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
let variant=['1','2','3','4'].includes(params.get('variant'))?params.get('variant'):'1';
let device=['desktop','tablet','phone'].includes(params.get('device'))?params.get('device'):(innerWidth<=620?'phone':'desktop');
const names=["Выездная служба", "Забота о доме", "Точный подход", "Ясный сервис"];
function fit(){
  const available=device==='desktop'?innerWidth:innerWidth<=620?innerWidth:innerWidth-32;
  const width=device==='phone'?Math.min(390,available):device==='tablet'?820:innerWidth<=760?1280:available;
  const scale=Math.min(1,available/width);
  const height=Math.max(240,innerHeight-$('#stage').getBoundingClientRect().top);
  $('#stage').style.height=height+'px';$('#stage').dataset.currentDevice=device;
  $('#frame').style.width=width+'px';$('#frame').style.height=height/scale+'px';$('#frame').style.transform=`scale(${scale})`;
}
function update(changePage){
  document.querySelectorAll('[data-variant]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.variant===variant)));
  document.querySelectorAll('[data-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.device===device)));
  if(changePage){$('#preview').src=`concept-${variant}.html?revision=${variant==='4'?'8':'7.2'}`;$('#preview').title=`Главная страница · концепция 0${variant}`}
  const url=new URL(location);url.searchParams.set('variant',variant);url.searchParams.set('device',device);history.replaceState(null,'',url);fit();
}
document.querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.variant!==variant){variant=b.dataset.variant;update(true)}}));
document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>{device=b.dataset.device;update(false)}));
window.addEventListener('resize',fit);update(variant!=='1');
const selectionDialog=$('#selection-dialog');
selectionDialog.addEventListener('close',()=>$('#choose').focus({preventScroll:true}));
selectionDialog.addEventListener('click',e=>{if(e.target!==selectionDialog)return;const r=selectionDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)selectionDialog.close()});
$('[data-selection-close]').addEventListener('click',()=>selectionDialog.close());
$('#choose').addEventListener('click',()=>{$('#selection-title').textContent=`0${variant} · ${names[Number(variant)-1]}`;$('#share-url').value=location.href;$('#selection-status').textContent='';selectionDialog.showModal()});
$('#share-url').addEventListener('click',e=>e.target.select());
$('#save-choice').addEventListener('click',()=>{try{localStorage.setItem('oblsan-design-choice',JSON.stringify({variant,device,revision:7}));$('#selection-status').textContent='Выбор сохранён в этом браузере.'}catch{$('#selection-status').textContent='Скопируйте ссылку: хранилище браузера недоступно.'}});
$('#copy-link').addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText($('#share-url').value);$('#selection-status').textContent='Ссылка скопирована.'}catch{$('#share-url').select();$('#selection-status').textContent='Ссылка выделена. Скопируйте её вручную.'}});
document.addEventListener('keydown',e=>{if(selectionDialog.open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(['1','2','3','4'].includes(e.key)){variant=e.key;update(true)}});
