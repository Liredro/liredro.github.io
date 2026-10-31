import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { projects } from '../src/data/projects.js';
import { quotes } from '../src/data/ticker.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = name => readFileSync(resolve(root, name), 'utf8');
test('all project IDs are unique and every project has accessible content', () => {
  assert.equal(new Set(projects.map(item => item.id)).size, projects.length);
  for (const item of projects) {
    assert.ok(item.title && item.description);
    assert.ok(item.tags.length);
    assert.ok(item.image || item.comingSoon);
    for (const destination of [item.github, item.live].filter(Boolean)) {
      assert.equal(new URL(destination).protocol, 'https:');
    }
  }
});
test('Bull vs Bear card has a play action and Github source', () => {
  const game = projects.find(item => item.id === 'bull-bear');
  assert.ok(game?.play);
  assert.match(game.github, /^https:\/\/github\.com\//);
  assert.match(file('src/components/Projects.jsx'), /onClick=\{onPlay\}/);
});
test('all required React components and visual effects exist', () => {
  for (const name of ['Ticker', 'Navbar', 'Hero', 'About', 'Projects', 'Footer']) {
    assert.ok(existsSync(resolve(root, `src/components/${name}.jsx`)));
  }
  for (const name of ['chart', 'binaryRain', 'pixelPortrait']) {
    assert.ok(existsSync(resolve(root, `src/effects/${name}.js`)));
  }
});
test('the ticker is illustrative and consistently duplicated for seamless animation', () => {
  assert.equal(quotes.length, 10);
  assert.match(file('src/components/Ticker.jsx'), /<TapeSet\/><TapeSet\/>/);
});
test('no inline JavaScript event handlers or dangerous HTML sinks in React UI', () => {
  const paths = ['src/App.jsx', 'src/components/Navbar.jsx', 'src/components/Projects.jsx', 'src/components/About.jsx'];
  for (const path of paths) {
    const content = file(path);
    assert.doesNotMatch(content, /dangerouslySetInnerHTML/);
    assert.doesNotMatch(content, /\bonclick\s*=|\bonerror\s*=/);
  }
});
test('production build injects a restrictive content security policy', () => {
  const config = file('vite.config.js');
  assert.match(config, /production-csp/);
  assert.match(config, /script-src 'self' https:\/\/static\.cloudflareinsights\.com https:\/\/cloud\.umami\.is/);
  assert.match(config, /connect-src 'self' https:\/\/cloudflareinsights\.com https:\/\/gateway\.umami\.is https:\/\/cloud\.umami\.is/);
  assert.match(config, /object-src 'none'/);
});
test('Umami is installed and key project actions are tracked', () => {
  assert.match(file('index.html'), /cloud\.umami\.is\/script\.js/);
  assert.match(file('index.html'), /d97caaf9-c114-4de2-9837-f3f59fa68c5c/);
  const project = file('src/components/Projects.jsx');
  assert.match(project, /project-live-/);
  assert.match(project, /project-github-/);
  assert.match(project, /game-launch/);
});
test('portrait slider tracks one completed interaction with direction data', () => {
  const about = file('src/components/About.jsx');
  assert.match(about, /portrait-slider-used/);
  assert.match(about, /direction: end > start \? 'sharp' : 'pixelated'/);
  assert.match(about, /onPointerDown=/);
  assert.match(about, /onPointerUp=\{finishPointer\}/);
  assert.match(about, /onKeyUp=/);
  assert.match(about, /start === null \|\| start === end/);
});

test('game module exports its mount API and has a base-safe prize URL', () => {
  const source = file('src/game/bullBearEngine.js');
  assert.match(source, /export function createBullBearGame/);
  assert.match(source, /onStateChange\(true\)/);
  assert.match(source, /onStateChange\(false\)/);
  assert.match(source, /import\.meta\.env\.BASE_URL/);
});
