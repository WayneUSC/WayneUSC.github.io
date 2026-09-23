/* Click-to-load project films. No media is requested before ProjectVideo.open(). */
(function () {
  'use strict';

  var active = null;

  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function preserveStyle(element, names) {
    return names.map(function (name) {
      return [name, element.style.getPropertyValue(name), element.style.getPropertyPriority(name)];
    });
  }

  function restoreStyle(element, saved) {
    saved.forEach(function (property) {
      if (property[1]) element.style.setProperty(property[0], property[1], property[2]);
      else element.style.removeProperty(property[0]);
    });
  }

  function lockPage() {
    var body = document.body, html = document.documentElement;
    var scroll = { x: window.scrollX, y: window.scrollY };
    var bodyStyle = preserveStyle(body, ['position', 'top', 'left', 'width', 'overflow', 'padding-right']);
    var htmlStyle = preserveStyle(html, ['overflow', 'scroll-behavior']);
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
      restoreStyle(body, bodyStyle);
      restoreStyle(html, htmlStyle);
      // The homepage uses smooth scrolling; returning from a dialog should not animate.
      html.style.setProperty('scroll-behavior', 'auto', 'important');
      window.scrollTo(scroll.x, scroll.y);
      restoreStyle(html, htmlStyle);
    };
  }

  function cleanup(state, restoreFocus) {
    if (!state || state.cleaned) return;
    state.cleaned = true;
    state.listeners.forEach(function (listener) {
      listener[0].removeEventListener(listener[1], listener[2]);
    });
    state.media.pause();
    state.media.removeAttribute('src');
    state.media.removeAttribute('poster');
    state.media.load();
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

  function open(video, lang, opener) {
    if (!video || typeof video.src !== 'string' || !video.src.trim()) return false;
    var returnFocus = opener || (active ? active.opener : document.activeElement);
    close(false);
    var chinese = lang === 'zh';
    var text = function (en, zh) { return chinese ? zh : en; };
    var title = typeof video.title === 'string' ? video.title : video.title && (video.title[chinese ? 'zh' : 'en'] || video.title.en);
    title = title || text('POIROT supplementary video', 'POIROT 补充视频');

    var dialog = node('dialog', 'project-video-dialog');
    dialog.lang = chinese ? 'zh' : 'en';
    dialog.setAttribute('aria-labelledby', 'projectVideoTitle');
    dialog.setAttribute('aria-describedby', 'projectVideoDescription');

    var header = node('div', 'film-header');
    var heading = node('div');
    heading.appendChild(node('p', 'film-kicker', text('HRI 2026 / Supplementary video', 'HRI 2026 / 补充视频')));
    var titleElement = node('h2', '', title);
    titleElement.id = 'projectVideoTitle';
    heading.appendChild(titleElement);
    var closeButton = node('button', 'film-close', '×');
    closeButton.type = 'button';
    closeButton.autofocus = true;
    closeButton.setAttribute('aria-label', text('Close video', '关闭视频'));
    header.appendChild(heading);
    header.appendChild(closeButton);

    var media = node('video', 'film-video');
    media.controls = true;
    media.playsInline = true;
    media.preload = 'none';
    media.setAttribute('aria-label', title);
    var fallback = node('p', '', text('Your browser cannot play this video. ', '当前浏览器无法播放此视频。'));
    var fallbackLink = node('a', '', text('Download the MP4.', '下载 MP4 文件。'));
    fallbackLink.href = video.src;
    fallbackLink.setAttribute('download', '');
    fallback.appendChild(fallbackLink);
    media.appendChild(fallback);

    var footer = node('div', 'film-footer');
    var summary = node('p', 'film-summary', text(
      'A short look at POIROT’s multi-party game setting, physical clue delivery and tablet interface.',
      '简要展示 POIROT 的多人游戏场景、实体线索分发与平板交互界面。'
    ));
    summary.id = 'projectVideoDescription';
    var duration = typeof video.duration === 'string' ? video.duration : '0:59';
    var metadata = node('p', 'film-meta film-caption-note', duration + text(' · Embedded English captions', ' · 内嵌英文字幕'));
    var note = node('p', 'film-playback-note');
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    note.hidden = true;
    var download = node('a', 'film-download', text('Download MP4', '下载 MP4'));
    download.href = video.src;
    download.setAttribute('download', '');
    var description = node('div', 'film-description');
    description.appendChild(summary);
    description.appendChild(metadata);
    description.appendChild(note);
    footer.appendChild(description);
    footer.appendChild(download);
    dialog.appendChild(header);
    dialog.appendChild(media);
    dialog.appendChild(footer);

    var state = { dialog: dialog, media: media, opener: returnFocus, listeners: [], cleaned: false, failed: false, unlock: null };
    function listen(element, event, handler) {
      element.addEventListener(event, handler);
      state.listeners.push([element, event, handler]);
    }
    function showNote(message) {
      if (state.cleaned || active !== state) return;
      note.textContent = message;
      note.hidden = false;
    }
    function playHint() {
      if (!state.failed) showNote(text(
        'Press Play in the video controls to start, or download the MP4 to watch it.',
        '请点击视频控件中的播放按钮，或下载 MP4 文件观看。'
      ));
    }
    listen(closeButton, 'click', function () { close(); });
    listen(dialog, 'cancel', function (event) { event.preventDefault(); close(); });
    listen(dialog, 'close', function () { cleanup(state, true); });
    listen(dialog, 'click', function (event) {
      if (event.target !== dialog) return;
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    });
    listen(media, 'error', function () {
      state.failed = true;
      showNote(text('Video playback is unavailable here. Download the MP4 to watch it.', '当前无法播放此视频，请下载 MP4 文件观看。'));
    });
    listen(media, 'playing', function () {
      if (state.cleaned) return;
      state.failed = false;
      note.hidden = true;
      note.textContent = '';
    });

    active = state;
    document.body.appendChild(dialog);
    state.unlock = lockPage();
    try {
      dialog.showModal();
    } catch (error) {
      cleanup(state, true);
      return false;
    }
    if (video.poster) media.poster = video.poster;
    media.src = video.src;
    // This call stays in the opener's user gesture. Nothing plays when the page loads.
    try {
      var playback = media.play();
      if (playback && typeof playback.catch === 'function') playback.catch(playHint);
    } catch (error) {
      playHint();
    }
    return true;
  }

  // Restore normal pagination before printing a page with the player open.
  window.addEventListener('beforeprint', function () { close(); });
  window.ProjectVideo = { open: open, close: function () { close(); } };
})();
