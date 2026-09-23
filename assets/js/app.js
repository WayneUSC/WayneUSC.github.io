/* Progressive bilingual portfolio. Content is maintained in content.js. */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) return;
  var habitatController = null, habitatMount = 0;
  var lang = 'en', pubTab = 'selected', projectsOpen = false, newsOpen = false, currentSection = '';
  try { var saved = localStorage.getItem('wc-lang'); if (saved === 'en' || saved === 'zh') lang = saved; else if (/^zh/i.test(navigator.language || '')) lang = 'zh'; } catch (e) {}
  function el(id) { return document.getElementById(id); }
  function t(value) { return typeof value === 'string' ? value : (value ? (value[lang] || value.en || '') : ''); }
  function tr(en, zh) { return lang === 'zh' ? zh : en; }
  function esc(value) { return String(value).replace(/[&<>"']/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function plain(value) { var node = document.createElement('div'); node.innerHTML = value; return node.textContent; }
  function link(url, label, cls) { return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(url) + '"' + (/^https?:/.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>'; }
  function sectionHead(n, title, aside) { return '<div class="section-head"><div class="heading"><span class="idx">' + n + '</span><h2>' + t(title) + '</h2></div>' + (aside ? '<span class="aside">' + aside + '</span>' : '') + '</div>'; }
  function announce(message) { el('statusMessage').textContent = message; }
  function closeMenu() { el('topnav').classList.remove('open'); el('navToggle').setAttribute('aria-expanded', 'false'); }
  function renderNav() {
    el('topnav').innerHTML = S.ui.nav.map(function(n) { return '<a href="#' + n.id + '"' + (currentSection === n.id ? ' aria-current="location"' : '') + '>' + t(n) + '</a>'; }).join('');
    el('navToggle').setAttribute('aria-label', tr('Menu', '导航菜单'));
    el('backToTop').setAttribute('aria-label', tr('Back to top', '返回顶部'));
    el('topnav').querySelectorAll('a').forEach(function(a) { a.addEventListener('click', closeMenu); });
  }
  function renderIntro() {
    var p = S.profile;
    el('home').innerHTML = '<div class="intro-grid"><div class="intro-copy"><p class="eyebrow">' + tr('Tactile sensing / Human–robot interaction', '触觉感知 / 人机交互') + '</p>' +
      '<h1 id="profileName">' + p.name + '<span class="zh">' + p.nameZh + '</span></h1><p class="alias">' + tr('Also known as Wayne', '也可以叫我 Wayne') + '</p>' +
      '<p class="headline">' + t(S.design.headline) + '</p><p class="lead">' + t(S.design.lead) + '</p><p class="role">' + t(p.role) + '</p>' +
      '<div class="hero-actions">' + link('#projects', tr('Explore my work ↗', '探索我的研究 ↗'), 'button primary') + link(p.links[0].url, tr('Google Scholar ↗','谷歌学术 ↗'), 'button') + link('research-profile.html?lang=' + lang, tr('Research profile ↓','研究概览 ↓'), 'button') + '</div></div>' +
      '<figure class="portrait"><img src="assets/img/avatar.jpg" width="310" height="350" fetchpriority="high" alt="' + tr('Portrait of Wen Chen','陈稳的肖像') + '"><figcaption><span>' + tr('Researcher. Engineer. Maker.','研究 · 工程 · 创造') + '</span><span class="location">' + tr('Beijing, China','中国 · 北京') + '</span></figcaption></figure></div>' +
      '<div class="research-ribbon"><span class="label">' + tr('Research interests','研究兴趣') + '</span><p>' + t(S.design.researchNote) + '</p>' + link('#contact', tr('Let’s connect ↗','联系我 ↗'), 'text-link') + '</div>';
  }
  function renderResearch() {
    el('research').innerHTML = sectionHead('01', S.ui.sec.research, tr('Physical signals → human experience','物理信号 → 人的体验')) +
      '<p class="research-question">' + tr('How can robots use physical signals to understand materials and interact adaptively with people?', '机器人如何利用物理信号理解材料，并与人展开自适应交互？') + '</p>' +
      '<div class="pillars">' + S.design.lanes.map(function(p) { return '<article class="pillar"><span class="pn">' + t(p.label) + '</span><h3>' + t(p.title) + '</h3><p>' + t(p.desc) + '</p>' + link('#' + p.target, t(p.evidence) + ' ↗', 'evidence') + '</article>'; }).join('') + '</div>' +
      '<div class="methods"><strong>' + tr('Across the stack','贯穿研究全流程') + '</strong><span>' + tr('Materials & sensors · Robotic systems · Multimodal learning · Controlled human studies', '材料与传感器 · 机器人系统 · 多模态学习 · 受控人因实验') + '</span></div>';
  }
  function projectCard(p, featured, compact) {
    var projectLinks = (p.links || []).map(function(l) { var url = l.url; if (p.id === 'poirot' && url === 'poirot/' && lang === 'en') url = 'poirot/en.html'; return link(url, t(l.label) + ' ↗'); }).join('');
    return '<article class="proj-card' + (featured ? ' featured' : '') + '" id="project-' + p.id + '"><div class="proj-media"><img loading="lazy" src="' + esc(p.img) + '" alt="' + esc(t(p.title)) + '"></div><div class="proj-body"><span class="flag">' + t(p.displayFlag || p.flag) + '</span><h3>' + t(p.title) + '</h3><p class="sub">' + t(p.sub) + '</p><p>' + t(compact && p.summary ? p.summary : p.desc) + '</p>' + (projectLinks ? '<div class="project-links">' + projectLinks + '</div>' : '') + '<div class="tech">' + p.tech.map(function(x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div></article>';
  }
  function renderProjects() {
    var highlighted = ['poirot', 'shakesort', 'lumie'];
    var first = highlighted.map(function(id, i) { return projectCard(S.projects.find(function(p) { return p.id === id; }), i === 0, true); }).join('');
    var rest = S.projects.filter(function(p) { return highlighted.indexOf(p.id) === -1 && p.id !== 'habitat'; });
    el('projects').innerHTML = sectionHead('02', {en:'Selected work',zh:'代表性研究'}, tr('Systems built. Questions explored.','构建系统，探索问题。')) + '<div class="featured-projects">' + first + '</div>' +
      habitatShowcase() +
      '<details class="more-projects"' + (projectsOpen ? ' open' : '') + '><summary>' + tr('More projects & interactive demos', '更多项目与交互演示') + ' <span aria-hidden="true">(' + rest.length + ')</span></summary><div class="proj-grid">' + rest.map(function(p) { return projectCard(p, false, false); }).join('') + '</div></details>';
    el('projects').querySelector('details').addEventListener('toggle', function(e) { projectsOpen = e.target.open; });
    if (habitatController) habitatController.dispose();
    var mount = ++habitatMount, root = el('project-habitat'), locale = lang;
    import('./habitat.js?v=20260922-inline').then(function(module) {
      if (mount === habitatMount && root.isConnected) habitatController = module.mountHabitat(root, locale);
    }).catch(function() {
      if (root.isConnected) root.querySelector('.habitat-load-note').textContent = tr('The 3D viewer could not load. Please refresh to try again.','3D 浏览器未能加载，请刷新重试。');
    });
  }
  function habitatShowcase() {
    var p = S.projects.find(function(p) { return p.id === 'habitat'; });
    return '<article class="habitat-showcase" id="project-habitat" aria-labelledby="habitatTitle">' +
      '<div class="habitat-visual"><canvas class="habitat-preview-canvas" role="img" aria-label="' + tr('Photo-assisted 3D model of SNAIL Lab, showing the living, rest, work and discussion areas.','SNAIL Lab 照片辅助三维模型，展示会客、休息、工作与研讨区域。') + '"></canvas>' +
      '<div class="habitat-visual-top"><span>SNAIL LAB</span><span>' + tr('An interactive spatial model','可交互空间模型') + '</span></div>' +
      '<div class="habitat-visual-bottom"><p>' + tr('A living lab.<br>A closer look.','走进实验室。<br>看见空间里的研究。') + '</p><button class="habitat-play" data-habitat-open="orbit" aria-haspopup="dialog">' + tr('Explore in 3D','探索三维空间') + ' <span aria-hidden="true">↗</span></button></div>' +
      '<p class="habitat-load-note" role="status">' + tr('Preparing the spatial model…','正在准备空间模型…') + '</p></div>' +
      '<div class="habitat-copy proj-body"><div class="habitat-intro"><div><span class="flag">' + tr('Research platform · The Future Laboratory, Tsinghua University','研究平台 · 清华大学未来实验室') + '</span><h3 id="habitatTitle">' + t(p.title) + '</h3></div><p>' + tr('How can a living space help us understand human activity? Explore the spatial context behind a multimodal sensing platform, from everyday living to collaborative research.','居住空间如何帮助我们理解人的活动？从日常起居到协作研究，探索多模态传感平台背后的空间情境。') + '</p></div>' +
      '<div class="habitat-features"><div><span>01</span><h4>' + tr('Spatial context','空间情境') + '</h4><p>' + tr('A photo-assisted model of SNAIL Lab, with distinct living, rest and discussion areas.','照片辅助构建 SNAIL Lab 模型，呈现会客、休息与研讨区域。') + '</p></div><div><span>02</span><h4>' + tr('Explore at your pace','自由探索') + '</h4><p>' + tr('Orbit, inspect objects or walk through the room with WASD and touch controls.','旋转空间、查看物件，或通过 WASD 与触控按钮在室内漫游。') + '</p></div><div><span>03</span><h4>' + tr('Multimodal research','多模态研究') + '</h4><p>' + tr('The platform combines depth, audio, mmWave, IMU, tactile and olfactory sensing with a capacitive floor.','平台融合深度、音频、毫米波、IMU、触觉、嗅觉传感与电容地板。') + '</p></div></div>' +
      '<div class="habitat-actions"><button class="button primary" data-habitat-open="orbit" aria-haspopup="dialog">' + tr('Explore SNAIL Lab','探索 SNAIL Lab') + '</button><button class="button" data-habitat-open="walk" aria-haspopup="dialog">' + tr('Take a walkthrough','开启空间漫游') + '</button><p>' + tr('Photo-assisted model · Approximate geometry<br>No live sensor data in this demonstration','照片辅助模型 · 几何尺寸为近似值<br>本演示不包含实时传感数据') + '</p></div></div></article>';
  }
  function renderPublications(focusTab) {
    var list = S.publications.filter(function(p) { return pubTab === 'all' || p.selected; });
    if (pubTab === 'selected') list.sort(function(a, b) { return (a.venueShort === 'HRI 2026' ? -1 : b.venueShort === 'HRI 2026' ? 1 : 0); });
    var papers = list.map(function(p) {
      var firstAuthor = p.authors.indexOf('Wen Chen,') === 0;
      return '<article class="paper"><div class="paper-thumb"><img loading="lazy" src="' + esc(p.img) + '" alt=""></div><div class="paper-meta"><span class="venue-label">' + esc(p.venueShort) + '</span>' + (firstAuthor ? '<span class="author-label">' + tr('First author','第一作者') + '</span>' : '') + '<h3>' + link(p.links[0].url,t(p.title)) + '</h3><p class="authors">' + esc(p.authors).replace(/Wen Chen/g,'<b>Wen Chen</b>').replace(/陈稳/g,'<b>陈稳</b>') + '</p><p class="venue-line">' + t(p.venue) + '</p><div class="pills">' + p.links.map(function(l) { return link(l.url,t(l.label) + ' ↗','pill link'); }).join('') + '<button class="cite-button" data-paper="' + S.publications.indexOf(p) + '">' + tr('Cite','引用') + '</button></div></div></article>';
    }).join('');
    el('publications').innerHTML = sectionHead('03', S.ui.sec.publications, tr('Selected for research relevance','按研究相关性精选')) + '<div class="pub-tools"><div class="pub-tabs" role="group" aria-label="' + tr('Publication selection','论文筛选') + '">' + ['selected','all'].map(function(tab) { return '<button class="pub-tab' + (pubTab === tab ? ' active' : '') + '" data-tab="' + tab + '" aria-pressed="' + (pubTab === tab) + '">' + t(tab === 'all' ? S.ui.all : S.ui.selected) + '</button>'; }).join('') + '</div>' + link(S.profile.links[0].url,tr('View on Google Scholar ↗','在谷歌学术查看 ↗'),'text-link') + '</div><div class="paper-list">' + papers + '</div><p class="pub-note">' + tr('Full author lists and publication venues are retained.','保留完整作者列表及发表刊物、会议名称。') + '</p>';
    el('publications').querySelectorAll('.pub-tab').forEach(function(button) { button.addEventListener('click',function() { pubTab = button.dataset.tab; renderPublications(true); announce(tr('Showing ' + listCount() + ' publications','显示 ' + listCount() + ' 篇论文')); }); });
    el('publications').querySelectorAll('.cite-button').forEach(function(button) { button.addEventListener('click',function() { showCitation(S.publications[Number(button.dataset.paper)]); }); });
    if (focusTab) el('publications').querySelector('[data-tab="' + pubTab + '"]').focus({preventScroll:true});
  }
  function listCount() { return S.publications.filter(function(p) { return pubTab === 'all' || p.selected; }).length; }
  function showCitation(p) {
    el('citationTitle').textContent = tr('Citation','引用信息');
    var citationURL = new URL(p.links[0].url, 'https://wayneusc.github.io/').href;
    el('citationText').textContent = p.authors.split(' / ')[0].replace(/\*/g,'') + '. ' + p.year + '. ' + plain(p.title.en) + '. ' + plain(p.venue.en) + ' ' + citationURL;
    el('copyCitation').textContent = tr('Copy citation','复制引用');
    el('closeCitation').setAttribute('aria-label',tr('Close','关闭'));
    el('citationDialog').showModal();
  }
  function renderExperience() {
    function timeline(items) { return items.map(function(i) { return '<div class="tl-item"><div class="when">' + t(i.when) + '</div><div><div class="what">' + t(i.what) + '</div><div class="where">' + t(i.where) + '</div></div></div>'; }).join(''); }
    el('experience').innerHTML = sectionHead('04',S.ui.sec.experience) + '<p class="xp-intro">' + t(S.design.background) + '</p><div class="xp-grid"><div class="xp-col"><h3>' + t(S.ui.workTitle) + '</h3>' + timeline(S.experience.work) + '</div><div class="xp-col"><h3>' + t(S.ui.eduTitle) + '</h3>' + timeline(S.experience.education) + '</div></div>';
  }
  function renderNews() {
    function items(news) { return news.map(function(n) { return '<div class="news-item"><time class="when">' + esc(n.when) + '</time><div class="what">' + t(n) + '</div></div>'; }).join(''); }
    el('news').innerHTML = sectionHead('05',S.ui.newsTitle) + items(S.news.slice(0,3)) + '<details class="news-archive"' + (newsOpen ? ' open' : '') + '><summary>' + tr('Earlier updates','过往动态') + '</summary>' + items(S.news.slice(3)) + '</details>';
    el('news').querySelector('details').addEventListener('toggle',function(e) { newsOpen = e.target.open; });
  }
  function renderOutreach() {
    var o = S.outreach;
    el('outreach').innerHTML = sectionHead('06', {en:'Beyond the lab',zh:'实验室之外'}) + '<div class="outreach"><div class="ot-body"><p class="ot-kicker">' + t(o.kicker) + '</p><h3>' + t(o.title) + '</h3><p class="tagline">' + t(o.tagline) + '</p><p class="topics">' + t(o.topics) + '</p>' + link(S.profile.links[3].url,tr('Explore the channel ↗','访问我的频道 ↗'),'text-link') + '</div><div class="ot-media"><img loading="lazy" src="' + o.img + '" alt="' + esc(t(o.title)) + '"></div></div>';
  }
  function renderAwards() {
    el('awards').innerHTML = sectionHead('07',S.ui.sec.awards) + '<div class="awards">' + S.awards.map(function(a) { return '<div class="award"><div class="ti">' + t(a.ti) + '</div><div class="de">' + t(a.de) + '</div></div>'; }).join('') + '</div>';
  }
  function renderContact() {
    el('contact').innerHTML = '<div><h2>' + t(S.design.contact) + '</h2><p>' + t(S.design.contactText) + '</p></div><div class="contact-actions">' + link('mailto:' + S.profile.info.email,tr('Get in touch ↗','邮件联系 ↗'),'button') + '<a class="text-link" href="mailto:' + S.profile.info.email + '">' + S.profile.info.email + '</a><button class="button" id="copyEmail">' + tr('Copy email','复制邮箱') + '</button></div>';
    el('copyEmail').addEventListener('click',function() { copyText(S.profile.info.email,el('copyEmail')); });
  }
  function renderFooter() { el('footer').innerHTML = '<span>© ' + new Date().getFullYear() + ' Wen Chen · 陈稳</span><div class="f-links">' + S.profile.links.map(function(l) { return link(l.url,t(l.label)); }).join('') + '</div><span>' + tr('Beijing, China · English / 中文','中国 · 北京 · English / 中文') + '</span>'; }
  function renderAll() { renderNav();renderIntro();renderResearch();renderProjects();renderPublications();renderExperience();renderNews();renderOutreach();renderAwards();renderContact();renderFooter(); }
  function setLang(next) { lang = next; document.documentElement.lang = lang; try { localStorage.setItem('wc-lang',lang); } catch(e) {} document.querySelectorAll('#langToggle button').forEach(function(b) { var active = b.dataset.lang === lang; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); }); renderAll(); }
  async function copyText(text,button) { try { await navigator.clipboard.writeText(text); button.textContent = tr('Copied ✓','已复制 ✓'); announce(tr('Copied to clipboard','已复制到剪贴板')); } catch(e) { button.textContent = tr('Select and copy the text','请选中文字复制'); announce(tr('Clipboard unavailable. Select the displayed text to copy it.','剪贴板不可用，请选中显示的文字手动复制。')); } }
  document.querySelectorAll('#langToggle button').forEach(function(b) { b.addEventListener('click',function() { setLang(b.dataset.lang); }); });
  el('navToggle').addEventListener('click',function() { var open = el('topnav').classList.toggle('open'); el('navToggle').setAttribute('aria-expanded',String(open)); if(open) el('topnav').querySelector('a').focus(); });
  document.addEventListener('keydown',function(e) { if(e.key === 'Escape' && el('topnav').classList.contains('open')) { closeMenu();el('navToggle').focus(); } });
  el('backToTop').addEventListener('click',function() { el('home').focus({preventScroll:true}); window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); });
  window.addEventListener('scroll',function() { el('backToTop').classList.toggle('show',window.scrollY > 600); },{passive:true});
  el('closeCitation').addEventListener('click',function() { el('citationDialog').close(); });
  el('copyCitation').addEventListener('click',function() { copyText(el('citationText').textContent,el('copyCitation')); });
  setLang(lang);
  if ('IntersectionObserver' in window) { var observer = new IntersectionObserver(function(entries) { entries.forEach(function(entry) { if(entry.isIntersecting) { currentSection = entry.target.id; el('topnav').querySelectorAll('a').forEach(function(a) { if(a.hash === '#' + currentSection) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); } }); },{rootMargin:'-15% 0px -60% 0px',threshold:0}); S.ui.nav.forEach(function(n) { observer.observe(el(n.id)); }); }
  // Native hash navigation also works for anchors inside the project archive.
  function revealHash() { var target = document.getElementById(location.hash.slice(1)); if(target) { var details = target.closest('details'); if(details) details.open = true; target.scrollIntoView(); } }
  if(location.hash) requestAnimationFrame(revealHash);
  window.addEventListener('hashchange',revealHash);
})();
