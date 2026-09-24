/* A local, click-to-load reading of supplied TEP retrospective traces. */
(function () {
  'use strict';

  var active = null;
  var cachedData = null;
  var N = 960, ONSET = 160;
  var FAULTS = [
    [0, 'Normal operation', '正常工况'],
    [3, 'D-feed temperature · step', 'D 进料温度 · 阶跃'],
    [5, 'Condenser cooling-water temperature · step', '冷凝器冷却水温度 · 阶跃'],
    [9, 'D-feed temperature · random variation', 'D 进料温度 · 随机波动'],
    [13, 'Reaction kinetics · slow drift', '反应动力学 · 缓慢漂移'],
    [14, 'Reactor cooling-water valve · sticking', '反应器冷却水阀门 · 粘滞']
  ];
  var PLOTS = [
    { key: 'Tc2', title: 'T²c', en: 'Shared process–quality variation', zh: '过程与质量的共享变化', color: '#2f6d58', group: 'quality' },
    { key: 'Ty2', title: 'T²y', en: 'Quality variation outside the shared subspace', zh: '共享子空间以外的质量变化', color: '#2f6d58', group: 'quality' },
    { key: 'Tx2', title: 'T²x', en: 'Process variation outside the shared subspace', zh: '共享子空间以外的过程变化', color: '#986f2b', group: 'process' },
    { key: 'Qx', title: 'Qx', en: 'Process residual · may still matter for quality', zh: '过程残差 · 仍可能与质量有关', color: '#986f2b', group: 'process' },
    { key: 'T2', title: 'PCA T²', en: 'Process baseline · principal-component space', zh: '过程基线 · 主元空间', color: '#646e7b', group: 'baseline' },
    { key: 'SPE', title: 'PCA SPE', en: 'Process baseline · residual space', zh: '过程基线 · 残差空间', color: '#646e7b', group: 'baseline' }
  ];

  function node(tag, className, content) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  }

  function preserveStyle(element, names) {
    return names.map(function (name) {
      return [name, element.style.getPropertyValue(name), element.style.getPropertyPriority(name)];
    });
  }

  function restoreStyle(element, properties) {
    properties.forEach(function (property) {
      if (property[1]) element.style.setProperty(property[0], property[1], property[2]);
      else element.style.removeProperty(property[0]);
    });
  }

  function lockPage() {
    var body = document.body, html = document.documentElement;
    var scroll = { x: window.scrollX, y: window.scrollY };
    var savedBody = preserveStyle(body, ['position', 'top', 'left', 'width', 'overflow', 'padding-right']);
    var savedHtml = preserveStyle(html, ['overflow', 'scroll-behavior']);
    var gap = Math.max(0, window.innerWidth - html.clientWidth);
    var padding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.position = 'fixed';
    body.style.top = -scroll.y + 'px';
    body.style.left = -scroll.x + 'px';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    if (gap) body.style.paddingRight = padding + gap + 'px';
    html.style.overflow = 'hidden';
    return function () {
      restoreStyle(body, savedBody);
      restoreStyle(html, savedHtml);
      html.style.setProperty('scroll-behavior', 'auto', 'important');
      window.scrollTo(scroll.x, scroll.y);
      restoreStyle(html, savedHtml);
    };
  }

  function cleanup(state, restoreFocus) {
    if (!state || state.cleaned) return;
    state.cleaned = true;
    state.playing = false;
    if (state.raf) window.cancelAnimationFrame(state.raf);
    if (state.resizeRaf) window.cancelAnimationFrame(state.resizeRaf);
    if (state.controller) state.controller.abort();
    if (state.observer) state.observer.disconnect();
    state.listeners.forEach(function (listener) {
      listener[0].removeEventListener(listener[1], listener[2]);
    });
    state.dialog.remove();
    if (state.unlock) state.unlock();
    if (active === state) active = null;
    if (restoreFocus && state.opener && state.opener.isConnected && typeof state.opener.focus === 'function') {
      state.opener.focus({ preventScroll: true });
    }
  }

  function close(restoreFocus) {
    var state = active;
    if (!state) return;
    if (state.dialog.open) state.dialog.close();
    cleanup(state, restoreFocus !== false);
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.settings) || data.settings.length !== 3 || !data.pca) throw new Error('Invalid trace archive.');
    function series(values) {
      return Array.isArray(values) && values.length === N && values.every(function (value) { return Number.isFinite(value) && Number.isInteger(value); });
    }
    data.settings.forEach(function (setting, index) {
      if (setting.kx !== [0, .1, 1][index] || !setting.faults) throw new Error('Invalid model settings.');
      FAULTS.forEach(function (fault) {
        var entry = setting.faults[fault[0]];
        if (!entry || !entry.s || !['Tc2', 'Ty2', 'Tx2', 'Qx'].every(function (key) { return series(entry.s[key]); })) throw new Error('Incomplete model traces.');
      });
    });
    FAULTS.forEach(function (fault) {
      var entry = data.pca[fault[0]];
      if (!entry || !entry.s || !series(entry.s.T2) || !series(entry.s.SPE)) throw new Error('Incomplete baseline traces.');
    });
    return data;
  }

  function open(lang, opener) {
    var returnFocus = opener || (active ? active.opener : document.activeElement);
    close(false);
    var chinese = lang === 'zh';
    var text = function (en, zh) { return chinese ? zh : en; };
    var dialog = node('dialog', 'tep-monitor-dialog');
    dialog.lang = chinese ? 'zh' : 'en';
    dialog.setAttribute('aria-labelledby', 'tepMonitorTitle');
    dialog.setAttribute('aria-describedby', 'tepMonitorDescription');
    var state = {
      dialog: dialog, opener: returnFocus, listeners: [], cleaned: false,
      controller: null, observer: null, unlock: null, data: null, series: null,
      fault: 14, kappa: 0, time: N - 1, playing: false, raf: 0, resizeRaf: 0,
      last: 0, domain: [-4, 2], canvases: [], totals: null
    };
    function listen(element, name, handler) {
      element.addEventListener(name, handler);
      state.listeners.push([element, name, handler]);
    }

    var shell = node('div', 'tep-shell');
    var header = node('header', 'tep-header');
    var heading = node('div', 'tep-heading');
    heading.appendChild(node('p', 'tep-kicker', text('RESEARCH ARCHIVE / USC · CHE 599', '研究档案 / USC · CHE 599')));
    var title = node('h2', '', text('When a process changes, does quality change too?', '过程变了，质量也一定变了吗？'));
    title.id = 'tepMonitorTitle';
    heading.appendChild(title);
    var description = node('p', 'tep-intro', text(
      'Explore how model choices change the evidence in the Tennessee Eastman Process benchmark.',
      '在 Tennessee Eastman Process 基准中，观察模型选择如何改变监测证据。'
    ));
    description.id = 'tepMonitorDescription';
    heading.appendChild(description);
    var closeButton = node('button', 'tep-close', '×');
    closeButton.type = 'button';
    closeButton.autofocus = true;
    closeButton.setAttribute('aria-label', text('Close interactive monitor', '关闭交互监测器'));
    header.appendChild(heading);
    header.appendChild(closeButton);
    shell.appendChild(header);

    var body = node('div', 'tep-body');
    var history = node('div', 'tep-history');
    history.appendChild(node('span', '', text('2017 · USC course project', '2017 · USC 课程项目')));
    history.appendChild(node('span', '', text('2026 · Interactive retrospective', '2026 · 交互式回顾')));
    body.appendChild(history);

    var loading = node('div', 'tep-loading');
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    var loadingText = node('p', '', text('Loading the archived traces…', '正在加载回顾数据…'));
    var retry = node('button', 'tep-button', text('Try again', '重试'));
    retry.type = 'button';
    retry.hidden = true;
    loading.appendChild(loadingText);
    loading.appendChild(retry);
    body.appendChild(loading);

    var workspace = node('div', 'tep-workspace');
    workspace.hidden = true;
    var controls = node('div', 'tep-controls');
    var faultField = node('div', 'tep-fault-field');
    var faultLabel = node('label', 'tep-label', text('DISTURBANCE', '扰动场景'));
    faultLabel.htmlFor = 'tepFaultSelect';
    var faultSelect = node('select');
    faultSelect.id = 'tepFaultSelect';
    FAULTS.forEach(function (fault) {
      var option = node('option', '', (fault[0] ? 'IDV(' + fault[0] + ') · ' : '') + fault[chinese ? 2 : 1]);
      option.value = String(fault[0]);
      faultSelect.appendChild(option);
    });
    faultSelect.value = String(state.fault);
    faultField.appendChild(faultLabel);
    faultField.appendChild(faultSelect);
    controls.appendChild(faultField);
    var kappaField = node('fieldset', 'tep-kappa-field');
    kappaField.appendChild(node('legend', 'tep-label', text('RIDGE REGULARIZATION', '岭正则强度')));
    var kappaButtons = node('div', 'tep-segments');
    var settingButtons = [0, .1, 1].map(function (value, index) {
      var button = node('button', '', 'κ = ' + value);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(index === 0));
      listen(button, 'click', function () {
        if (!state.data) return;
        pause();
        state.kappa = index;
        updateSeries();
      });
      kappaButtons.appendChild(button);
      return button;
    });
    kappaField.appendChild(kappaButtons);
    controls.appendChild(kappaField);
    workspace.appendChild(controls);
    var modelNote = node('p', 'tep-model-note');
    workspace.appendChild(modelNote);

    var summary = node('div', 'tep-summary');
    function summaryCard(kind, label, definition) {
      var card = node('div', 'tep-summary-card tep-summary-' + kind);
      var head = node('div', 'tep-summary-head');
      head.appendChild(node('h3', '', label));
      var value = node('strong', 'tep-rate', '—');
      head.appendChild(value);
      card.appendChild(head);
      card.appendChild(node('p', 'tep-rate-definition', definition));
      var comparison = node('p', 'tep-rate-comparison');
      card.appendChild(comparison);
      summary.appendChild(card);
      return { value: value, comparison: comparison };
    }
    var qualitySummary = summaryCard('quality', text('Quality-linked flags', '质量关联标记'), text('T²c or T²y exceeds its control limit', 'T²c 或 T²y 超过各自控制限'));
    var processSummary = summaryCard('process', text('Process / residual flags', '过程 / 残差标记'), text('T²x or Qx exceeds its control limit', 'T²x 或 Qx 超过各自控制限'));
    workspace.appendChild(summary);
    workspace.appendChild(node('p', 'tep-summary-note', text(
      'Approximate share above a limit after the 8 h split, up to the displayed time; not classification accuracy. Process residuals can still be quality-relevant.',
      '约为 8 小时分界之后、截至当前显示时刻的超限比例，不是分类准确率。过程残差仍可能与质量有关。'
    )));

    var playback = node('div', 'tep-playback');
    var play = node('button', 'tep-button tep-play', text('Play', '播放'));
    play.type = 'button';
    play.setAttribute('aria-pressed', 'false');
    var time = node('output', 'tep-time', '48.0 / 48 h');
    time.htmlFor = 'tepTimeRange';
    var range = node('input', 'tep-scrubber');
    range.id = 'tepTimeRange';
    range.type = 'range';
    range.min = '0';
    range.max = String(N - 1);
    range.step = '1';
    range.value = String(N - 1);
    range.setAttribute('aria-label', text('Elapsed time in the 48-hour trace', '48 小时轨迹的显示时刻'));
    playback.appendChild(play);
    playback.appendChild(range);
    playback.appendChild(time);
    workspace.appendChild(playback);

    var legend = node('div', 'tep-plot-legend');
    legend.appendChild(node('span', 'tep-legend-limit', text('1× control limit', '1 倍控制限')));
    var onsetLegend = node('span', 'tep-legend-onset');
    legend.appendChild(onsetLegend);
    legend.appendChild(node('span', 'tep-legend-scale', text('Statistic / limit · logarithmic scale', '统计量 / 控制限 · 对数坐标')));
    workspace.appendChild(legend);

    var plots = node('div', 'tep-plots');
    PLOTS.forEach(function (plot) {
      var card = node('figure', 'tep-plot tep-plot-' + plot.group);
      var caption = node('figcaption');
      var label = node('div', 'tep-plot-label');
      label.appendChild(node('h3', '', plot.title));
      label.appendChild(node('p', '', plot[chinese ? 'zh' : 'en']));
      caption.appendChild(label);
      var currentValue = node('span', 'tep-current-value');
      caption.appendChild(currentValue);
      card.appendChild(caption);
      var canvas = node('canvas', 'tep-chart');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', plot.title + text(' monitoring trace, normalized by its control limit', ' 监测轨迹，按控制限归一化'));
      canvas.textContent = text('Use the flag summaries above for a textual account of these traces.', '可通过上方超限比例摘要了解这些轨迹。');
      card.appendChild(canvas);
      plots.appendChild(card);
      state.canvases.push({ canvas: canvas, plot: plot, value: currentValue });
    });
    workspace.appendChild(plots);
    var interpretation = node('p', 'tep-interpretation', text(
      'Read the contrast: PCA monitors the process without separating its relation to quality. CCA/CCCA partitions the modeled variation; changing κ changes that partition. A threshold crossing is model-based evidence, not proof of causality or of an unaffected product.',
      '对照阅读：PCA 监测过程整体，并不区分它与质量的关联；CCA/CCCA 对模型中的变化作进一步分解，κ 会改变这种分解。超限是模型下的证据，不能据此证明因果关系，也不能证明产品质量未受影响。'
    ));
    workspace.appendChild(interpretation);
    body.appendChild(workspace);

    var methods = node('details', 'tep-methods');
    methods.appendChild(node('summary', '', text('Methods, provenance & interpretation', '方法、来源与解读边界')));
    var methodsCopy = node('div', 'tep-methods-copy');
    methodsCopy.appendChild(node('p', '', text(
      'Historical work · Wen Chen and Shanshan Cui jointly handled CCA/CCCA in the 2017 USC CHE 599 course project, advised by S. Joe Qin. The five disturbance cases here, IDV(3), (5), (9), (13) and (14), were assigned in that project; normal operation is included as a reference.',
      '历史工作 · Wen Chen 与 Shanshan Cui 在 S. Joe Qin 指导的 2017 年 USC CHE 599 课程项目中共同负责 CCA/CCCA。此处的 IDV(3)、(5)、(9)、(13)、(14) 是当年分配的五类扰动，另加入正常工况作对照。'
    )));
    methodsCopy.appendChild(node('p', '', text(
      'This interactive view · The curves are supplied, precomputed 2026 retrospective results, not the original 2017 reported rates or an independent validation. Methods follow Zhu, Liu and Qin (2016), using 33 process variables and 5 quality variables. No model is fitted in your browser. κ = 0 uses no ridge regularization; 0.1 and 1 increase it. The PCA baseline is unchanged across κ.',
      '当前交互展示 · 曲线来自所提供的 2026 年回顾性预计算结果，不是 2017 年原报告中的检出率，也不构成独立验证。方法依据 Zhu、Liu 和 Qin（2016），使用 33 个过程变量与 5 个质量变量。浏览器中不重新训练模型。κ = 0 不加岭正则，0.1 与 1 逐级加强；PCA 基线不随 κ 改变。'
    )));
    methodsCopy.appendChild(node('p', '', text(
      'How to read the numbers · Each of 960 samples represents 3 minutes; disturbances begin at zero-based sample index 160 (8 h). Stored integer values encode 100 × log₁₀(statistic / limit). The displayed union flags count values strictly above 0 in that quantized representation, so their rounded percentages are approximate, particularly near the limit. Qx residuals may include quality-relevant information.',
      '数值解读 · 共 960 个样本，每个间隔 3 分钟；扰动从第 160 个索引处（8 小时）开始。整数数据编码为 100 × log₁₀（统计量 / 控制限）。联合超限标记统计量化后严格大于 0 的值，因此取整后的比例是近似值，阈值附近尤其如此。Qx 残差中仍可能包含与质量有关的信息。'
    )));
    var sources = node('div', 'tep-sources');
    var paperLink = node('a', '', text('CCCA method · Zhu, Liu & Qin (2016)', 'CCCA 方法 · Zhu、Liu 与 Qin（2016）'));
    paperLink.href = 'https://doi.org/10.1016/j.ifacol.2016.07.340';
    paperLink.target = '_blank';
    paperLink.rel = 'noopener noreferrer';
    var reportLink = node('a', '', text('2017 course report (PDF)', '2017 年课程报告（PDF）'));
    reportLink.href = 'assets/pdf/tep-che599-group7-2017.pdf';
    reportLink.target = '_blank';
    reportLink.rel = 'noopener noreferrer';
    sources.appendChild(paperLink);
    sources.appendChild(reportLink);
    sources.appendChild(node('p', '', text(
      'The PDF is the historical submission; this retrospective uses different model settings.',
      'PDF 为当年的课程提交稿；本次回顾采用了不同的模型设置。'
    )));
    methods.appendChild(methodsCopy);
    methods.appendChild(sources);
    body.appendChild(methods);
    shell.appendChild(body);
    dialog.appendChild(shell);

    function pause() {
      state.playing = false;
      if (state.raf) window.cancelAnimationFrame(state.raf);
      state.raf = 0;
      play.textContent = text('Play', '播放');
      play.setAttribute('aria-pressed', 'false');
    }

    function updateSeries() {
      if (state.cleaned || !state.data) return;
      var setting = state.data.settings[state.kappa];
      var current = setting.faults[state.fault].s;
      var baseline = state.data.pca[state.fault].s;
      state.series = { Tc2: current.Tc2, Ty2: current.Ty2, Tx2: current.Tx2, Qx: current.Qx, T2: baseline.T2, SPE: baseline.SPE };
      var low = -100, high = 100;
      function include(values) {
        values.forEach(function (value) { low = Math.min(low, value); high = Math.max(high, value); });
      }
      state.data.settings.forEach(function (candidate) {
        var series = candidate.faults[state.fault].s;
        ['Tc2', 'Ty2', 'Tx2', 'Qx'].forEach(function (key) { include(series[key]); });
      });
      include(baseline.T2);
      include(baseline.SPE);
      // Hold one common log axis across all six panels AND all three κ settings.
      // The unchanged PCA baseline must not appear to move when κ changes.
      state.domain = [Math.floor(low / 100), Math.ceil(high / 100)];
      var q = new Uint16Array(N + 1), p = new Uint16Array(N + 1);
      for (var i = 0; i < N; i++) {
        q[i + 1] = q[i] + (current.Tc2[i] > 0 || current.Ty2[i] > 0 ? 1 : 0);
        p[i + 1] = p[i] + (current.Tx2[i] > 0 || current.Qx[i] > 0 ? 1 : 0);
      }
      state.totals = { q: q, p: p };
      settingButtons.forEach(function (button, index) { button.setAttribute('aria-pressed', String(index === state.kappa)); });
      modelNote.textContent = text(
        'κ = ' + setting.kx + (state.kappa === 0 ? ' · No ridge penalty. ' : ' · Ridge-regularized comparison. ') + 'Same disturbance, different model assumptions.',
        'κ = ' + setting.kx + (state.kappa === 0 ? ' · 不加岭正则。' : ' · 岭正则对照。') + '同一扰动，不同模型假设。'
      );
      onsetLegend.textContent = state.fault === 0 ? text('8 h reference split · no disturbance', '8 小时分界 · 无扰动') : text('Disturbance begins · 8 h', '扰动开始 · 8 小时');
      render();
    }

    function percentage(count, total) { return total ? '≈ ' + Math.round(count / total * 100) + '%' : '—'; }

    function updateSummary(card, prefix) {
      var end = Math.floor(state.time) + 1;
      var beforeEnd = Math.min(end, ONSET);
      var afterCount = Math.max(0, end - ONSET);
      var pre = percentage(prefix[beforeEnd], beforeEnd);
      var post = percentage(afterCount ? prefix[end] - prefix[ONSET] : 0, afterCount);
      card.value.textContent = post;
      card.comparison.textContent = state.fault === 0
        ? text('0–8 h: ' + pre + ' · After 8 h: ' + post, '0–8 小时：' + pre + ' · 8 小时后：' + post)
        : text('Before onset: ' + pre + ' · After onset: ' + post, '扰动前：' + pre + ' · 扰动后：' + post);
    }

    function ratioLabel(encoded) {
      var ratio = Math.pow(10, encoded / 100);
      return (ratio >= 1000 || ratio < .01 ? ratio.toExponential(1) : ratio.toFixed(ratio >= 10 ? 1 : 2)) + '×';
    }

    function drawChart(entry) {
      var canvas = entry.canvas;
      var rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      var pad = { left: 47, right: 13, top: 12, bottom: 25 };
      var w = Math.max(1, rect.width - pad.left - pad.right), h = Math.max(1, rect.height - pad.top - pad.bottom);
      var domain = state.domain;
      var X = function (index) { return pad.left + index / (N - 1) * w; };
      var Y = function (log) { return pad.top + (domain[1] - log) / (domain[1] - domain[0]) * h; };
      var onset = X(ONSET), last = Math.floor(state.time), edge = X(last);
      ctx.fillStyle = '#f0f2ef';
      ctx.fillRect(pad.left, pad.top, onset - pad.left, h);
      ctx.font = '12px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';
      var step = Math.max(1, Math.ceil((domain[1] - domain[0]) / 5));
      for (var exponent = domain[0]; exponent <= domain[1]; exponent += step) {
        var yy = Y(exponent);
        ctx.strokeStyle = '#e6e8e5';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pad.left, yy); ctx.lineTo(pad.left + w, yy); ctx.stroke();
        ctx.fillStyle = '#626d63';
        ctx.fillText(exponent === 0 ? '1×' : '10^' + exponent, pad.left - 7, yy);
      }
      [0, 8, 24, 48].forEach(function (hour) {
        var xx = pad.left + hour / 48 * w;
        ctx.fillStyle = '#626d63';
        ctx.textAlign = hour === 0 ? 'left' : hour === 48 ? 'right' : 'center';
        ctx.fillText(hour + (hour === 48 ? ' h' : ''), xx, rect.height - 9);
      });
      ctx.strokeStyle = '#aab1aa';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(onset, pad.top); ctx.lineTo(onset, pad.top + h); ctx.stroke();
      ctx.strokeStyle = '#8b6c51';
      ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(pad.left, Y(0)); ctx.lineTo(pad.left + w, Y(0)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.beginPath(); ctx.rect(pad.left, pad.top - 1, w, h + 2); ctx.clip();
      var values = state.series[entry.plot.key];
      ctx.strokeStyle = entry.plot.color;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (var i = 0; i <= last; i++) {
        var xx = X(i), yy = Y(values[i] / 100);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      if (last < N - 1) {
        ctx.strokeStyle = '#26382c'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(edge, pad.top); ctx.lineTo(edge, pad.top + h); ctx.stroke();
      }
      ctx.fillStyle = entry.plot.color;
      ctx.beginPath(); ctx.arc(edge, Y(values[last] / 100), 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      entry.value.textContent = ratioLabel(values[last]);
      canvas.setAttribute('aria-label', entry.plot.title + text(' at ', '，时刻 ') + (last / 20).toFixed(1) + ' h: ' + ratioLabel(values[last]) + text(' of its control limit.', ' 控制限。'));
    }

    function render() {
      if (state.cleaned || !state.series) return;
      var index = Math.floor(state.time);
      range.value = String(index);
      var hour = (index / 20).toFixed(1);
      time.textContent = hour + ' / 48 h';
      range.setAttribute('aria-valuetext', text(hour + ' hours of 48 hours', '48 小时中的第 ' + hour + ' 小时'));
      updateSummary(qualitySummary, state.totals.q);
      updateSummary(processSummary, state.totals.p);
      state.canvases.forEach(drawChart);
    }

    function frame(now) {
      if (state.cleaned || !state.playing) return;
      var previousIndex = Math.floor(state.time);
      var dt = Math.min((now - state.last) / 1000, .12);
      state.last = now;
      state.time = Math.min(N - 1, state.time + dt * 40);
      if (Math.floor(state.time) !== previousIndex) render();
      if (state.time >= N - 1) { pause(); return; }
      state.raf = window.requestAnimationFrame(frame);
    }

    function loadData() {
      if (state.cleaned) return;
      retry.hidden = true;
      loadingText.textContent = text('Loading the archived traces…', '正在加载回顾数据…');
      loading.hidden = false;
      function ready(data) {
        if (state.cleaned || active !== state) return;
        state.data = data;
        loading.hidden = true;
        workspace.hidden = false;
        updateSeries();
      }
      if (cachedData) { ready(cachedData); return; }
      if (state.controller) state.controller.abort();
      state.controller = new AbortController();
      fetch('assets/data/tep-monitor.json', { signal: state.controller.signal, credentials: 'same-origin' })
        .then(function (response) { if (!response.ok) throw new Error('Trace archive unavailable.'); return response.json(); })
        .then(validateData)
        .then(function (data) {
          if (state.cleaned || active !== state) return;
          cachedData = data;
          ready(data);
        })
        .catch(function (error) {
          if (state.cleaned || active !== state || error.name === 'AbortError') return;
          loadingText.textContent = text('The trace archive could not be loaded. Please try again.', '暂时无法加载轨迹数据，请重试。');
          retry.hidden = false;
        });
    }

    listen(closeButton, 'click', function () { close(); });
    listen(dialog, 'cancel', function (event) { event.preventDefault(); close(); });
    listen(dialog, 'close', function () { cleanup(state, true); });
    listen(dialog, 'click', function (event) {
      if (event.target !== dialog) return;
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
    listen(faultSelect, 'change', function () { pause(); state.fault = Number(faultSelect.value); updateSeries(); });
    listen(range, 'input', function () { pause(); state.time = Number(range.value); render(); });
    listen(play, 'click', function () {
      if (!state.data) return;
      if (state.playing) { pause(); return; }
      if (state.time >= N - 1) state.time = 0;
      state.playing = true;
      state.last = performance.now();
      play.textContent = text('Pause', '暂停');
      play.setAttribute('aria-pressed', 'true');
      render();
      state.raf = window.requestAnimationFrame(frame);
    });
    listen(retry, 'click', loadData);
    listen(document, 'visibilitychange', function () { if (document.hidden) pause(); });
    listen(window, 'beforeprint', function () { close(); });
    function resized() {
      if (state.cleaned || state.resizeRaf) return;
      state.resizeRaf = window.requestAnimationFrame(function () { state.resizeRaf = 0; render(); });
    }
    if (typeof ResizeObserver === 'function') {
      state.observer = new ResizeObserver(resized);
      state.observer.observe(plots);
    } else listen(window, 'resize', resized);

    active = state;
    document.body.appendChild(dialog);
    state.unlock = lockPage();
    try { dialog.showModal(); } catch (error) { cleanup(state, true); return false; }
    loadData();
    return true;
  }

  window.TepMonitor = { open: open, close: function () { close(); } };
})();
