/*
 * Continuously advancing, upward-trending abstract chart.
 * This is generative art, NOT price data or a market forecast.
 * It draws from left to right and, once full, scrolls forever while new
 * values arrive at the right edge. The vertical range follows new highs.
 */
export function setupChart(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const WINDOW_SECONDS = 13;      // Time until the first line fills the width
  const STATIC_TIME = 10;         // A representative still frame when motion is reduced

  let width = 0;
  let height = 0;
  let dpr = 1;
  let startedAt = null;
  let previousFrame = null;
  let raf = null;
  let viewBottom = -1.3;
  const viewSpan = 6.6;
  let lastElapsed = 0;

  // Smooth, repeatable variations around a long-run rising path.
  // Continuous time means the line never reaches a terminal control point.
  function valueAt(seconds) {
    return (
      seconds * 0.39 +
      0.33 * Math.sin(seconds * 1.5) +
      0.19 * Math.sin(seconds * 4.5) +
      0.11 * Math.sin(seconds * 8.4)
    );
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(motionPreference.matches ? STATIC_TIME : lastElapsed);
  }

  function render(elapsed) {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    const left = width * 0.045;
    const right = width * 0.925;
    const top = height * 0.13;
    const bottom = height * 0.90;
    const plotHeight = bottom - top;
    const plotWidth = right - left;

    // Faint grid stays static as the line scrolls within it.
    ctx.save();
    ctx.strokeStyle = 'rgba(130, 185, 145, .10)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = top + (bottom - top) * i / 4;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = left + (right - left) * i / 6;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    }
    ctx.restore();

    const startTime = Math.max(0, elapsed - WINDOW_SECONDS);
    const yFor = (price) => bottom - ((price - viewBottom) / viewSpan) * plotHeight;
    const xFor = (time) => left + ((time - startTime) / WINDOW_SECONDS) * plotWidth;
    const points = [];
    // Enough samples to look smooth at any ordinary screen resolution.
    const sampleCount = Math.max(2, Math.ceil((elapsed - startTime) * 26));
    for (let i = 0; i <= sampleCount; i++) {
      const t = startTime + (elapsed - startTime) * i / sampleCount;
      points.push({ x: xFor(t), y: yFor(valueAt(t)) });
    }
    const head = points[points.length - 1];
    if (!head) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top - 4, plotWidth, bottom - top + 4);
    ctx.clip();

    function trace() {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    }

    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, 'rgba(81, 255, 132, .21)');
    gradient.addColorStop(1, 'rgba(81, 255, 132, 0)');
    trace();
    ctx.lineTo(head.x, bottom);
    ctx.lineTo(points[0].x, bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    trace();
    ctx.save();
    ctx.shadowColor = '#54fc84';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = 'rgba(83, 255, 135, .35)';
    ctx.lineWidth = 8;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();

    trace();
    ctx.strokeStyle = '#9afaaf';
    ctx.lineWidth = 2.7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = 'rgba(128,244,154,.25)';
    ctx.beginPath(); ctx.moveTo(head.x, head.y); ctx.lineTo(head.x, bottom); ctx.stroke();
    ctx.restore();

    const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 28);
    glow.addColorStop(0, 'rgba(135,255,168,.5)');
    glow.addColorStop(1, 'rgba(135,255,168,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(head.x, head.y, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c1ffd0';
    ctx.beginPath(); ctx.arc(head.x, head.y, 4.25, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function advance(now) {
    if (startedAt === null) {
      startedAt = now;
      previousFrame = now;
    }
    const secondsSinceStart = (now - startedAt) / 1000;
    const dt = Math.max(0, Math.min(0.2, (now - previousFrame) / 1000));
    previousFrame = now;
    lastElapsed = secondsSinceStart;

    // Shift the visible price range smoothly when the advancing line
    // approaches its upper edge; the chart never ends at a fixed "HIGH".
    const value = valueAt(secondsSinceStart);
    const desiredBottom = value - viewSpan * 0.80;
    if (desiredBottom > viewBottom) {
      viewBottom += (desiredBottom - viewBottom) * (1 - Math.exp(-dt * 3));
    }
    render(secondsSinceStart);
    raf = requestAnimationFrame(advance);
  }

  function updateMotion() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    if (motionPreference.matches) {
      viewBottom = -1.3;
      render(STATIC_TIME);
    } else {
      if (startedAt !== null) {
        const now = performance.now();
        previousFrame = now;
        // Reopening reduced-motion resumes a new left-to-right chart.
        startedAt = now;
        lastElapsed = 0;
        viewBottom = -1.3;
      }
      raf = requestAnimationFrame(advance);
    }
  }

  const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(canvas);
  else window.addEventListener('resize', resize);
  if (motionPreference.addEventListener) motionPreference.addEventListener('change', updateMotion);
  else motionPreference.addListener(updateMotion);
  document.addEventListener('visibilitychange', onVisibility);

  function onVisibility() {
    if (document.hidden) {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
    } else if (raf === null && !motionPreference.matches) {
      previousFrame = performance.now();
      raf = requestAnimationFrame(advance);
    }
  }

  resize();
  updateMotion();
  return () => {
    if (raf !== null) cancelAnimationFrame(raf);
    observer?.disconnect();
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVisibility);
    if (motionPreference.removeEventListener) motionPreference.removeEventListener('change', updateMotion);
    else motionPreference.removeListener(updateMotion);
  };
}
