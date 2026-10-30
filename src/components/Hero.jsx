import { useEffect, useRef } from 'react';
import { setupChart } from '../effects/chart.js';
import { asset } from '../utils.js';

export default function Hero() {
  const canvasRef = useRef(null);
  useEffect(() => setupChart(canvasRef.current), []);

  return <main className="stage" id="top">
    <div className="corner-mark">LIANA <span aria-hidden="true">/</span> PORTFOLIO 001</div>
    <div className="hero">
      <div className="chart" aria-label="Continuously scrolling abstract financial line chart with an overall upward trajectory." role="img">
        <canvas id="growth-chart" ref={canvasRef} aria-hidden="true"/>
        <div className="chart__tag">FIG. 01 <span>↗</span><br/>ALWAYS GROWING</div>
        <div className="chart__axis">HIGH</div>
        <div className="chart__axis chart__axis--bottom">LOW</div>
      </div>
      <section className="intro" aria-labelledby="intro-heading">
        <div className="intro__kicker">Finance × Technology</div>
        <div className="intro-title">
          <h1 id="intro-heading"><span className="line">Hey,</span><span className="name">Liana <span className="white-text">here.<span aria-hidden="true"/></span></span></h1>
          <img className="intro-avatar" src={asset('assets/images/profile/pixel-liana.gif')} alt="Pixel-art portrait of Liana" decoding="async"/>
        </div>
        <p className="intro__copy">I enjoy building projects and understanding how systems work, why they work, and how to make them better.</p>
        <div className="intro__line" aria-hidden="true"/>
      </section>
    </div>
    <div className="footnote"><span className="footnote__right">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div>
  </main>;
}
