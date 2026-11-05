const MEDIA = [
  { key: 'backbone', title: 'The backbone', file: 'tech-ad-backbone', number: '01' },
  { key: 'restore', title: 'Find the signal', file: 'tech-ad-restore', number: '02' }
];
const asset = name => new URL(`./assets/${name}`, import.meta.url).href;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
let currentMount = null;

function clock(value) {
  if (!Number.isFinite(value)) return '00:00';
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
}

function pageCopy(context, study) {
  const title = typeof study === 'object' ? study?.title : '';
  const family = typeof study === 'object' ? study?.family : '';
  const page = document.body.dataset.page;
  const variants = {
    Depth: 'From the wide view to the smallest connection. Layers and perspective become a way to look at the systems behind everyday work.',
    Organic: 'A network is a collection of connections. This is an illustrated look at how separate pieces become something that works together.',
    Typography: 'Clear signals matter, on a screen and inside a system. A short visual interlude about structure, connection and the details between them.',
    Physics: 'One small change can move an entire system. These short films bring that idea back to circuits, connections and hands-on investigation.',
    Interaction: 'A response begins with a connection. These films shift the focus from the interface to the hardware and systems behind it.',
    Scroll: 'Change the point of view and a different detail comes into focus. From infrastructure to the bench, the sequence keeps moving.'
  };
  const portfolioCopy = {
    work: 'Support engineering, datacenter work and network infrastructure share a foundation: understand the connections, then keep them working.',
    about: 'Sub works across support engineering and datacenter technology, with a hands-on interest in networks, electronics and board-level repair.',
    lab: 'Two original motion films. Circuits become a landscape; a diagnostic detail becomes the whole frame. A small test of how technical work can feel.',
    atlas: 'After the experiments, a return to the material: circuits, connections and the hands-on work that inspires this portfolio.'
  };
  return {
    label: context === 'atlas' && title ? `A visual interlude / ${title}` : 'Sub / Support engineering & datacenter technology',
    introduction: context === 'atlas' ? (variants[family] || 'From a large system to one small connection. Two original films explore the technical world behind these visual experiments.') : (portfolioCopy[page] || 'From enterprise support to the datacenter floor. From a network connection to a circuit on the bench. A visual study of the work between scales.'),
    detail: context === 'atlas' && title ? `A quieter detail after ${title}. The footage below is original test media, made for this portfolio lab.` : 'Original motion illustrations for this portfolio lab. The films are design studies, not footage of employer equipment or facilities.'
  };
}

function screenMarkup(media, wide = false) {
  return `<div class="reel-film${wide ? ' reel-film--wide' : ''}" data-reel="${media.key}">
    <div class="reel-screen" data-reel-screen>
      <video class="reel-video" muted loop playsinline preload="none" poster="${asset(media.file + '.jpg')}" aria-label="${media.title}: an original silent technology motion illustration" data-reel-video="${media.key}" data-video-kind="original-demo-footage"></video>
      <div class="reel-screen-top"><span><i></i> ORIGINAL MOTION STUDY</span><span>FILM / ${media.number}</span></div>
      <div class="reel-screen-mark" aria-hidden="true">+</div>
      <div class="reel-screen-bottom"><span>${media.key === 'backbone' ? 'CONNECTIONS / AT EVERY SCALE' : 'LOOK CLOSER / THERE IS A PATTERN'}</span><span>5U8HAN.DEV</span></div>
    </div>
    <div class="reel-transport">
      <button class="reel-play" type="button" data-reel-play aria-label="Play ${media.title} film" aria-pressed="false">${playIcon}<span>Play film</span></button>
      <span class="reel-playback" data-reel-status role="status">READY TO PLAY</span>
      <span class="reel-time" data-reel-time>00:00 / 00:12</span>
      <button class="reel-native" type="button" data-reel-native aria-pressed="false" aria-label="Show native video controls for ${media.title}">Player controls <span aria-hidden="true">↗</span></button>
    </div>
    <p class="reel-media-note">SILENT LOOP · ORIGINAL ILLUSTRATION · TEST MEDIA</p>
  </div>`;
}

/** Append two independent video sections after the existing main content. */
export function mountTechReels({ context = 'portfolio', study } = {}) {
  if (currentMount) return currentMount;
  const main = document.querySelector('main#main') || document.querySelector('main');
  if (!main) return { dispose() {} };
  const copy = pageCopy(context, study);
  const root = document.createElement('div');
  root.className = 'tech-reels';
  root.dataset.reelContext = context;
  root.innerHTML = `<section class="reel-section reel-section--backbone" aria-labelledby="reel-backbone-title">
    <div class="reel-section-top"><span>BEHIND THE INTERFACE / 01</span><span>${escapeHTML(copy.label)}</span></div>
    <header class="reel-editorial-heading">
      <h2 id="reel-backbone-title">A SYSTEM<br><span>IN MOTION.</span></h2>
      <aside class="reel-introduction"><span class="reel-aside-mark" aria-hidden="true">✳</span><p>${escapeHTML(copy.introduction)}</p><span class="reel-small-label">THE WIDE VIEW. THE FINE DETAIL.</span></aside>
    </header>
    ${screenMarkup(MEDIA[0], true)}
    <div class="reel-caption-grid"><p class="reel-caption-title">The invisible work.<br><span>Made visible.</span></p><p>Endpoints. Networks. Servers. The connections that let people get on with their day.</p><aside><span>FIELD NOTES / SUB</span><p>Support engineering<br>Datacenter technology<br>Hands-on hardware</p></aside></div>
  </section>
  <section class="reel-section reel-section--restore" aria-labelledby="reel-restore-title">
    <div class="reel-section-top"><span>FROM THE FLOOR TO THE BENCH / 02</span><span>OBSERVE. ISOLATE. UNDERSTAND.</span></div>
    <header class="reel-restore-heading"><h2 id="reel-restore-title">FIND THE<br><span>SIGNAL.</span></h2><span class="reel-direction" aria-hidden="true">${arrow}</span><p>${escapeHTML(copy.detail)}</p></header>
    <div class="reel-restore-grid">${screenMarkup(MEDIA[1])}<aside class="reel-field-notes"><div class="reel-notes-header"><span>THE APPROACH</span><span aria-hidden="true">↘</span></div><ol><li><span>01</span><div><h3>Look at the whole.</h3><p>Start with the user, the symptom and the system around it.</p></div></li><li><span>02</span><div><h3>Follow the detail.</h3><p>A path through the network. A connector. A component on the board.</p></div></li><li><span>03</span><div><h3>Make it understood.</h3><p>Test what changed. Document what helped. Keep the next step clear.</p></div></li></ol><p class="reel-practice-note">A visual nod to Sub's support work and personal electronics practice. No client systems or repair outcomes are depicted.</p></aside></div>
    <div class="reel-closing-line"><span>BIG PICTURE. SMALL DETAILS.</span><span aria-hidden="true">✳</span><span>THE WORK IS IN THE CONNECTIONS.</span></div>
  </section>`;
  const roots = [root];
  if (context === 'portfolio') {
    const early = document.createElement('div');
    early.className = 'tech-reels tech-reels--early';
    early.dataset.reelContext = context;
    early.append(root.firstElementChild);
    root.classList.add('tech-reels--late');
    const introduction = main.querySelector('.landing-review-bar') || [...main.children].find(element => element.tagName === 'SECTION');
    if (introduction) introduction.after(early);
    else main.prepend(early);
    roots.unshift(early);
  }
  main.append(root);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cleanups = [];
  let disposed = false, active = null, explicitChoice = null, observer = null;
  let permitted = readPermission();
  const states = roots.flatMap(wrapper => [...wrapper.querySelectorAll('[data-reel]')]).map((element, index) => ({
    element, media: MEDIA[index], video: element.querySelector('video'), screen: element.querySelector('[data-reel-screen]'),
    button: element.querySelector('[data-reel-play]'), status: element.querySelector('[data-reel-status]'),
    time: element.querySelector('[data-reel-time]'), native: element.querySelector('[data-reel-native]'),
    ratio: 0, visible: false, selected: false, userPaused: false, manual: false, blocked: false, failed: false, pending: false, loaded: false, intent: 0
  }));

  function readPermission() {
    if (reduce.matches) return false;
    try {
      const preference = context === 'atlas' ? localStorage.getItem('atlas-motion') ?? localStorage.getItem('portfolio-motion') : localStorage.getItem('portfolio-motion');
      return preference !== 'off';
    } catch { return true; }
  }
  function listen(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    cleanups.push(() => target.removeEventListener(event, handler, options));
  }
  function update(state) {
    const playing = !state.video.paused && !state.video.ended;
    state.element.dataset.playing = String(playing);
    state.button.innerHTML = `${playing ? pauseIcon : playIcon}<span>${playing ? 'Pause film' : 'Play film'}</span>`;
    state.button.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${state.media.title} film`);
    state.button.setAttribute('aria-pressed', String(playing));
    state.time.textContent = `${clock(state.video.currentTime)} / ${clock(state.video.duration || 12)}`;
    state.status.textContent = state.failed ? 'FILM UNAVAILABLE / POSTER PREVIEW' : playing ? 'PLAYING / SILENT LOOP' : state.blocked ? 'PRESS PLAY TO BEGIN' : state.userPaused ? 'PAUSED / YOUR PLACE IS KEPT' : (!permitted || reduce.matches) ? 'STILL / PLAY WHEN YOU CHOOSE' : state.loaded ? 'PAUSED / YOUR PLACE IS KEPT' : 'READY TO PLAY';
  }
  function pause(state) {
    if (state.selected) state.intent++;
    state.selected = false;
    if (!state.video.paused) state.video.pause();
    update(state);
  }
  function load(state) {
    if (state.loaded) return;
    state.loaded = true;
    state.video.src = asset(state.media.file + '.mp4');
  }
  function reconcile() {
    if (disposed) return;
    const candidates = document.hidden ? [] : states.filter(state => state.visible && !state.failed && !state.userPaused && (state.manual || (permitted && !reduce.matches && !state.blocked)));
    const next = candidates.includes(explicitChoice) ? explicitChoice : candidates.sort((a, b) => b.ratio - a.ratio)[0] || null;
    active = next;
    for (const state of states) {
      if (state !== next) { pause(state); continue; }
      state.selected = true;
      if (!state.video.paused || state.pending) { update(state); continue; }
      load(state);
      state.pending = true;
      const requestedIntent = state.intent;
      let playback;
      try { playback = state.video.play(); } catch { playback = Promise.reject(new Error('Playback needs a gesture')); }
      Promise.resolve(playback).then(() => {
        state.pending = false;
        if (requestedIntent !== state.intent) {
          if (!state.selected) pause(state);
          else reconcile();
        } else if (disposed || active !== state || !state.selected || document.hidden || !state.visible) pause(state);
        else update(state);
      }).catch(() => {
        state.pending = false;
        if (requestedIntent !== state.intent) { if (!disposed && state.selected) reconcile(); return; }
        if (!disposed && active === state && state.selected) {
          state.blocked = true; state.manual = false; state.selected = false; active = null; update(state);
        }
      });
    }
  }
  for (const state of states) {
    state.video.muted = true;
    state.video.defaultMuted = true;
    state.video.playsInline = true;
    listen(state.button, 'click', () => {
      state.intent++;
      if (!state.video.paused && !state.video.ended) {
        state.userPaused = true; state.manual = false; explicitChoice = null; pause(state);
      } else {
        state.userPaused = false; state.manual = true; state.blocked = false; explicitChoice = state;
        if (!state.visible) state.screen.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
      reconcile();
    });
    listen(state.native, 'click', () => {
      state.video.controls = !state.video.controls;
      state.native.setAttribute('aria-pressed', String(state.video.controls));
      state.native.setAttribute('aria-label', `${state.video.controls ? 'Hide' : 'Show'} native video controls for ${state.media.title}`);
      state.native.innerHTML = `${state.video.controls ? 'Hide controls' : 'Player controls'} <span aria-hidden="true">↗</span>`;
      if (state.video.controls) load(state);
    });
    listen(state.video, 'play', () => {
      if (!state.selected && (state.pending || state.video.paused)) { pause(state); return; }
      if (!state.selected) {
        state.userPaused = false; state.manual = true; state.blocked = false; explicitChoice = state; reconcile();
      }
      update(state);
    });
    listen(state.video, 'pause', () => {
      if (state.selected && state.video.paused) { state.userPaused = true; state.manual = false; state.selected = false; if (explicitChoice === state) explicitChoice = null; }
      update(state);
    });
    listen(state.video, 'loadedmetadata', () => update(state));
    listen(state.video, 'timeupdate', () => {
      state.time.textContent = `${clock(state.video.currentTime)} / ${clock(state.video.duration || 12)}`;
    });
    listen(state.video, 'error', () => {
      state.failed = true; state.blocked = true; state.manual = false; state.userPaused = true;
      pause(state);
      state.button.disabled = true;
      state.native.disabled = true;
    });
    update(state);
  }
  function measureWithoutObserver() {
    for (const state of states) {
      const rect = state.screen.getBoundingClientRect();
      const visible = Math.max(0, Math.min(innerHeight, rect.bottom) - Math.max(0, rect.top));
      state.ratio = visible / Math.max(1, Math.min(rect.height, innerHeight));
      state.visible = visible > Math.min(80, rect.height * .2);
    }
    reconcile();
  }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const state = states.find(item => item.screen === entry.target);
        if (!state) continue;
        state.ratio = entry.intersectionRatio;
        state.visible = entry.isIntersecting && entry.intersectionRect.height > Math.min(80, entry.boundingClientRect.height * .2);
      }
      reconcile();
    }, { threshold: [0, .05, .15, .3, .5, .75, 1] });
    states.forEach(state => observer.observe(state.screen));
  } else {
    listen(window, 'scroll', measureWithoutObserver, { passive: true });
    listen(window, 'resize', measureWithoutObserver);
    measureWithoutObserver();
  }
  const preferenceChange = event => {
    permitted = typeof event?.detail?.enabled === 'boolean' ? event.detail.enabled && !reduce.matches : readPermission();
    if (!permitted) { explicitChoice = null; states.forEach(state => state.manual = false); }
    reconcile();
  };
  listen(window, 'portfolio:motionchange', preferenceChange);
  listen(window, 'atlas:motionchange', preferenceChange);
  listen(reduce, 'change', preferenceChange);
  listen(window, 'storage', event => {
    if (['portfolio-motion', 'atlas-motion', null].includes(event.key)) preferenceChange();
  });
  listen(document, 'visibilitychange', reconcile);
  function fitFullWidth() {
    if (!main.classList.contains('container')) return;
    const width = document.documentElement.clientWidth;
    for (const wrapper of roots) {
      wrapper.classList.add('tech-reels--breakout');
      wrapper.style.setProperty('--reel-viewport-width', `${width}px`);
    }
  }
  fitFullWidth();
  listen(window, 'resize', fitFullWidth);
  function dispose() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    cleanups.splice(0).forEach(cleanup => cleanup());
    states.forEach(pause);
    roots.forEach(wrapper => wrapper.remove());
    currentMount = null;
  }
  listen(window, 'pagehide', event => {
    if (event.persisted) { states.forEach(pause); return; }
    dispose();
  });
  listen(window, 'pageshow', event => {
    if (event.persisted) { permitted = readPermission(); reconcile(); }
  });
  currentMount = { dispose };
  return currentMount;
}
