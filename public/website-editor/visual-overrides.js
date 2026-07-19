(() => {
  const ownScript = document.currentScript;
  const configUrl = new URL('visual-overrides.json', ownScript?.src || location.href).href;
  let config = { elements: [], textBoxes: [] };
  let scheduled = false;

  const routeKey = () => location.pathname + location.hash;
  const onRoute = item => !item.route || item.route === routeKey();

  function rgba(hex, opacity) {
    const normalized = (hex || '#000000').replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map(part => part + part).join('')
      : normalized.padEnd(6, '0').slice(0, 6);
    const number = Number.parseInt(value, 16);
    return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity ?? 1})`;
  }

  function finishAnchorStyles(result, style) {
    const rotation = Number(style.rotation || 0);
    if (rotation) result.transform = `${result.transform} rotate(${rotation}deg)`.trim();
    return result;
  }

  function anchorStyles(style) {
    const result = {
      position: style.anchor === 'none' ? 'relative' : style.anchorScope === 'parent' ? 'absolute' : 'fixed',
      top: '', right: '', bottom: '', left: '', transform: '',
      zIndex: String(style.zIndex ?? 10)
    };
    const x = Number(style.moveX || 0);
    const y = Number(style.moveY || 0);
    const anchor = style.anchor || 'none';
    if (anchor === 'none') {
      result.transform = `translate(${x}px, ${y}px)`;
      return finishAnchorStyles(result, style);
    }
    if (anchor.includes('top')) result.top = '0px';
    if (anchor.includes('bottom')) result.bottom = '0px';
    if (anchor.includes('left')) result.left = '0px';
    if (anchor.includes('right')) result.right = '0px';
    result.transform = `translate(${x}px, ${y}px)`;
    if (anchor === 'top-center' || anchor === 'bottom-center') {
      result.left = '50%';
      result.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
    }
    if (anchor === 'middle-left' || anchor === 'middle-right') {
      result.top = '50%';
      result.transform = `translate(${x}px, calc(-50% + ${y}px))`;
    }
    if (anchor === 'center') {
      result.top = '50%';
      result.left = '50%';
      result.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
    return finishAnchorStyles(result, style);
  }

  function applyStyle(element, style = {}, parentSelector) {
    if (style.anchorScope === 'parent' && style.anchor !== 'none' && parentSelector) {
      const parent = document.querySelector(parentSelector);
      if (parent && getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      if (parent && element.dataset.wteBoxId && element.parentElement !== parent) parent.appendChild(element);
    } else if (element.dataset.wteBoxId && element.parentElement !== document.body) {
      document.body.appendChild(element);
    }
    Object.assign(element.style, anchorStyles(style), {
      fontFamily: style.fontFamily || '',
      fontSize: style.fontSize ? `${style.fontSize}px` : '',
      color: style.textColor || '',
      fontWeight: style.bold ? '700' : '',
      fontStyle: style.italic ? 'italic' : '',
      textAlign: style.textAlign || '',
      WebkitTextStroke: style.outlineEnabled ? `${style.outlineWidth || 1}px ${style.outlineColor || '#000000'}` : '',
      backgroundColor: style.backgroundEnabled ? rgba(style.backgroundColor, style.backgroundOpacity) : '',
      borderStyle: style.borderEnabled ? 'solid' : '',
      borderColor: style.borderEnabled ? (style.borderColor || '#333A4A') : '',
      borderWidth: style.borderEnabled ? `${Math.max(0, Number(style.borderWidth ?? 1))}px` : '',
      width: style.width ? `${Math.max(24, Number(style.width))}px` : '',
      height: style.height ? `${Math.max(20, Number(style.height))}px` : '',
      boxSizing: style.width || style.height ? 'border-box' : '',
      padding: style.padding ? `${style.padding}px` : '',
      borderRadius: style.borderRadius ? `${style.borderRadius}px` : ''
    });
  }

  function ensureBox(box) {
    let element = document.querySelector(`[data-wte-box-id="${CSS.escape(box.id)}"]`);
    if (!element) {
      element = document.createElement('div');
      element.dataset.wteBoxId = box.id;
      element.textContent = box.text || '';
      const parent = box.style?.anchorScope === 'parent' && box.parentSelector
        ? document.querySelector(box.parentSelector)
        : document.body;
      (parent || document.body).appendChild(element);
    } else if (document.activeElement !== element && element.textContent !== (box.text || '')) {
      element.textContent = box.text || '';
    }
    applyStyle(element, box.style, box.parentSelector);
  }

  function applyAll() {
    scheduled = false;
    for (const item of config.elements || []) {
      if (!onRoute(item)) continue;
      document.querySelectorAll(item.selector).forEach(element => {
        applyStyle(element, item.style, item.parentSelector);
        if (item.imageUrl && element instanceof HTMLImageElement) element.src = item.imageUrl;
      });
    }
    for (const box of config.textBoxes || []) {
      const existing = document.querySelector(`[data-wte-box-id="${CSS.escape(box.id)}"]`);
      if (onRoute(box)) ensureBox(box); else existing?.remove();
    }
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyAll);
  }

  fetch(configUrl, { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(value => { config = value; applyAll(); })
    .catch(() => {});

  new MutationObserver(scheduleApply).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleApply);
  window.addEventListener('popstate', scheduleApply);
})();