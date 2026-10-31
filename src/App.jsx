import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Ticker from './components/Ticker.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Footer from './components/Footer.jsx';

// Disable the keyboard-only game on narrow screens and touch-first devices.
// Desktop players retain the full original game.
const NO_GAME_QUERY = '(max-width: 767px), (hover: none) and (pointer: coarse)';

export default function App() {
  const engineRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [hideGame, setHideGame] = useState(() => window.matchMedia(NO_GAME_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(NO_GAME_QUERY);
    const sync = () => setHideGame(media.matches);
    media.addEventListener('change', sync);
    sync();
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (hideGame) return;
    let cancelled = false;
    // Don't even download the game engine on mobile.
    import('./game/bullBearEngine.js').then(({ createBullBearGame }) => {
      if (!cancelled) {
        engineRef.current = createBullBearGame({ onStateChange: setGameActive });
      }
    });

    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [hideGame]);

  const play = useCallback(() => {
    if (window.matchMedia(NO_GAME_QUERY).matches) return;
    engineRef.current?.enable();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, []);

  const toggle = useCallback(() => {
    if (window.matchMedia(NO_GAME_QUERY).matches || !engineRef.current) return;
    // One event per click, identifying the intended new game state.
    // Do not send analytics for a toggle if the game engine is unavailable.
    const action = gameActive ? 'off' : 'on';
    engineRef.current.toggle();
    window.umami?.track?.('game-mode-toggle', { action });
  }, [gameActive]);

  return <>
    <Ticker/>
    <Navbar/>
    {!hideGame && <div className="game-mode-bar" aria-label="Game controls">
      <button className="bb-toggle" type="button" aria-pressed={gameActive} onClick={toggle}>{`GAME MODE: ${gameActive ? 'ON' : 'OFF'}`}</button>
    </div>}
    <Hero/>
    <About/>
    <Projects onPlay={hideGame ? null : play}/>
    <Footer/>
  </>;
}
