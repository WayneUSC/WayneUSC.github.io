(function(){
  'use strict';
  var S=window.SITE,lang=new URLSearchParams(location.search).get('lang')==='zh'?'zh':'en';
  function t(x){return typeof x==='string'?x:x[lang]||x.en;}
  function tr(en,zh){return lang==='zh'?zh:en;}
  function e(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function render(){
    document.documentElement.lang=lang;
    document.getElementById('homeLink').textContent=tr('← Homepage','← 返回主页');
    document.getElementById('printProfile').textContent=tr('Print / Save PDF','打印 / 保存为 PDF');
    document.getElementById('profileLanguage').textContent=tr('中文','English');
    function timeline(items){return items.map(function(i){return '<div class="row"><span class="date">'+t(i.when)+'</span><div><strong>'+t(i.what)+'</strong><br><span class="meta">'+t(i.where)+'</span></div></div>';}).join('');}
    var papers=S.publications.filter(function(p){return p.selected;}).sort(function(a,b){return a.venueShort==='HRI 2026'?-1:b.venueShort==='HRI 2026'?1:0;});
    document.getElementById('profile').innerHTML='<p class="label">'+tr('Research profile','研究概览')+'</p><h1>Wen Chen <span>陈稳 · Wayne</span></h1><p class="role">'+t(S.profile.role)+'</p><p class="contact">'+tr('Academic','学术联系')+': <a href="mailto:'+e(S.profile.info.email)+'">'+e(S.profile.info.email)+'</a><br>Kaiwu Robotics: <a href="mailto:'+e(S.profile.info.companyEmail)+'">'+e(S.profile.info.companyEmail)+'</a><br><a href="https://wayneusc.github.io/">wayneusc.github.io</a><br><a href="'+S.profile.links[0].url+'">Google Scholar</a> · <a href="https://github.com/WayneUSC">GitHub</a> · '+tr('Beijing, China','中国 · 北京')+'</p><h2>'+tr('Research interests','研究兴趣')+'</h2><p>'+t(S.design.lead)+'</p><p>'+t(S.design.background)+'</p><h2>'+tr('Selected research','代表性研究')+'</h2>'+['poirot','shakesort','lumie','bionic-haptics'].map(function(id){var p=S.projects.find(function(p){return p.id===id;});return '<div class="project"><strong>'+t(p.title)+'</strong> <span class="meta">— '+t(p.displayFlag||p.flag)+'</span><p>'+t(p.summary)+'</p></div>';}).join('')+'<h2>'+tr('Selected publications','代表性论文')+'</h2>'+papers.map(function(p){var primary=p.links[0].url;if(!/^https?:/.test(primary))primary='https://wayneusc.github.io/'+primary;return '<article class="paper"><div class="title">'+t(p.title)+'</div><p class="authors">'+e(p.authors).replace(/Wen Chen/g,'<b>Wen Chen</b>')+'</p><p class="venue">'+t(p.venue)+'</p><a href="'+e(primary)+'">'+e(primary)+'</a></article>';}).join('')+'<h2>'+t(S.ui.workTitle)+'</h2>'+timeline(S.experience.work)+'<h2>'+t(S.ui.eduTitle)+'</h2>'+timeline(S.experience.education)+'<div class="footer">'+tr('Research profile · September 2026 · Full project and publication lists: ','研究概览 · 2026 年 9 月 · 完整项目与论文列表：')+'<a href="https://wayneusc.github.io/">wayneusc.github.io</a></div>';
  }
  document.getElementById('printProfile').addEventListener('click',function(){window.print();});
  document.getElementById('profileLanguage').addEventListener('click',function(){lang=lang==='en'?'zh':'en';history.replaceState(null,'','?lang='+lang);render();});
  render();
})();
