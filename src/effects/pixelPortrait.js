export function setupPixelPortrait(source, canvas, quality) {
  if (!source || !canvas) return;
  const ctx = canvas.getContext('2d');
  const small = document.createElement('canvas');
  const smallCtx = small.getContext('2d');
  if (!ctx || !smallCtx) return;

  function render() {
    if (!source.complete || !source.naturalWidth) return;
    const rect = source.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.clearRect(0, 0, w, h);
    if (quality === 100) return;
    const blockSize = 1 + 23 * Math.pow(1 - quality / 100, 2);
    small.width = Math.max(1, Math.round(rect.width / blockSize));
    small.height = Math.max(1, Math.round(small.width * source.naturalHeight / source.naturalWidth));
    smallCtx.imageSmoothingEnabled = true;
    smallCtx.imageSmoothingQuality = 'high';
    smallCtx.drawImage(source, 0, 0, small.width, small.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, small.width, small.height, 0, 0, w, h);
  }

  source.addEventListener('load', render);
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(render) : null;
  if (resizeObserver) resizeObserver.observe(source);
  else window.addEventListener('resize', render);
  render();
  return () => {
    source.removeEventListener('load', render);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', render);
  };
}
