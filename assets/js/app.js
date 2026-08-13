/* ============================================================
   Renderer + interactions for Wen Chen's homepage.
   Reads window.SITE (content.js) and renders bilingually.
   ============================================================ */
(function () {
  "use strict";
  var S = window.SITE;
  if (!S) { console.error("SITE content missing"); return; }

  // ---------- language state ----------
  var lang = "en";
  try {
    var saved = localStorage.getItem("wc-lang");
    if (saved === "en" || saved === "zh") lang = saved;
    else if ((navigator.language || "").toLowerCase().indexOf("zh") === 0) lang = "zh";
  } catch (e) { /* sandboxed: ignore */ }

  var pubTab = "selected"; // 'selected' | 'all'

  // ---------- helpers ----------
  function t(o) { return o ? (o[lang] != null ? o[lang] : o.en) : ""; }
  function el(id) { return document.getElementById(id); }
  function boldAuthors(str) {
    return str.replace(/Wen Chen/g, "<b>Wen Chen</b>").replace(/陈稳/g, "<b>陈稳</b>");
  }
  function sectionHead(idx, titleObj) {
    return '<div class="section-head"><span class="idx">' + idx +
      '</span><h2>' + t(titleObj) + '</h2></div>';
  }

  // ---------- nav ----------
  function renderNav() {
    var nav = el("topnav");
    nav.innerHTML = S.ui.nav.map(function (n) {
      return '<a href="#' + n.id + '">' + t(n) + '</a>';
    }).join("");
    // close mobile menu on click
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); });
    });
  }

  // ---------- sidebar ----------
  function renderInfo() {
    var p = S.profile, info = p.info;
    var rows = "";
    rows += row(t({ en: "Affil.", zh: "机构" }), t(info.affiliation));
    rows += row(t({ en: "Base", zh: "地点" }), t(info.location));
    rows += row(t({ en: "Email", zh: "邮箱" }), '<a href="mailto:' + info.email + '">' + info.email + '</a>');
    var links = p.links.map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener">' + t(l.label) + '</a>';
    }).join("");
    rows += row(t({ en: "Links", zh: "链接" }), '<span class="info-links">' + links + '</span>');
    el("infoTable").innerHTML = rows;

    function row(ic, html) {
      return '<div class="info-row"><span class="ic">' + ic + '</span><p>' + html + "</p></div>";
    }
  }

  function renderNews() {
    el("newsTitle").textContent = t(S.ui.newsTitle);
    el("newsList").innerHTML = S.news.map(function (n) {
      return '<div class="news-item"><span class="when">' + n.when +
        '</span><span class="what">' + t(n) + "</span></div>";
    }).join("");
  }

  // ---------- intro ----------
  function renderIntro() {
    var p = S.profile, intro = S.intro;
    var aliasHTML = p.alias ? ' <span class="alias">(' + p.alias + ")</span>" : "";
    var html =
      '<p class="eyebrow">' + t(intro.eyebrow) + "</p>" +
      '<h1>' + p.name + ' <span class="zh">' + p.nameZh + "</span>" + aliasHTML + "</h1>" +
      '<p class="role">' + t(p.role) + "</p>" +
      intro.paras.map(function (x) { return "<p" + (x === intro.paras[0] ? ' class="lead"' : "") + ">" + t(x) + "</p>"; }).join("") +
      '<div class="interests">' + intro.interests.map(function (i) {
        return '<span class="chip">' + t(i) + "</span>";
      }).join("") + "</div>";
    el("home").innerHTML = html;
  }

  // ---------- research ----------
  function renderResearch() {
    var r = S.research;
    var pillars = r.pillars.map(function (p, i) {
      var n = ("0" + (i + 1)).slice(-2);
      return '<div class="pillar"><div class="pn">' + n + "</div><h3>" + t(p.title) +
        "</h3><p>" + t(p.desc) + "</p></div>";
    }).join("");
    el("research").innerHTML = sectionHead("01", S.ui.sec.research) +
      '<p style="margin:-4px 0 18px;color:var(--muted);max-width:62ch;">' + t(r.intro) + "</p>" +
      '<div class="pillars">' + pillars + "</div>";
  }

  // ---------- publications ----------
  function renderPublications() {
    var list = S.publications.filter(function (p) {
      return pubTab === "all" ? true : p.selected;
    });
    var papers = list.map(function (p) {
      var titleHTML = t(p.title);
      if (p.links && p.links.length) {
        titleHTML = '<a href="' + p.links[0].url + '" target="_blank" rel="noopener">' + titleHTML + "</a>";
      }
      var pills = '<span class="pill venue">' + p.venueShort + "</span>" +
        '<span class="pill year">' + p.year + "</span>" +
        '<span class="pill tag">' + t(p.tag) + "</span>" +
        p.links.map(function (l) {
          return '<a class="pill link" href="' + l.url + '" target="_blank" rel="noopener">' + t(l.label) + " ↗</a>";
        }).join("");
      return '<article class="paper">' +
        '<div class="paper-thumb"><img loading="lazy" src="' + p.img + '" alt=""></div>' +
        '<div class="paper-meta">' +
          "<h4>" + titleHTML + "</h4>" +
          '<p class="authors">' + boldAuthors(p.authors) + "</p>" +
          '<p class="venue-line">' + t(p.venue) + "</p>" +
          '<div class="pills">' + pills + "</div>" +
        "</div></article>";
    }).join("");

    el("publications").innerHTML = sectionHead("02", S.ui.sec.publications) +
      '<div class="pub-tabs">' +
        '<button class="pub-tab' + (pubTab === "selected" ? " active" : "") + '" data-tab="selected">' + t(S.ui.selected) + "</button>" +
        '<button class="pub-tab' + (pubTab === "all" ? " active" : "") + '" data-tab="all">' + t(S.ui.all) + "</button>" +
      "</div>" +
      '<div class="paper-list">' + papers + "</div>";

    Array.prototype.forEach.call(el("publications").querySelectorAll(".pub-tab"), function (b) {
      b.addEventListener("click", function () { pubTab = b.getAttribute("data-tab"); renderPublications(); });
    });
  }

  // ---------- projects ----------
  function renderProjects() {
    var cards = S.projects.map(function (p) {
      var projectLinks = (p.links || []).map(function (l) {
        return '<a class="pill link" href="' + l.url + '" target="_blank" rel="noopener">' + t(l.label) + " ↗</a>";
      }).join("");
      return '<article class="proj-card">' +
        '<div class="proj-media"><span class="flag">' + t(p.flag) + "</span>" +
          '<img loading="lazy" src="' + p.img + '" alt=""></div>' +
        '<div class="proj-body">' +
          '<p class="sub">' + t(p.sub) + "</p>" +
          "<h3>" + t(p.title) + "</h3>" +
          "<p>" + t(p.desc) + "</p>" +
          (projectLinks ? '<div class="pills">' + projectLinks + "</div>" : "") +
          '<div class="tech">' + p.tech.map(function (x) { return "<span>" + x + "</span>"; }).join("") + "</div>" +
        "</div></article>";
    }).join("");
    el("projects").innerHTML = sectionHead("03", S.ui.sec.projects) +
      '<div class="proj-grid">' + cards + "</div>";
  }

  // ---------- experience / education ----------
  function renderExperience() {
    function timeline(items) {
      return '<div class="timeline">' + items.map(function (i) {
        return '<div class="tl-item"><div class="when">' + i.when + "</div>" +
          '<div class="what">' + t(i.what) + "</div>" +
          '<div class="where">' + t(i.where) + "</div></div>";
      }).join("") + "</div>";
    }
    var e = S.experience;
    el("experience").innerHTML = sectionHead("04", S.ui.sec.experience) +
      '<div class="xp-grid">' +
        '<div class="xp-col"><h3>' + t(S.ui.eduTitle) + "</h3>" + timeline(e.education) + "</div>" +
        '<div class="xp-col"><h3>' + t(S.ui.workTitle) + "</h3>" + timeline(e.work) + "</div>" +
      "</div>";
  }

  // ---------- outreach ----------
  function renderOutreach() {
    var o = S.outreach;
    var stats = o.stats.map(function (s) {
      return '<div class="stat"><div class="num">' + t(s.num) + '</div><div class="lab">' + t(s.lab) + "</div></div>";
    }).join("");
    el("outreach").innerHTML = sectionHead("05", S.ui.sec.outreach) +
      '<div class="outreach">' +
        '<div class="ot-body">' +
          '<p class="ot-kicker">' + t(o.kicker) + "</p>" +
          "<h3>" + t(o.title) + "</h3>" +
          '<p class="tagline">' + t(o.tagline) + "</p>" +
          '<div class="stats">' + stats + "</div>" +
          '<p class="topics">' + t(o.topics) + "</p>" +
        "</div>" +
        '<div class="ot-media"><img loading="lazy" src="' + o.img + '" alt=""></div>' +
      "</div>";
  }

  // ---------- awards ----------
  function renderAwards() {
    var items = S.awards.map(function (a) {
      var de = t(a.de);
      return '<div class="award"><span class="ic">' + a.ic + "</span><div>" +
        '<div class="ti">' + t(a.ti) + "</div>" +
        (de ? '<div class="de">' + de + "</div>" : "") +
        "</div></div>";
    }).join("");
    el("awards").innerHTML = sectionHead("06", S.ui.sec.awards) +
      '<div class="awards">' + items + "</div>";
  }

  // ---------- footer ----------
  function renderFooter() {
    var p = S.profile;
    var links = p.links.map(function (l) {
      return '<a href="' + l.url + '" target="_blank" rel="noopener">' + t(l.label) + "</a>";
    }).join("");
    el("footer").innerHTML =
      "<div>© " + new Date().getFullYear() + " " + p.name + " · " + p.nameZh + "</div>" +
      '<div class="f-links">' + links + "</div>" +
      '<div style="flex-basis:100%;color:#9aa4b4;font-size:.8rem;">' + t(S.ui.footnote) + "</div>";
  }

  // ---------- language toggle ----------
  function setLang(next) {
    lang = next;
    document.documentElement.setAttribute("lang", lang);
    try { localStorage.setItem("wc-lang", lang); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll("#langToggle button"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
    renderAll();
  }

  function renderAll() {
    renderNav(); renderInfo(); renderNews(); renderIntro(); renderResearch();
    renderPublications(); renderProjects(); renderExperience(); renderOutreach();
    renderAwards(); renderFooter();
  }

  // ---------- interactions ----------
  function wireChrome() {
    Array.prototype.forEach.call(document.querySelectorAll("#langToggle button"), function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });
    var navToggle = el("navToggle"), topnav = el("topnav");
    if (navToggle) navToggle.addEventListener("click", function () { topnav.classList.toggle("open"); });

    var btt = el("backToTop");
    window.addEventListener("scroll", function () {
      btt.classList.toggle("show", window.scrollY > 460);
    }, { passive: true });
    btt.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  function wireReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(els, function (e) { e.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(els, function (e, i) {
      e.style.transitionDelay = Math.min(i * 70, 350) + "ms";
      io.observe(e);
    });
  }

  // ---------- init ----------
  document.documentElement.setAttribute("lang", lang);
  Array.prototype.forEach.call(document.querySelectorAll("#langToggle button"), function (b) {
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });
  renderAll();
  wireChrome();
  wireReveal();
})();
