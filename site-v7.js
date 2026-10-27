const $=s=>document.querySelector(s);
const inquiryDialog=$('#inquiry-dialog');
const documentDialog=$('#document-dialog');
const catalogDialog=$('#catalog-dialog');
const returnFocus=new Map();
function showDialog(dialog){returnFocus.set(dialog.id,document.activeElement);if(!dialog.open)dialog.showModal();dialog.scrollTop=0}
function closeDialog(dialog){if(dialog?.open)dialog.close()}
for(const dialog of [inquiryDialog,documentDialog,catalogDialog]){
  dialog.addEventListener('close',()=>{const element=returnFocus.get(dialog.id);if(element?.isConnected)element.focus({preventScroll:true})});
  dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close()});
}
function openInquiry(context){const opener=catalogDialog.open?returnFocus.get('catalog-dialog'):document.activeElement;if(catalogDialog.open){returnFocus.delete('catalog-dialog');catalogDialog.close()}closeContactWidget();$('#inquiry-context').textContent=context;$('#inquiry-form').dataset.context=context;$('#inquiry-form').hidden=false;$('#inquiry-result').hidden=true;showDialog(inquiryDialog);returnFocus.set('inquiry-dialog',opener)}
const documentData={
  details:{title:'Сведения об исполнителе',body:'<p>ИП Новикова Юлия Евгеньевна</p><p>ИНН 732603524609<br>ОГРНИП 308732624800016</p><h3>Контакты</h3><p>+7 (925) 944-97-57<br>info@oblsan.ru</p><p class="address">Москва, ул. Летниковская, д. 2 к. 1,<br>офис 175, «Вивальди плаза»</p>',status:'Данные взяты с публичной страницы компании. Перед запуском сайта требуется подтвердить их актуальность и соответствие исполнителю.'},
  contract:{title:'Договор и условия гарантии',body:'<p>Перед началом работ согласуются объект, вид обработки, объём, стоимость, подготовка и порядок приёмки.</p><ul><li>Что входит в стоимость и оплачивается отдельно.</li><li>Условия повторного визита и гарантийного обслуживания.</li><li>Рекомендации после обработки и порядок обращения.</li></ul>',status:'В макете предусмотрено место для действующего образца договора. Срок гарантии нужно подтвердить для каждой услуги: на исходном сайте встречаются разные условия.'},
  products:{title:'Документы на применяемые средства',body:'<p>Для выбранного средства должны быть доступны регистрационные сведения и инструкция по применению.</p><p>Подготовка объекта, ограничения присутствия, возвращение, проветривание и уборка определяются методом и инструкцией конкретного средства.</p>',status:'Документы компании пока не предоставлены. В этой демонстрации не используются вымышленные сертификаты или инструкции.'},
  license:{title:'Лицензия на деятельность',body:'<p>В этом разделе размещаются наименование лицензиата, номер лицензии, выписка и сведения из реестра.</p>',status:'Номер лицензии не подтверждён предоставленными материалами. Для публикации действующего документа нужно получить выписку у компании.'},
  privacy:{title:'Политика обработки персональных данных',body:'<p>В рабочем сайте документ описывает оператора, цели и основания обработки, категории данных, получателей, сроки хранения, меры защиты и порядок обращения.</p><p>Контактный оператор, указанный на действующем сайте: ИП Новикова Юлия Евгеньевна. Для итоговой политики необходимо подтвердить фактическую организацию обработки.</p>',status:'Это демонстрация размещения документа. Окончательный текст должен соответствовать реальным формам, хостингу и обработчикам. Ввод в форме сохраняется после закрытия этого окна.'},
  consent:{title:'Согласие на обработку данных',body:'<p>Для обращения предусматривается отдельное согласие: оператор, цель обратной связи, перечень данных, действия, срок и порядок отзыва.</p><p>Чекбокс согласия не предустановлен. Рекламные рассылки не объединяются с обычным обращением.</p>',status:'В прототипе отправка отключена. Окончательный документ утверждается до подключения сбора данных. Закрытие этого окна вернёт вас к заполненной форме.'},
  cookies:{title:'Приватность в этой концепции',body:'<p>Аналитика и рекламные трекеры не подключены. Шрифты и изображения загружаются из файлов проекта.</p><p>Введённые в демонстрационную форму сведения не отправляются и не записываются в браузерное хранилище. Выбор дизайна сохраняется только по кнопке в панели просмотра.</p>',status:'Настройки рабочего сайта должны описывать фактически используемые технологии и получателей данных.'}
};
function openDocument(key){const data=documentData[key];if(!data)return;$('#document-title').textContent=data.title;$('#document-content').innerHTML=data.body+`<p class="document-status">${data.status}</p>`;showDialog(documentDialog)}
function openContact(){
  $('#document-title').textContent='Связаться со службой';
  $('#document-content').innerHTML='<div class="contact-copy"><span>+7 (925) 944-97-57</span><button data-copy="+7 (925) 944-97-57">Скопировать</button></div><div class="contact-copy"><span>info@oblsan.ru</span><button data-copy="info@oblsan.ru">Скопировать</button></div><p class="address">Ежедневно, 09:00–20:00<br>Москва и Московская область</p><p role="status" id="copy-status"></p>';
  showDialog(documentDialog);
}
document.addEventListener('click',e=>{
  const close=e.target.closest('[data-close]');if(close){closeDialog(document.getElementById(close.dataset.close));return}
  const action=e.target.closest('[data-action]');
  if(action?.dataset.action==='open-catalog'){openCatalog(action.dataset.catalogGroup||'all',action.dataset.catalogContext||'all');return}
  if(action?.dataset.action==='show-prices'){e.preventDefault();const currentGroup=$('#catalog-direction').value;if(catalogDialog.open&&catalogContext==='garden')selectedObject='Участок';else if(catalogDialog.open&&catalogContext==='home'&&!['Квартиры','Дома и коттеджи'].includes(selectedObject))selectedObject='Квартиры';choosePrice(currentGroup!=='all'?currentGroup:action.dataset.priceGroup,action.dataset.priceService);if(catalogDialog.open){returnFocus.delete('catalog-dialog');catalogDialog.close()}closeMenu();$('#prices').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});const heading=$('#prices h2');if(e.detail===0){heading.tabIndex=-1;heading.focus({preventScroll:true})}return}
  if(action?.dataset.action==='open-inquiry')openInquiry(action.dataset.context||'Консультация по обработке');
  if(action?.dataset.action==='open-document')openDocument(action.dataset.document);
  if(action?.dataset.action==='open-contact')openContact();
  const copy=e.target.closest('[data-copy]');if(copy){const value=copy.dataset.copy;navigator.clipboard?.writeText(value).then(()=>{$('#copy-status').textContent='Скопировано.'}).catch(()=>{$('#copy-status').textContent='Выделите и скопируйте: '+value});if(!navigator.clipboard)$('#copy-status').textContent='Выделите и скопируйте: '+value}
  const link=e.target.closest('a[href^="#"]');if(link){const target=document.querySelector(link.getAttribute('href'));if(target){e.preventDefault();closeMenu();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});const heading=target.querySelector('h2,h1');if(heading&&e.detail===0){heading.tabIndex=-1;heading.focus({preventScroll:true})}}}
});
const phone=$('#visitor-phone');
phone.addEventListener('input',()=>{const len=phone.value.replace(/\D/g,'').length;phone.setCustomValidity(phone.value&&!(len>=10&&len<=15)?'Введите номер телефона, от 10 до 15 цифр.':'')});
$('#inquiry-form').addEventListener('submit',e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;e.currentTarget.hidden=true;$('#inquiry-result').hidden=false;inquiryDialog.scrollTop=0});
const menuToggle=$('.menu-toggle');
function closeMenu(){menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Открыть меню');$('.site-header nav').classList.remove('is-open')}
menuToggle.addEventListener('click',()=>{const open=menuToggle.getAttribute('aria-expanded')!=='true';menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('.site-header nav').classList.toggle('is-open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!inquiryDialog.open&&!documentDialog.open)closeMenu()});
const tabs=[...document.querySelectorAll('[data-service-tab]')];
function selectTab(tab,focus=false){for(const t of tabs){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active}if(focus)tab.focus()}
for(const tab of tabs){tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',e=>{const index=tabs.indexOf(tab);let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();selectTab(tabs[next],true)}})}
const accordions=[...document.querySelectorAll('.service-accordion')];
for(const detail of accordions)detail.addEventListener('toggle',()=>{if(detail.open)for(const other of accordions){if(other!==detail)other.open=false}});
const environmentButtons=[...document.querySelectorAll('[data-environment]')];
function selectEnvironment(button){for(const b of environmentButtons)b.setAttribute('aria-pressed',String(b===button));for(const detail of accordions){detail.hidden=button.dataset.environment!=='all'&&!detail.dataset.environments.split(' ').includes(button.dataset.environment);if(detail.hidden)detail.open=false}const first=accordions.find(x=>!x.hidden);if(first&&!accordions.some(x=>x.open&&!x.hidden))first.open=true}
for(const button of environmentButtons)button.addEventListener('click',()=>selectEnvironment(button));
if(environmentButtons.length)selectEnvironment(environmentButtons[0]);

const directionSelect=$('#price-direction');
const serviceSelect=$('#price-service');
const priceOptions=new Map([...serviceSelect.querySelectorAll('optgroup')].map(group=>[group.dataset.priceOptgroup,[...group.children].map(option=>({value:option.value,label:option.textContent}))]));
const tariffServices=[...document.querySelectorAll('[data-tariff-service]')];
let selectedObject='';
function activeTariff(){return tariffServices.find(panel=>panel.dataset.tariffService===serviceSelect.value)}
function updatePriceContext(){
  const serviceName=serviceSelect.selectedOptions[0]?.textContent||'';
  const selectedTab=activeTariff()?.querySelector('[data-price-section][aria-selected="true"]');
  const objectName=selectedTab?.textContent||'Индивидуальный расчёт';
  $('.price-context .action-primary').dataset.context=`${serviceName} · ${objectName}`;
  $('#price-announcement').textContent=`${serviceName}. ${objectName}.`;
}
function selectPriceObject(button,focus=false){
  const panel=button.closest('[data-tariff-service]');
  for(const tab of panel.querySelectorAll('[data-price-section]')){
    const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=!selected;
  }
  selectedObject=button.textContent;if(focus)button.focus();updatePriceContext();
}
function selectPriceService(){
  for(const panel of tariffServices)panel.hidden=panel.dataset.tariffService!==serviceSelect.value;
  const panel=activeTariff();
  const tabs=[...panel.querySelectorAll('[data-price-section]')];
  const tab=tabs.find(t=>t.textContent===selectedObject)||tabs[0];
  if(tab)selectPriceObject(tab);else updatePriceContext();
}
function choosePrice(groupId,serviceId){
  if(!priceOptions.has(groupId))return;
  directionSelect.value=groupId;
  const options=priceOptions.get(groupId);
  serviceSelect.replaceChildren(...options.map(item=>new Option(item.label,item.value)));
  serviceSelect.value=options.some(item=>item.value===serviceId)?serviceId:options[0].value;
  selectPriceService();
}
directionSelect.addEventListener('change',()=>choosePrice(directionSelect.value,serviceSelect.value));
serviceSelect.addEventListener('change',selectPriceService);
for(const button of document.querySelectorAll('[data-price-section]')){
  button.addEventListener('click',()=>selectPriceObject(button));
  button.addEventListener('keydown',e=>{
    const tabs=[...button.parentElement.querySelectorAll('[data-price-section]')];const index=tabs.indexOf(button);let next;
    if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;
    if(next!==undefined){e.preventDefault();selectPriceObject(tabs[next],true)}
  });
}
choosePrice(directionSelect.value,serviceSelect.value);

const catalogSearch=$('#catalog-search');
const catalogDirection=$('#catalog-direction');
const catalogItems=[...document.querySelectorAll('.catalog-results a')];
let catalogContext='all';
function filterCatalog(){
  const term=catalogSearch.value.trim().toLocaleLowerCase('ru').replace(/ё/g,'е');let count=0;
  for(const item of catalogItems){
    const groupMatches=catalogDirection.value==='all'||item.dataset.catalogGroups.split(' ').includes(catalogDirection.value);
    const contextMatches=catalogContext==='all'||item.dataset.catalogContexts.split(' ').includes(catalogContext);
    item.hidden=!groupMatches||!contextMatches||!item.dataset.catalogSearch.includes(term);if(!item.hidden)count++;
  }
  $('#catalog-count').textContent=`Найдено услуг: ${count}`;$('#catalog-empty').hidden=count>0;$('#catalog-context-note').hidden=catalogContext==='all';$('#catalog-context-label').textContent=catalogContext==='garden'?'Услуги для участка':'Услуги для помещения';
}
function openCatalog(group='all',context='all'){
  catalogContext=context;catalogSearch.value='';catalogDirection.value=group;filterCatalog();closeContactWidget();showDialog(catalogDialog);catalogSearch.focus({preventScroll:true});
}
catalogSearch.addEventListener('input',filterCatalog);
$('[data-clear-catalog-context]').addEventListener('click',()=>{catalogContext='all';catalogDirection.value='all';filterCatalog()});
catalogDirection.addEventListener('change',()=>{catalogContext='all';filterCatalog()});
filterCatalog();

const contactWidget=$('.contact-widget');
const contactToggle=$('#contact-toggle');
const contactPanel=$('#contact-panel');
function closeContactWidget(restoreFocus=false){contactPanel.hidden=true;contactToggle.setAttribute('aria-expanded','false');contactToggle.setAttribute('aria-label','Открыть способы связи');contactWidget.classList.remove('is-open');if(restoreFocus)contactToggle.focus({preventScroll:true})}
contactToggle.addEventListener('click',()=>{const open=contactToggle.getAttribute('aria-expanded')!=='true';contactToggle.setAttribute('aria-expanded',String(open));contactToggle.setAttribute('aria-label',open?'Закрыть способы связи':'Открыть способы связи');contactPanel.hidden=!open;contactWidget.classList.toggle('is-open',open)});
document.addEventListener('click',e=>{if(!contactWidget.contains(e.target)&&!contactPanel.hidden)closeContactWidget()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!contactPanel.hidden)closeContactWidget(true)});
$('[data-max-toggle]').addEventListener('click',e=>{const button=e.currentTarget;const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));$('#max-contact-card').hidden=!open});
$('[data-copy-max]').addEventListener('click',async e=>{const value=e.currentTarget.dataset.copyMax;try{if(!navigator.clipboard?.writeText)throw new Error();await navigator.clipboard.writeText(value);$('#max-copy-status').textContent='Номер скопирован.'}catch{$('#max-copy-status').textContent='Номер для копирования: '+value}});

// Navigation utility; treatment request remains the single business goal.
const backTop = document.querySelector('#back-top');
function updateBackTop() { backTop.hidden = window.scrollY < 480; }
window.addEventListener('scroll', updateBackTop, { passive: true });
backTop.addEventListener('click', () => {
  closeContactWidget();
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
updateBackTop();
