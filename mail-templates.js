/* Offline email rendering only. Delivery belongs to the future server handler. */
(function () {
  'use strict';

  const CONTACT = 'mastercip@mail.ru';
  const COLORS = { ink: '#253c33', muted: '#55675e', line: '#cdd6cc', cream: '#f5f6f0', soft: '#edf0e9', accent: '#d8e59a', white: '#ffffff' };
  const clean = value => value === null || value === undefined ? '' : String(value).trim();
  const escape = value => clean(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const valueOrDash = value => clean(value) || 'Не указано';

  function safeURL(value) {
    const source = clean(value);
    if (!source || /[\u0000-\u001f\u007f]/.test(source)) return '';
    try {
      const parsed = new URL(source);
      return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : '';
    } catch (_) { return ''; }
  }

  function linkedURL(value) {
    const source = clean(value);
    const href = safeURL(source);
    if (!source) return 'Не указано';
    return href ? `<a href="${escape(href)}" style="color:${COLORS.ink};text-decoration:underline;overflow-wrap:anywhere;word-break:break-word;">${escape(source)}</a>` : escape(source);
  }

  function field(label, value, isURL) {
    return `<tr><td style="padding:13px 0;border-bottom:1px solid ${COLORS.line};overflow-wrap:anywhere;word-break:break-word;"><p style="margin:0 0 4px;font:12px/1.5 Arial,Helvetica,sans-serif;color:${COLORS.muted};">${escape(label)}</p><p style="margin:0;font:16px/1.55 Arial,Helvetica,sans-serif;color:${COLORS.ink};">${isURL ? linkedURL(value) : escape(valueOrDash(value))}</p></td></tr>`;
  }

  function group(title, rows) {
    return `<tr><td style="padding:26px 24px 0;"><h2 style="margin:0 0 4px;font:600 17px/1.45 Arial,Helvetica,sans-serif;color:${COLORS.ink};">${escape(title)}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;table-layout:fixed;">${rows.join('')}</table></td></tr>`;
  }

  function consentLabel(consent) {
    return consent && consent.accepted === true ? 'Принято' : consent && consent.accepted === false ? 'Не принято' : 'Не указано';
  }

  function consentFields(label, consent) {
    const item = consent || {};
    return [field(label, consentLabel(item)), field('Версия документа', item.version), field('Ссылка на документ', item.url, true)];
  }

  function packageLabel(value) {
    const key = clean(value);
    return key === 'econom' ? 'Эконом' : key === 'premium' ? 'Премиум' : key || 'Не выбрана';
  }

  function projectFields(project) {
    const area = clean(project.area);
    const areaLabel = area && /^\d+(?:[.,]\d+)?$/.test(area) ? area.replace('.', ',') + ' м²' : area;
    return [['Номер проекта', project.id], ['Название проекта', project.originalName || project.name], ['Площадь проекта', areaLabel], ['Этажность проекта', project.floors], ['Выбранная комплектация', packageLabel(project.package)], ['Ссылка на проект', project.url, true]];
  }

  function textField(label, value) { return `${label}: ${valueOrDash(value)}`; }

  function build(data, audience) {
    const source = data && typeof data === 'object' ? data : {};
    const client = source.client || {};
    const consents = source.consents || {};
    const isAdmin = audience !== 'client';
    const project = source.kind === 'callback' && source.project && clean(source.project.id) ? source.project : null;
    const projectId = project ? clean(project.id) : '';
    const selectedPackage = project ? packageLabel(project.package) : '';
    const projectData = project ? projectFields(project) : [];
    const id = clean(source.id);
    const subject = project ? (isAdmin ? `МастерСип · Расчёт проекта ${projectId} · ${selectedPackage}${id ? ' · Заявка № ' + id : ''}` : `МастерСип · Ваш запрос по проекту ${projectId} · ${selectedPackage} получен`) : (isAdmin ? `МастерСип · Новое обращение${id ? ' № ' + id : ''}` : `МастерСип · Ваше обращение${id ? ' № ' + id : ''} получено`);
    const title = project ? (isAdmin ? `Запрос стоимости проекта ${projectId}` : `Ваш запрос по проекту ${projectId} получен`) : (isAdmin ? 'Новое обращение' : 'Ваше обращение получено');
    const intro = isAdmin ? (project ? `Клиент просит рассчитать стоимость проекта ${projectId} в комплектации «${selectedPackage}». Данные проекта и контакты указаны ниже.` : 'Тема обращения и контакты заявителя — всё для первого разговора.') : `${clean(client.name) ? clean(client.name) + ', спасибо' : 'Спасибо'} за обращение в МастерСип. Мы свяжемся с вами в ближайшее время, чтобы обсудить ${project ? `проект ${projectId} в комплектации «${selectedPackage}»` : 'ваш вопрос'}.`;
    const preheader = project ? `Проект ${projectId} · ${selectedPackage}. Запрос расчёта стоимости и контакты заявителя.` : (isAdmin ? 'Тема обращения, контакты и сведения о согласиях.' : 'Мы получили ваше обращение и свяжемся с вами в ближайшее время.');
    const groups = [
      group('Заявка', [field('Номер заявки', source.id), field('Дата и время', source.createdAt), ...(source.topic ? [field('Тема обращения', source.topic)] : [])]),
      ...(project ? [group('Проект и комплектация', projectData.map(([label, value, isURL]) => field(label, value, isURL)))] : []),
      group(isAdmin ? 'Контакты заявителя' : 'Ваши контакты', [field('Имя', client.name), field('Телефон', client.phone), field('Электронная почта', client.email)])
    ];
    if (isAdmin) {
      groups.push(group('Согласия', [
        ...consentFields('Политика конфиденциальности', consents.privacy),
        ...consentFields('Согласие на обработку персональных данных', consents.personal),
        field('Время фиксации заявки и сведений о согласиях', source.createdAt)
      ]));
      groups.push(group('Источник обращения', [field('Страница формы', source.origin, true)]));
    }

    const footer = isAdmin ? (project ? 'Свяжитесь с заявителем, чтобы обсудить выбранный проект и подготовить расчёт стоимости.' : 'Письмо содержит сведения из обращения. Свяжитесь с заявителем, чтобы обсудить его вопрос.') : `Если хотите дополнить обращение, напишите нам: <a href="mailto:${CONTACT}" style="color:${COLORS.ink};text-decoration:underline;overflow-wrap:anywhere;">${CONTACT}</a>.`;
    const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.cream};color:${COLORS.ink};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${COLORS.cream};border-collapse:collapse;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;table-layout:fixed;background:${COLORS.white};border:1px solid ${COLORS.line};border-radius:6px;">
<tr><td style="padding:26px 24px;background:${COLORS.ink};border-radius:5px 5px 0 0;"><p style="margin:0 0 5px;font:700 28px/1.2 Arial,Helvetica,sans-serif;letter-spacing:-1px;color:${COLORS.white};">МастерСип</p><p style="margin:0;font:11px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1.7px;color:${COLORS.accent};">СТРОИТЕЛЬСТВО СИП-ДОМОВ</p></td></tr>
<tr><td style="padding:28px 24px 4px;"><p style="margin:0 0 12px;font:12px/1.5 Arial,Helvetica,sans-serif;letter-spacing:1px;color:${COLORS.muted};">${isAdmin ? 'ОБРАЩЕНИЕ С САЙТА' : 'СПАСИБО ЗА ДОВЕРИЕ'}</p><h1 style="margin:0 0 18px;font:400 31px/1.18 Georgia,'Times New Roman',serif;color:${COLORS.ink};overflow-wrap:anywhere;">${escape(title)}</h1><p style="margin:0;font:16px/1.65 Arial,Helvetica,sans-serif;color:${COLORS.ink};overflow-wrap:anywhere;word-break:break-word;">${escape(intro)}</p></td></tr>
${groups.join('\n')}
<tr><td style="padding:28px 24px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;background:${COLORS.soft};border-radius:6px;"><tr><td style="padding:18px;font:14px/1.65 Arial,Helvetica,sans-serif;color:${COLORS.ink};overflow-wrap:anywhere;word-break:break-word;">${footer}</td></tr></table></td></tr>
<tr><td style="padding:0 24px 24px;font:12px/1.65 Arial,Helvetica,sans-serif;color:${COLORS.muted};">МастерСип · Дома для вашей жизни<br><a href="mailto:${CONTACT}" style="color:${COLORS.muted};text-decoration:none;overflow-wrap:anywhere;">${CONTACT}</a></td></tr>
</table></td></tr></table></body></html>`;

    const text = [
      'МастерСип · Строительство СИП-домов', '', title, intro, '',
      textField('Номер заявки', source.id), textField('Дата и время', source.createdAt), ...(source.topic ? [textField('Тема обращения', source.topic)] : []), '',
      ...(project ? ['ПРОЕКТ И КОМПЛЕКТАЦИЯ', ...projectData.map(([label, value]) => textField(label, value)), ''] : []),
      'КОНТАКТЫ', textField('Имя', client.name), textField('Телефон', client.phone), textField('Электронная почта', client.email), '',
      ...(isAdmin ? ['', 'СОГЛАСИЯ', textField('Политика конфиденциальности', consentLabel(consents.privacy)), textField('Версия документа', consents.privacy && consents.privacy.version), textField('Ссылка на документ', consents.privacy && consents.privacy.url), textField('Согласие на обработку персональных данных', consentLabel(consents.personal)), textField('Версия документа', consents.personal && consents.personal.version), textField('Ссылка на документ', consents.personal && consents.personal.url), textField('Время фиксации заявки и сведений о согласиях', source.createdAt), '', textField('Страница формы', source.origin)] : []),
      '', isAdmin ? (project ? 'Свяжитесь с заявителем, чтобы обсудить выбранный проект и подготовить расчёт стоимости.' : 'Свяжитесь с заявителем, чтобы обсудить его вопрос.') : `Если хотите дополнить обращение, напишите нам: ${CONTACT}.`, '', `МастерСип · ${CONTACT}`
    ].join('\n');
    return { subject: subject.replace(/[\r\n]/g, ' '), html, text };
  }

  window.MASTER_MAIL = Object.freeze({ build });
})();
