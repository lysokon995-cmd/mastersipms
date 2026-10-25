function contactIcon(kind){
 const paths={chat:'M4 4h16v12H9l-5 4z',phone:'M6 3h3l2 5-2 2c1 3 2 4 5 5l2-2 5 2v3c0 2-2 3-4 3C9 20 4 15 3 7c0-2 1-4 3-4Z',mail:'M3 5h18v14H3z M3 5l9 8 9-8',close:'m6 6 12 12M6 18 18 6'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="${paths[kind]}"/></svg>`;
}
window.addEventListener('DOMContentLoaded',()=>{
 if(document.body.classList.contains('preview-shell'))return;
 const box=document.createElement('aside');
 box.className='contact-widget';
 box.setAttribute('aria-label','Быстрая связь');
 const messengers=[['max','MAX'],['telegram','Telegram'],['whatsapp','WhatsApp']].map(([key,label])=>
  `<a href="${SITE.messengers[key]}" target="_blank" rel="noopener noreferrer"><span class="channel-icon ${key}" aria-hidden="true"><img src="${siteURL('assets/brand/'+key+'.svg')}" alt="" width="37" height="37"></span><span>${label}</span></a>`
 ).join('');
 box.innerHTML=`<div class="contact-panel" id="contact-panel" hidden><strong>Свяжитесь с нами</strong><a href="${SITE.phoneHref}"><span class="channel-icon phone">${contactIcon('phone')}</span><span>${SITE.phone}</span></a>${messengers}<a href="mailto:${SITE.email}"><span class="channel-icon mail">${contactIcon('mail')}</span><span>Электронная почта</span></a></div><button class="contact-launcher" type="button" aria-expanded="false" aria-controls="contact-panel" aria-label="Открыть способы связи">${contactIcon('chat')}</button>`;
 document.body.append(box);
 const btn=box.querySelector('.contact-launcher'),panel=box.querySelector('.contact-panel');
 function set(open){
  panel.hidden=!open;
  btn.setAttribute('aria-expanded',open);
  btn.setAttribute('aria-label',open?'Закрыть способы связи':'Открыть способы связи');
  btn.innerHTML=contactIcon(open?'close':'chat');
 }
 btn.addEventListener('click',e=>{e.stopPropagation();set(panel.hidden)});
 document.addEventListener('click',e=>{if(!box.contains(e.target))set(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){set(false);btn.focus()}});
});
