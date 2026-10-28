(function () {
  const SMALL_MAX = 720;
  const LANDSCAPE_SHARE = 0.75;

  const probe = (css) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;left:0;top:0;' + css;
    document.body.appendChild(d);
    const v = { w: d.offsetWidth, h: d.offsetHeight };
    d.remove();
    return v;
  };

  const limits = () => ({
    maxW: probe('height:0;width:calc(100vw - 40vw)').w,
    maxH: probe('width:0;height:calc(100vh - var(--topBarBlockSize, 50px))').h,
  });

  const size = (img) => {
    if (!img || !img.naturalWidth) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw > nh) {
      img.classList.remove('expr-small');
      const { maxW, maxH } = limits();
      const ratio = nw / nh;
      let w = Math.max(maxW * LANDSCAPE_SHARE, nw);
      w = Math.min(w, maxW, maxH * ratio);
      img.style.setProperty('width', w + 'px', 'important');
      img.style.setProperty('height', (w / ratio) + 'px', 'important');
    } else {
      img.style.removeProperty('width');
      img.style.removeProperty('height');
      img.classList.toggle('expr-small', Math.max(nw, nh) < SMALL_MAX);
    }
  };

  const fit = () => {
    const holder = document.getElementById('expression-holder');
    const sheld = document.getElementById('sheld');
    if (!sheld) return;
    const r = holder ? holder.getBoundingClientRect() : null;
    const edge = r && r.width > 0 ? r.right : 0;
    const w = document.documentElement.clientWidth - edge;
    sheld.style.setProperty('left', edge + 'px', 'important');
    sheld.style.setProperty('right', '0px', 'important');
    sheld.style.setProperty('width', w + 'px', 'important');
    sheld.style.setProperty('min-width', '0', 'important');
    sheld.style.setProperty('max-width', w + 'px', 'important');
    sheld.style.setProperty('box-sizing', 'border-box', 'important');
    sheld.style.setProperty('margin', '0', 'important');
  };

  const sizeAll = () => {
    const holder = document.getElementById('expression-holder');
    if (holder) holder.querySelectorAll('img').forEach(size);
  };

  const ro = new ResizeObserver(fit);
  let observed = null;
  const attach = () => {
    const holder = document.getElementById('expression-holder');
    if (holder && holder !== observed) {
      if (observed) ro.unobserve(observed);
      ro.observe(holder);
      observed = holder;
      sizeAll();
      fit();
    }
  };

  document.addEventListener('load', (e) => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.closest('#expression-holder')) {
      size(t);
      fit();
    }
  }, true);

  new MutationObserver(attach).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', () => { sizeAll(); fit(); });
  attach();
  fit();
})();