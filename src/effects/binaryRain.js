export function setupBinaryRain(section, canvas) {
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0;
  let height = 0;
  let columns = [];
  let raf = null;
  let last = 0;
  let visible = !('IntersectionObserver' in window);
  const spacing = 30;
  const row = 22;

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Array.from({ length: Math.ceil(width / spacing) }, (_, index) => ({
      x: index * spacing + 12,
      y: Math.random() * (height + 330),
      speed: 20 + Math.random() * 24,
      digits: Array.from({ length: 14 }, () => Math.random() > .5 ? '1' : '0')
    }));
  }

  function draw(now) {
    raf = null;
    if (last && now - last < 33) { raf = requestAnimationFrame(draw); return; }
    const dt = last ? Math.min((now - last) / 1000, .1) : 0;
    last = now;
    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px "Space Mono", monospace';
    ctx.textAlign = 'center';
    for (const column of columns) {
      column.y += column.speed * dt;
      if (column.y - column.digits.length * row > height) column.y = -row;
      column.digits.forEach((digit, index) => {
        const y = column.y - index * row;
        if (y < 0 || y > height) return;
        const alpha = (1 - index / column.digits.length) * .48;
        ctx.fillStyle = `rgba(120,250,156,${alpha})`;
        ctx.fillText(digit, column.x, y);
      });
    }
    raf = requestAnimationFrame(draw);
  }

  function sync() {
    const running = visible && !document.hidden && !preference.matches;
    if (!running) {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      last = 0;
      if (preference.matches) ctx.clearRect(0, 0, width, height);
    } else if (raf === null) {
      last = 0;
      raf = requestAnimationFrame(draw);
    }
  }

  resize();
  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(section);
  else window.addEventListener('resize', resize);
  const visibilityObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }) : null;
  visibilityObserver?.observe(section);
  document.addEventListener('visibilitychange', sync);
  if (preference.addEventListener) preference.addEventListener('change', sync);
  else preference.addListener(sync);
  sync();

  return () => {
    if (raf !== null) cancelAnimationFrame(raf);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', sync);
    if (preference.removeEventListener) preference.removeEventListener('change', sync);
    else preference.removeListener(sync);
  };
}
