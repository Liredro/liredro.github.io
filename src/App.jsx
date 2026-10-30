import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Ticker from './components/Ticker.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Footer from './components/Footer.jsx';
import { createBullBearGame } from './game/bullBearEngine.js';

export default function App() {
  const engineRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    const engine = createBullBearGame({ onStateChange: setGameActive });
    engineRef.current = engine;
    return () => { engine.destroy(); engineRef.current = null; };
  }, []);

  const play = useCallback(() => {
    engineRef.current?.enable();
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  }, []);

  return <>
    <Ticker/>
    <Navbar/>
    <div className="game-mode-bar" aria-label="Game controls">
      <button className="bb-toggle" type="button" aria-pressed={gameActive} onClick={() => engineRef.current?.toggle()}>{`GAME MODE: ${gameActive ? 'ON' : 'OFF'}`}</button>
    </div>
    <Hero/>
    <About/>
    <Projects onPlay={play}/>
    <Footer/>
  </>;
}
