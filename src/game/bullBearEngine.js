/* Bull vs Bear */
export function createBullBearGame({ onStateChange }) {

  const CONFIG = {
    speed: 280,
    gravity: 1300,
    jump: 540,
    bearSpeed: 150,
    spawnSeconds: 1.7,
    minSpawn: 0.42,
    difficultySeconds: 90,
    invincibility: 1.5,
    collectibles: 15
  };

  const CHARACTER_SIZE = 48;
  const PIXEL_SIZE = 2;
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  const HEART_ROWS = [
    '.BBB.BBB.',
    'BRRRBRRRB',
    'BRRRRRRRB',
    'BRRRRRRRB',
    '.BRRRRRB.',
    '..BRRRB..',
    '...BRB...',
    '....B....'
  ];

  const heartIcon = filled =>
    `<svg class="bb-heart${filled ? '' : ' bb-heart--empty'}" viewBox="0 0 9 8" ` +
    'aria-hidden="true" focusable="false" shape-rendering="crispEdges">' +
    HEART_ROWS.map((row, y) =>
      [...row].map((pixel, x) =>
        pixel === '.'
          ? ''
          : `<rect x="${x}" y="${y}" width="1" height="1" ` +
            `fill="${
              pixel === 'B'
                ? 'currentColor'
                : filled
                  ? '#ff606c'
                  : '#22151b'
            }"/>`
      ).join('')
    ).join('') +
    '</svg>';

  const SPRITES = {
    bull: [
      '..BB..........BB..',
      '.BFBB........BBFB.',
      'BAEFB........BFEAB',
      'BAEEBBBBBBBBBBEEAB',
      'BAEEAAAAAAAAAAEEAB',
      'BAAAAAAAAAAAAAAAAB',
      'BHAAAAAAAAAAAAAAHB',
      'BBAAADDDDDDDDAAABB',
      '.BAAADBDDDDBDAAAB.',
      '.BAAADBDDDDBDAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAACCCCCCCCAAAB.',
      '.BAAACCICCICCAAAB.',
      '.BAAACCCCCCCCAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BBBBBBBBBBBBBBBB.',
      '...BAAB....BAAB...',
      '...BAAB....BAAB...',
      '...BGGB....BGGB...',
      '...BBBB....BBBB...'
    ],

    bear: [
      '.BBB..........BBB.',
      'BAAABBBBBBBBBBAAAB',
      'BACAAAAAAAAAAAACAB',
      'BAAAAAAAAAAAAAAAAB',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAABAAAAAABAAAB.',
      '.BAAABBAAAABBAAAB.',
      '.BAAAACCCCCCAAAAB.',
      '.BAAAACBBBBCAAAAB.',
      '.BAAAACCBBCCAAAAB.',
      '.BAAAAACCCCAAAAAB.',
      '.BAAAAAAAAAAAAAAB.',
      '.BAAABBBBBBBBAAAB.',
      '.BAAABDB..BDBAAAB.',
      '.BEAABDB..BDBAAEB.',
      '.BDDDBDB..BDBDDDB.',
      '.BBBBBBB..BBBBBBB.'
    ]
  };

  const PALETTES = {
    bull: {
      A: '#99431f',
      B: '#000000',
      C: '#e5aa7a',
      D: '#ba6d4c',
      E: '#f5e49c',
      F: '#bfb17a',
      G: '#47291d',
      H: '#663521',
      I: '#40261c'
    },

    bear: {
      A: '#9c5a3c',
      B: '#000000',
      C: '#e5aa7a',
      D: '#633623',
      E: '#693726'
    }
  };

  const STAY_DARK = new Set(['B', 'G', 'H', 'I']);

  const FACTS = [
    'Random fact about me: I wish I majored in CS.',
    "Random fact about me: I once won a competition I hadn't intended to enter",
    "Random fact about me: I've lived in 3 different countries."
  ];

  let active = false;
  let ended = false;
  let rewardShown = false;

  let canvas;
  let ctx;
  let hud;
  let over;
  let abort;
  let player;

  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;

  let elapsed = 0;
  let spawn = 0;
  let inv = 0;
  let score = 0;
  let hearts = 3;

  let grounded = false;
  let lastBearX = null;

  let platforms = [];
  let candles = [];
  let bears = [];
  let particles = [];

  let collected = new Set();
  let keys = new Set();

  const editable = el => !!el?.closest(
    'input,textarea,select,[contenteditable]:not([contenteditable="false"])'
  );

  const hit = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;

  const clamp = (n, min, max) =>
    Math.max(min, Math.min(max, n));

  // Platforms and bears occupy the left side of the page.
  const laneRight = () =>
    Math.min(w - 12, Math.max(90, Math.min(230, w * 0.20)));

  function buildWorld() {
    const pageHeight = document.documentElement.scrollHeight;

    const safeAreas = [...document.querySelectorAll(
      '.intro h1,.intro__kicker,.intro__copy,.intro-avatar,.portrait,' +
      '.about-copy,.section-heading,.project-card,.site-nav,.tape,.site-footer'
    )].map(el => {
      const r = el.getBoundingClientRect();

      return {
        x: r.left - 12,
        y: r.top + scrollY - 12,
        w: r.width + 24,
        h: r.height + 24
      };
    });

    const clear = r =>
      !safeAreas.some(area => hit(r, area));

    platforms = [];

    const right = laneRight();
    const width = Math.min(72, Math.max(54, w * 0.055));
    const positions = [14, 104, 44, 128, 67, 20, 92, 35];

    let previousX = 14;

    // One platform per row, with gaps the bull can jump.
    for (let y = 250, row = 0; y < pageHeight - 65; row++) {
      const preferred = positions[row % positions.length];
      const options = [];

      for (let x = 12; x + width <= right; x += 12) {
        const rect = {
          x,
          y: y - 65,
          w: width,
          h: 77
        };

        if (clear(rect)) options.push(x);
      }

      // Keep the route continuous when content occupies a row.
      if (options.length === 0) {
        options.push(
          clamp(preferred, 12, Math.max(12, right - width))
        );
      }

      options.sort((a, b) =>
        (
          Math.abs(a - preferred) +
          Math.max(0, Math.abs(a - previousX) - 110) * 6
        ) -
        (
          Math.abs(b - preferred) +
          Math.max(0, Math.abs(b - previousX) - 110) * 6
        )
      );

      previousX = options[0];

      platforms.push({
        x: previousX,
        y,
        w: width,
        h: 8
      });

      y += [85, 90, 95, 88][row % 4];
    }

    // Spread 15 candles across the full page.
    candles = [];

    if (platforms.length) {
      for (let i = 0; i < CONFIG.collectibles; i++) {
        const index = Math.min(
          platforms.length - 1,
          Math.floor(
            (i + 0.5) * platforms.length / CONFIG.collectibles
          )
        );

        const p = platforms[index];

        const overlap = candles.filter(
          c => c.platformIndex === index
        ).length;

        const offset = overlap % 2 === 0 ? 0.25 : 0.65;

        candles.push({
          id: i,
          platformIndex: index,
          x: p.x + p.w * offset - 6,
          y: p.y - 38,
          w: 12,
          h: 25,
          phase: i
        });
      }
    }
  }

  function placeInView() {
    const visible = platforms.filter(p =>
      p.y > scrollY + 100 &&
      p.y < scrollY + h - 50
    );

    const p =
      visible[Math.floor(visible.length * 0.6)] ||
      platforms[0];

    if (!p || !player) return;

    player.x = p.x + Math.min(12, p.w / 4);
    player.y = p.y - player.h;
    player.vy = 0;
    grounded = true;
  }

  function resize() {
    w = innerWidth;
    h = innerHeight;

    const ratio = Math.min(devicePixelRatio || 1, 2);

    canvas.width = Math.round(w * ratio);
    canvas.height = Math.round(h * ratio);

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    buildWorld();

    if (player) placeInView();
  }

  function status() {
    hud.querySelector('output').innerHTML =
      `<span class="bb-hearts" role="img" aria-label="${hearts} of 3 hearts">` +
      Array.from(
        { length: 3 },
        (_, i) => heartIcon(i < hearts)
      ).join('') +
      '</span>' +
      `<span class="bb-score">${collected.size}/${CONFIG.collectibles} ` +
      `CANDLES · SCORE ${score}</span>`;
  }

  function showReward() {
    ended = true;
    rewardShown = true;

    over.hidden = false;
    over.querySelector('.bb-prize').hidden = false;
    over.querySelector('h2').textContent = 'MARKET CONQUERED!';

    over.querySelector('p').textContent =
      FACTS[Math.floor(Math.random() * FACTS.length)];

    over.querySelector('button').textContent = 'Play again';
    over.querySelector('button').focus();
  }

  function gameOver(message) {
    ended = true;
    keys.clear();

    over.hidden = false;
    over.querySelector('.bb-prize').hidden = true;
    over.querySelector('h2').textContent = 'GAME OVER';
    over.querySelector('p').textContent = message;
    over.querySelector('button').textContent = 'Restart game';
    over.querySelector('button').focus();
  }

  function reset() {
    collected.clear();

    bears = [];
    particles = [];

    score = 0;
    hearts = 3;
    elapsed = 0;
    spawn = 1;
    inv = 0;

    ended = false;
    rewardShown = false;
    lastBearX = null;

    keys.clear();

    over.hidden = true;
    over.querySelector('.bb-prize').hidden = true;

    player = {
      x: 20,
      y: 0,
      w: CHARACTER_SIZE,
      h: CHARACTER_SIZE,
      vy: 0
    };

    buildWorld();
    placeInView();
    status();

    last = 0;

    if (!raf) raf = requestAnimationFrame(loop);
  }

  function burst(x, y, colour) {
    for (let i = 0; i < 10; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 130,
        vy: -Math.random() * 130,
        life: 0.6,
        colour
      });
    }
  }

  // Small green particles beneath the bull's feet while walking.
  function walkingDust(dt, distance) {
    if (
      !grounded ||
      Math.abs(distance) < 0.01 ||
      reducedMotion.matches
    ) {
      player.dustTimer = 0;
      return;
    }

    player.dustTimer = (player.dustTimer || 0) - dt;

    if (player.dustTimer > 0) return;

    player.dustTimer = 0.075;

    const direction = Math.sign(distance);

    for (const foot of [17, 31]) {
      const life = 0.22 + Math.random() * 0.16;

      particles.push({
        x: player.x + foot + (Math.random() - 0.5) * 4,
        y: player.y + player.h - 2,
        vx: -direction * (12 + Math.random() * 22),
        vy: -12 - Math.random() * 18,
        life,
        maxLife: life,
        size: 2,
        opacity: 0.55,
        gravity: 65,
        colour: '#6edeac'
      });
    }
  }

  function sprite(kind, x, y, flip = false) {
    const rows = SPRITES[kind];
    const palette = PALETTES[kind];
    const width = Math.max(...rows.map(row => row.length));

    const offsetX = Math.floor(
      (CHARACTER_SIZE - width * PIXEL_SIZE) / 2
    );

    const offsetY =
      CHARACTER_SIZE - rows.length * PIXEL_SIZE;

    ctx.save();

    // Blink during damage protection while retaining the red tint.
    if (
      kind === 'bull' &&
      inv > 0 &&
      !ended &&
      !reducedMotion.matches
    ) {
      const damageAge = CONFIG.invincibility - inv;

      ctx.globalAlpha =
        Math.floor(damageAge / 0.18) % 2 === 0 ? 1 : 0.15;
    }

    ctx.translate(Math.round(x), Math.round(y));

    if (flip) {
      ctx.translate(CHARACTER_SIZE, 0);
      ctx.scale(-1, 1);
    }

    ctx.imageSmoothingEnabled = false;

    rows.forEach((row, j) => {
      [...row].forEach((pixel, i) => {
        if (!palette[pixel]) return;

        ctx.fillStyle =
          kind === 'bull' &&
          inv > 0 &&
          !STAY_DARK.has(pixel)
            ? '#ff8787'
            : palette[pixel];

        ctx.fillRect(
          offsetX + i * PIXEL_SIZE,
          offsetY + j * PIXEL_SIZE,
          PIXEL_SIZE,
          PIXEL_SIZE
        );
      });
    });

    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(0, -scrollY);

    platforms.forEach(p => {
      if (
        p.y < scrollY - 20 ||
        p.y > scrollY + h + 20
      ) return;

      ctx.fillStyle = 'rgba(9,35,19,.8)';
      ctx.fillRect(p.x, p.y, p.w, 9);

      ctx.fillStyle = 'rgba(110,222,172,.55)';
      ctx.fillRect(p.x, p.y, p.w, 2);

      ctx.fillStyle = 'rgba(110,222,172,.22)';

      for (let x = p.x + 6; x < p.x + p.w; x += 12) {
        ctx.fillRect(x, p.y + 5, 2, 2);
      }
    });

    candles.forEach(c => {
      if (
        collected.has(c.id) ||
        c.y < scrollY - 50 ||
        c.y > scrollY + h + 50
      ) return;

      const y =
        c.y + Math.sin(elapsed * 3 + c.phase) * 3;

      ctx.fillStyle = '#86f6a5';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 7;

      ctx.fillRect(c.x + 5, y - 6, 2, 37);
      ctx.fillRect(c.x, y, 12, 25);

      ctx.shadowBlur = 0;
    });

    bears.forEach(b => sprite('bear', b.x, b.y));

    sprite(
      'bull',
      player.x,
      player.y + (
        player.vy === 0
          ? Math.sin(elapsed * (keys.size ? 18 : 3)) *
            (keys.size ? 2 : 1)
          : 0
      ),
      keys.has('ArrowLeft') || keys.has('KeyA')
    );

    particles.forEach(p => {
      ctx.globalAlpha =
        Math.max(0, p.life / (p.maxLife || 0.6)) *
        (p.opacity ?? 1);

      ctx.fillStyle = p.colour;

      const size = p.size || 4;

      ctx.fillRect(
        Math.round(p.x),
        Math.round(p.y),
        size,
        size
      );
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function loop(now) {
    raf = 0;

    if (!active) return;

    const paused =
      document.hidden || editable(document.activeElement);

    const dt = paused || !last
      ? 0
      : Math.min((now - last) / 1000, 0.033);

    last = now;

    if (!ended && !paused) {
      elapsed += dt;
      inv = Math.max(0, inv - dt);

      const direction =
        Number(keys.has('ArrowRight') || keys.has('KeyD')) -
        Number(keys.has('ArrowLeft') || keys.has('KeyA'));

      const previousX = player.x;

      player.x = clamp(
        player.x + direction * CONFIG.speed * dt,
        0,
        w - player.w
      );

      const previousFeet = player.y + player.h;
      const previousTop = player.y;

      player.vy += CONFIG.gravity * dt;
      player.y += player.vy * dt;

      grounded = false;

      if (player.vy >= 0) {
        for (const p of platforms) {
          if (
            player.x + player.w > p.x &&
            player.x < p.x + p.w &&
            previousFeet <= p.y + 0.5 &&
            player.y + player.h >= p.y
          ) {
            player.y = p.y - player.h;
            player.vy = 0;
            grounded = true;
            break;
          }
        }
      }

      walkingDust(dt, player.x - previousX);

      // Moving the page alone never kills the bull; falling does.
      if (
        !grounded &&
        player.vy > 0 &&
        previousTop <= scrollY + h &&
        player.y > scrollY + h
      ) {
        hearts = 0;
        status();

        gameOver(
          'You fell off the screen. Final score: ' + score
        );
      }

      if (
        !ended &&
        player.vy < 0 &&
        player.y + player.h >= scrollY &&
        player.y < scrollY + 90
      ) {
        window.scrollTo({
          top: Math.max(0, player.y - 90),
          behavior: 'instant'
        });
      }

      // Falling bears target different left-side platforms.
      if (!ended) spawn -= dt;

      if (!ended && spawn <= 0) {
        const visible = platforms.filter(p =>
          p.y > scrollY + 70 &&
          p.y < scrollY + h
        );

        const varied = visible.filter(p =>
          lastBearX === null ||
          Math.abs(
            p.x + p.w / 2 - CHARACTER_SIZE / 2 - lastBearX
          ) > 35
        );

        const pool = varied.length ? varied : visible;

        const target = pool.length
          ? pool[Math.floor(Math.random() * pool.length)]
          : null;

        const right = Math.max(
          1,
          laneRight() - CHARACTER_SIZE
        );

        const x = target
          ? clamp(
              target.x + (Math.random() - 0.5) * 34,
              0,
              right
            )
          : Math.random() * right;

        lastBearX = x;

        bears.push({
          x,
          y: scrollY - CHARACTER_SIZE,
          w: CHARACTER_SIZE,
          h: CHARACTER_SIZE,
          speed:
            CONFIG.bearSpeed +
            Math.random() * 80 +
            Math.min(180, elapsed)
        });

        spawn = Math.max(
          CONFIG.minSpawn,
          CONFIG.spawnSeconds /
            (1 + elapsed / CONFIG.difficultySeconds)
        );
      }

      bears.forEach(b => {
        b.y += b.speed * dt;

        if (!ended && inv <= 0 && hit(player, b)) {
          hearts--;
          inv = CONFIG.invincibility;

          burst(
            player.x + CHARACTER_SIZE / 2,
            player.y,
            '#ff6868'
          );

          status();

          if (hearts <= 0) {
            gameOver('Final score: ' + score);
          }
        }
      });

      bears = bears.filter(b =>
        b.y < scrollY + h + 45 &&
        b.y > scrollY - 100
      );

      if (!ended) {
        candles.forEach(c => {
          if (collected.has(c.id)) return;

          const floating = {
            ...c,
            y: c.y + Math.sin(elapsed * 3 + c.phase) * 3
          };

          if (!hit(player, floating)) return;

          collected.add(c.id);
          score += 10;

          burst(
            c.x,
            c.y,
            '#86f6a5'
          );

          status();

          if (
            collected.size === CONFIG.collectibles &&
            !rewardShown
          ) {
            showReward();
          }
        });
      }

      particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.gravity ?? 220) * dt;
        p.life -= dt;
      });

      particles = particles.filter(p => p.life > 0);
    }

    draw();

    if (!document.hidden) {
      raf = requestAnimationFrame(loop);
    }
  }

  function enable() {
    if (active) return;

    active = true;
    abort = new AbortController();

    const opts = { signal: abort.signal };

    canvas = document.createElement('canvas');
    canvas.className = 'bb-overlay';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);

    ctx = canvas.getContext('2d');

    hud = document.createElement('div');
    hud.className = 'bb-hud';

    hud.innerHTML =
      '<output aria-live="polite"></output>' +
      '<span>Collect 15 candlesticks. Avoid falling bears.</span>' +
      '<span>A/D or ←/→ · W/Space/↑ jump · S/↓ drop · Falling off-screen ends the run</span>';

    document.body.append(hud);

    over = document.createElement('div');
    over.className = 'bb-over';
    over.setAttribute('role', 'dialog');
    over.setAttribute('aria-label', 'Game over');

    over.innerHTML =
      '<h2>GAME OVER</h2>' +
      `<img class="bb-prize" src="${import.meta.env.BASE_URL}assets/images/game/bull-vs-bear-icon.png" alt="Your prize" hidden>` +
      '<p></p><button type="button">Restart game</button>';

    document.body.append(over);

    over.querySelector('button').addEventListener(
      'click',
      reset,
      opts
    );

    resize();
    reset();

    onStateChange(true);

    window.addEventListener('resize', resize, opts);

    window.addEventListener('keydown', e => {
      if (
        editable(e.target) ||
        ended ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) return;

      if (
        e.target.closest('button,a') &&
        e.code === 'Space'
      ) return;

      const controls = [
        'ArrowLeft',
        'ArrowRight',
        'KeyA',
        'KeyD',
        'Space',
        'ArrowUp',
        'ArrowDown',
        'KeyW',
        'KeyS'
      ];

      if (!controls.includes(e.code)) return;

      e.preventDefault();
      keys.add(e.code);

      if (
        ['ArrowDown', 'KeyS'].includes(e.code) &&
        !e.repeat &&
        grounded
      ) {
        player.y += 3;
        player.vy = 80;
        grounded = false;
      }

      if (
        ['Space', 'ArrowUp', 'KeyW'].includes(e.code) &&
        !e.repeat &&
        grounded
      ) {
        player.vy = -CONFIG.jump;
        grounded = false;
      }
    }, opts);

    window.addEventListener(
      'keyup',
      e => keys.delete(e.code),
      opts
    );

    window.addEventListener('blur', () => {
      keys.clear();
      last = 0;
    }, opts);

    document.addEventListener(
      'focusin',
      () => keys.clear(),
      opts
    );

    document.addEventListener('visibilitychange', () => {
      keys.clear();
      last = 0;

      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    }, opts);


  }

  function disable() {
    if (!active) return;

    active = false;
    abort.abort();

    cancelAnimationFrame(raf);
    raf = 0;

    canvas.remove();
    hud.remove();
    over.remove();

    bears = [];
    candles = [];
    particles = [];

    keys.clear();

    onStateChange(false);
  }

  return {
    enable,
    disable,
    toggle() { if (active) disable(); else enable(); },
    destroy() { disable(); }
  };
}
