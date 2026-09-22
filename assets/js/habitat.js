/* Native SNAIL experience. No iframe, third-party runtime, sensor simulation or navigation. */
const objectLabels = {
  envelope: ['Room envelope', '房间边界'], bed: ['Rest area', '休息区'], bedside: ['Bedside storage', '床边收纳'],
  bamboo: ['Bamboo shelving', '竹木置物架'], acrylic: ['Display shelving', '透明展示架'], workdesk: ['Workstation', '工作台'],
  sofa: ['Living area', '会客区'], coffee: ['Coffee table & rug', '茶几与地毯'], television: ['Display & console', '电视与矮柜'],
  appliance: ['Freestanding appliance', '窗边立式设备'], discussion: ['Discussion area', '研讨区'], projection: ['Projection screen', '投影幕'],
  cabinet: ['Cabinet & floor lamp', '高柜与落地灯'], sideboard: ['Entry & mobile display', '入口与移动屏'],
  camera_mounts: ['Wall-mounted devices', '墙面设备'], ceiling: ['Open ceiling', '开放吊顶']
};
const details = {
  bed: ['A resting area beside the window. Furniture and bedding are simplified from the reference photographs.', '窗边的休息区域。家具与床品依据参考照片简化建模。'],
  sofa: ['Sofa, coffee table and display form a shared living area for everyday activity.', '沙发、茶几与电视构成用于日常活动的共享会客空间。'],
  discussion: ['A table, seating and projection screen define the collaborative research area.', '研讨桌、座椅与投影幕构成协作研究区域。'],
  workdesk: ['The workstation sits beside the living area. Screen content is omitted from the model.', '工作台与会客区域相邻，模型中不展示屏幕内容。'],
  acrylic: ['Transparent shelves act as a spatial divider and display area; their contents are simplified.', '透明展示架同时承担空间分隔与展示功能，架内物件经过简化。'],
  camera_mounts: ['Device positions are approximate. Types, orientations and sensing coverage have not been calibrated.', '设备位置为视觉近似，类型、朝向与传感覆盖范围未经标定。']
};

export function mountHabitat(root, lang) {
  const text = (en, zh) => lang === 'zh' ? zh : en;
  const local = pair => pair[lang === 'zh' ? 1 : 0];
  const lifecycle = new AbortController(), signal = lifecycle.signal;
  const listen = (node, event, fn, options = {}) => node.addEventListener(event, fn, {...options, signal});
  const preview = root.querySelector('canvas'), note = root.querySelector('.habitat-load-note');
  let dead = false, previewRenderer, renderer, observer, resizeObserver, dialog, frame = 0, last = 0, opener;
  let modulePromise, drag = null, visible = false, previousOverflow = '', hold = null, opened = 0;
  const load = () => modulePromise ||= import('./habitat-renderer.js?v=20260922-inline').catch(error => { modulePromise = null; throw error; });
  const label = id => objectLabels[id] ? local(objectLabels[id]) : text('Spatial model', '空间模型');
  const stop = () => { renderer?.clearKeys(); hold = null; drag = null; cancelAnimationFrame(frame); frame = 0; last = 0; };
  function animate(time) {
    frame = 0;
    if (!dialog?.open || dead || document.hidden) return;
    renderer?.step(last ? Math.min((time - last) / 1000, .05) : 0);
    last = time;
    if (renderer?.dirty) renderer.draw();
    if (renderer?.fp) frame = requestAnimationFrame(animate);
  }
  function draw() { if (!frame && dialog?.open && !document.hidden) frame = requestAnimationFrame(animate); }
  function select(id) {
    if (!dialog) return;
    const name = dialog.querySelector('[data-object-name]'), description = dialog.querySelector('[data-object-description]');
    name.textContent = label(id);
    description.textContent = details[id] ? local(details[id]) : text('A simplified, photo-assisted object. Dimensions are approximate; equipment functions are not inferred from appearance.', '依据照片构建的简化物件，尺寸为近似值，不根据外观推断设备功能。');
    dialog.querySelector('select').value = objectLabels[id] ? id : '';
    draw();
  }
  function syncMode() {
    if (!renderer) return;
    const walking = renderer.fp;
    dialog.classList.toggle('is-walking', walking);
    dialog.querySelector('[data-walk]').setAttribute('aria-pressed', String(walking));
    dialog.querySelector('[data-walk]').textContent = walking ? text('Exit walk', '退出漫游') : text('Walk inside', '进入漫游');
    dialog.querySelector('[data-hint]').textContent = walking
      ? text('WASD / arrows: move · Q/E: turn · R/F: look up/down · Drag: look · Esc: exit walk', 'WASD / 方向键：移动 · Q/E：转向 · R/F：抬头/低头 · 拖动：环顾 · Esc：退出漫游')
      : text('Drag or Q/E to orbit · Scroll or +/− to zoom · Click to inspect', '拖动或 Q/E 旋转 · 滚轮或 +/− 缩放 · 点击物件查看');
    dialog.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(!walking && button.dataset.view === 'overview')));
    draw();
  }
  function setWalk(walk) {
    renderer.setWalk(walk); syncMode();
    dialog.querySelector('canvas').focus({preventScroll: true});
  }
  function buildDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'habitat-dialog'; dialog.setAttribute('aria-labelledby', 'habitatDialogTitle');
    dialog.innerHTML = `<div class="habitat-dialog-head"><div><span class="habitat-eyebrow">${text('SMART HABITAT PLATFORM', '人居环境多模态实验平台')}</span><h2 id="habitatDialogTitle">SNAIL Lab</h2></div><button class="habitat-close" aria-label="${text('Close 3D explorer', '关闭三维探索')}" autofocus>×</button></div>
      <div class="habitat-toolbar" role="group" aria-label="${text('Camera controls', '视角控制')}">
        <div class="habitat-view-tabs"><button data-view="overview" aria-pressed="true">${text('Overview', '全景')}</button><button data-view="plan" aria-pressed="false">${text('Top view', '俯视')}</button></div>
        <button data-walk aria-pressed="false">${text('Walk inside', '进入漫游')}</button><button data-reset>${text('Reset view', '重置视角')}</button>
      </div>
      <div class="habitat-stage"><canvas tabindex="0" aria-label="${text('Interactive SNAIL Lab model', 'SNAIL Lab 交互模型')}" aria-describedby="habitatHint"></canvas>
        <span class="habitat-stage-label">${text('PHOTO-ASSISTED 3D MODEL', '照片辅助三维模型')}</span>
        <div class="habitat-zoom" role="group" aria-label="${text('Zoom', '缩放')}"><button data-zoom="1.14" aria-label="${text('Zoom in', '放大')}">+</button><button data-zoom="0.88" aria-label="${text('Zoom out', '缩小')}">−</button></div>
        <div class="habitat-move" role="group" aria-label="${text('Walking controls', '漫游控制')}"><button data-move="w" aria-label="${text('Move forward', '向前移动')}">↑</button><div><button data-move="a" aria-label="${text('Move left', '向左移动')}">←</button><button data-move="s" aria-label="${text('Move backward', '向后移动')}">↓</button><button data-move="d" aria-label="${text('Move right', '向右移动')}">→</button></div></div>
        <p class="habitat-stage-status" role="status">${text('Loading the model…', '正在加载模型…')}</p>
      </div>
      <div class="habitat-viewer-bottom"><p data-hint id="habitatHint">${text('Drag or Q/E to orbit · Scroll or +/− to zoom · Click to inspect', '拖动或 Q/E 旋转 · 滚轮或 +/− 缩放 · 点击物件查看')}</p>
        <div class="habitat-inspector"><div><label for="habitatObjects">${text('Explore the space', '探索空间')}</label><select id="habitatObjects"><option value="">${text('Choose an object', '选择空间物件')}</option>${Object.entries(objectLabels).map(([id, names]) => `<option value="${id}">${local(names)}</option>`).join('')}</select></div><div aria-live="polite"><h3 data-object-name>${text('Sensing and AI-engaged Living Lab', 'Sensing and AI-engaged Living Lab')}</h3><p data-object-description>${text('Explore the model from above, or walk through its living, rest and discussion areas.', '从上方查看整体布局，或进入会客、休息与研讨区域漫游。')}</p></div></div>
        <p class="habitat-provenance">${text('Manually parameterized from photographs. Approximate dimensions; no calibrated sensor coverage or live measurements. Walking is free-camera navigation.', '依据照片手工参数化建模。尺寸为近似值，不展示已标定的传感覆盖或实时测量。漫游采用自由视角。')}</p>
      </div>`;
    document.body.append(dialog);
    const canvas = dialog.querySelector('canvas');
    listen(dialog.querySelector('.habitat-close'), 'click', () => dialog.close());
    listen(dialog, 'click', event => { if (event.target === dialog) { const b = dialog.getBoundingClientRect(); if(event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) dialog.close(); } });
    listen(dialog, 'cancel', event => { if(renderer?.fp) { event.preventDefault(); setWalk(false); } });
    listen(dialog, 'close', () => { opened++; stop(); document.body.style.overflow = previousOverflow; opener?.focus({preventScroll:true}); });
    listen(dialog.querySelector('[data-walk]'), 'click', () => { if(renderer) setWalk(!renderer.fp); });
    listen(dialog.querySelector('[data-reset]'), 'click', () => { if(renderer) { renderer.setView('overview'); syncMode(); } });
    dialog.querySelectorAll('[data-view]').forEach(button => listen(button, 'click', () => {
      if (!renderer) return; renderer.setView(button.dataset.view); syncMode();
      dialog.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button))); draw();
    }));
    dialog.querySelectorAll('[data-zoom]').forEach(button => listen(button, 'click', () => { renderer?.zoomBy(Number(button.dataset.zoom)); draw(); }));
    listen(dialog.querySelector('select'), 'change', event => {
      if (!renderer || !event.target.value) return;
      renderer.selected = event.target.value; renderer.dirty = true; select(event.target.value);
    });
    listen(canvas, 'pointerdown', event => {
      if (!renderer || event.button !== 0) return;
      canvas.focus({preventScroll:true}); canvas.setPointerCapture(event.pointerId);
      drag = {id:event.pointerId, x:event.clientX, y:event.clientY, startX:event.clientX, startY:event.clientY, moved:false};
    });
    listen(canvas, 'pointermove', event => {
      if (!drag || drag.id !== event.pointerId || !renderer) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      drag.moved ||= Math.hypot(event.clientX-drag.startX, event.clientY-drag.startY) > 4;
      if (renderer.fp) renderer.look(dx,dy); else if (event.shiftKey) renderer.pan(dx,dy); else renderer.orbit(dx,dy);
      drag.x=event.clientX; drag.y=event.clientY; draw();
    });
    listen(canvas, 'pointerup', event => {
      if (drag?.id === event.pointerId && !drag.moved && renderer) renderer.pickAt(event.clientX,event.clientY);
      drag=null; draw();
    });
    listen(canvas, 'pointercancel', () => { drag=null; });
    listen(canvas, 'wheel', event => { if(renderer && !renderer.fp) { event.preventDefault(); renderer.zoomBy(Math.exp(-event.deltaY*.001)); draw(); } }, {passive:false});
    const keyMap = {KeyW:'KeyW',KeyA:'KeyA',KeyS:'KeyS',KeyD:'KeyD',ArrowUp:'KeyW',ArrowDown:'KeyS',ArrowLeft:'KeyA',ArrowRight:'KeyD'};
    listen(canvas, 'keydown', event => {
      if (!renderer || event.metaKey || event.ctrlKey || event.altKey) return;
      const turn = {KeyQ:[-24,0],KeyE:[24,0],KeyR:[0,-20],KeyF:[0,20]}[event.code];
      if(turn) { event.preventDefault(); renderer.fp ? renderer.look(...turn) : renderer.orbit(...turn); draw(); }
      else if(!renderer.fp && ['Equal','Minus','NumpadAdd','NumpadSubtract'].includes(event.code)) { event.preventDefault(); renderer.zoomBy(['Equal','NumpadAdd'].includes(event.code) ? 1.14 : .88); draw(); }
      else if(renderer.fp && keyMap[event.code]) { event.preventDefault(); renderer.moveKeys[keyMap[event.code]]=true; draw(); }
    });
    listen(canvas, 'keyup', event => { if(renderer && keyMap[event.code]) { renderer.moveKeys[keyMap[event.code]]=false; if(renderer.fp) event.preventDefault(); } });
    listen(canvas, 'blur', () => { renderer?.clearKeys(); });
    dialog.querySelectorAll('[data-move]').forEach(button => {
      listen(button, 'pointerdown', event => { if (!renderer?.fp) return; event.preventDefault(); button.setPointerCapture(event.pointerId); renderer.clearKeys(); hold = button.dataset.move; renderer.moveKeys['Key'+hold.toUpperCase()] = true; draw(); });
      for (const event of ['pointerup','pointercancel','lostpointercapture']) listen(button, event, () => { hold=null; renderer?.clearKeys(); });
      listen(button, 'click', event => { if (event.detail === 0 && renderer?.fp) { renderer.moveKeys['Key'+button.dataset.move.toUpperCase()]=true; renderer.step(.12); renderer.clearKeys(); draw(); } });
    });
    listen(canvas, 'webglcontextlost', event => { event.preventDefault(); stop(); dialog.querySelector('.habitat-stage-status').textContent=text('Graphics paused. Waiting for recovery…','图形已暂停，正在等待恢复…'); });
    listen(canvas, 'webglcontextrestored', () => { if(renderer) { renderer.dirty=true; dialog.querySelector('.habitat-stage-status').textContent=''; draw(); } });
  }
  async function open(mode, button) {
    if (!dialog) buildDialog();
    opener = button; previousOverflow = document.body.style.overflow; document.body.style.overflow='hidden';
    dialog.showModal(); const request = ++opened;
    try {
      const {HabitatRenderer} = await load();
      if (dead || !dialog.open || request !== opened) return;
      if (!renderer) renderer = new HabitatRenderer(dialog.querySelector('canvas'), select);
      renderer.setView('overview'); if(mode === 'walk') renderer.setWalk(true);
      renderer.resize(); syncMode();
      dialog.querySelector('.habitat-stage-status').textContent='';
      dialog.querySelector('canvas').focus({preventScroll:true}); draw();
    } catch (error) {
      if(!dead && dialog.open) dialog.querySelector('.habitat-stage-status').textContent=text('The model could not load. Close and reopen to try again.','模型未能加载，请关闭并重新打开重试。');
    }
  }
  async function preparePreview() {
    try {
      const {HabitatRenderer} = await load();
      if(dead || previewRenderer) return;
      previewRenderer = new HabitatRenderer(preview, () => {});
      previewRenderer.setView('overview'); previewRenderer.resize(); previewRenderer.draw(); note.textContent='';
    } catch(error) { if(!dead) note.textContent=text('Use “Explore in 3D” to load the spatial model.','点击「探索三维空间」加载空间模型。'); }
  }
  listen(preview, 'webglcontextlost', event => { event.preventDefault(); note.textContent=text('Graphics paused. Waiting for recovery…','图形已暂停，正在等待恢复…'); });
  listen(preview, 'webglcontextrestored', () => { if(previewRenderer) { previewRenderer.dirty=true; previewRenderer.draw(); note.textContent=''; } });
  root.querySelectorAll('[data-habitat-open]').forEach(button => listen(button, 'click', () => open(button.dataset.habitatOpen,button)));
  resizeObserver = new ResizeObserver(() => { if(previewRenderer && visible) { previewRenderer.resize(); previewRenderer.draw(); } if(renderer && dialog?.open) { renderer.resize(); draw(); } });
  resizeObserver.observe(root);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if(visible) { preparePreview(); if(previewRenderer) { previewRenderer.resize(); previewRenderer.draw(); } } }, {rootMargin:'240px'});
    observer.observe(preview);
  } else { visible=true; preparePreview(); }
  listen(window,'resize', () => { if(renderer && dialog?.open) { renderer.resize(); draw(); } });
  listen(window,'blur',stop);
  listen(window,'focus',draw);
  listen(document,'visibilitychange', () => { if(document.hidden) stop(); else draw(); });
  return {dispose() { dead=true; opened++; stop(); if(dialog?.open) { dialog.close(); document.body.style.overflow=previousOverflow; } lifecycle.abort(); observer?.disconnect(); resizeObserver?.disconnect(); previewRenderer?.dispose(); renderer?.dispose(); dialog?.remove(); }};
}
