/* Separate document dialog preserves the underlying quiz, input values and checkbox state. */
window.addEventListener('DOMContentLoaded',()=>{
 if(document.body.classList.contains('preview-shell'))return;
 const modal=document.createElement('dialog');modal.id='document-dialog';modal.className='document-modal';modal.setAttribute('aria-labelledby','document-title');modal.innerHTML='<button type="button" class="document-close" aria-label="Закрыть документ"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button><div class="document-content"></div>';document.body.append(modal);let focusBefore;
 const content=modal.querySelector('.document-content');
 function open(html){if(!modal.open)focusBefore=document.activeElement;content.innerHTML=html;let heading=content.querySelector('h1,h2');if(heading){heading.id='document-title';if(heading.tagName==='H1'){const h=document.createElement('h2');h.innerHTML=heading.innerHTML;h.id='document-title';h.className='document-title';heading.replaceWith(h);heading=h}heading.tabIndex=-1}modal.scrollTop=0;if(!modal.open)modal.showModal();document.body.classList.add('no-scroll');heading?.focus({preventScroll:true})}
 function close(){modal.close()}
 modal.querySelector('.document-close').addEventListener('click',close);
 modal.addEventListener('close',()=>{if(!document.getElementById('dialog').open)document.body.classList.remove('no-scroll');focusBefore?.focus()});
 modal.addEventListener('click',e=>{if(e.target!==modal)return;const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()});
 window.documentModal={open,close,document:(key,anchor='')=>{if(key==='cookies'){key='privacy';anchor='cookie-details'}if(!legalBody[key])return;open(`<article class="document-reading">${legalBody[key]}</article>`);if(anchor==='cookie-details'){const section=content.querySelector('#cookie-details');if(section){section.tabIndex=-1;section.focus({preventScroll:true});section.scrollIntoView({block:'start'})}}},isOpen:()=>modal.open};
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=new URL(a.href,location.href);if(u.origin!==baseURL.origin)return;const key=u.pathname.slice(baseURL.pathname.length).replace(/\/$/,'');if(!['privacy','consent','cookies','requisites'].includes(key))return;e.preventDefault();e.stopImmediatePropagation();window.documentModal.document(key,u.hash.slice(1))},true);
});

/* Source scans are loaded only after an explicit document-open action. */
window.addEventListener('DOMContentLoaded',()=>{
 if(document.body.classList.contains('preview-shell'))return;
 let activeCertificate=null,certificatePage=0;
 function showCertificate(){
  const d=activeCertificate;if(!d||!window.documentModal)return;
  const src=siteURL('assets/documents/'+d.files[certificatePage]);
  window.documentModal.open(`<div class="certificate-reader"><p class="certificate-status">${d.status}</p><h2 class="document-title">${d.title}</h2><p class="certificate-reader-note">${d.note}</p><div class="certificate-reader-tools">${d.files.length>1?`<div class="certificate-pages" role="group" aria-label="Страницы документа">${d.files.map((_,i)=>`<button type="button" data-certificate-page="${i}" aria-label="Страница ${i+1}" aria-pressed="${i===certificatePage}">${i+1}</button>`).join('')}</div>`:''}<a class="text-link" href="${src}" target="_blank" rel="noopener">Открыть оригинал в новом окне ${actionArrow()}</a></div><img class="certificate-scan" src="${src}" alt="${d.type}: ${d.title}, страница ${certificatePage+1} из ${d.files.length}" decoding="async"></div>`);
 }
 document.addEventListener('click',e=>{
  const open=e.target.closest('[data-certificate]');
  if(open){activeCertificate=CERTIFICATES.find(d=>d.id===open.dataset.certificate);certificatePage=0;showCertificate();return}
  const page=e.target.closest('[data-certificate-page]');
  if(page&&activeCertificate){certificatePage=Number(page.dataset.certificatePage);showCertificate()}
 });
});
