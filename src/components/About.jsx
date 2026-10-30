import { useEffect, useRef, useState } from 'react';
import { setupBinaryRain } from '../effects/binaryRain.js';
import { setupPixelPortrait } from '../effects/pixelPortrait.js';
import { asset } from '../utils.js';

const skills = ['Valuation', 'Financial Modelling', 'Accounting', 'Microsoft Excel', 'SQL', 'Python', 'JavaScript'];

export default function About() {
  const sectionRef = useRef(null);
  const binaryRef = useRef(null);
  const photoRef = useRef(null);
  const pixelRef = useRef(null);
  const [clarity, setClarity] = useState(65);

  useEffect(() => setupBinaryRain(sectionRef.current, binaryRef.current), []);
  useEffect(() => setupPixelPortrait(photoRef.current, pixelRef.current, clarity), [clarity]);

  return <section className="content-section about-section" id="about" aria-labelledby="about-title" ref={sectionRef}>
    <canvas className="binary-rain" ref={binaryRef} aria-hidden="true"/>
    <figure className="portrait">
      <div className="portrait-image">
        <img id="portrait-source" ref={photoRef} src={asset('assets/images/profile/portrait.webp')} alt="Liana wearing a black suit" width="1504" height="1718" loading="lazy" decoding="async"/>
        <canvas id="portrait-pixels" ref={pixelRef} aria-hidden="true" hidden={clarity === 100}/>
      </div>
      <figcaption className="portrait-controls">
        <div className="portrait-controls__label"><label htmlFor="portrait-quality">IMAGE CLARITY</label><output id="portrait-quality-value" htmlFor="portrait-quality">{clarity}%</output></div>
        <input id="portrait-quality" type="range" min="0" max="100" step="1" value={clarity} onChange={event => setClarity(Number(event.target.value))} aria-valuetext={clarity === 100 ? '100 percent, original sharp photo' : `${clarity} percent clarity`} aria-describedby="portrait-quality-hint"/>
        <div className="portrait-controls__ends" id="portrait-quality-hint"><span>PIXELATED</span><span>SHARP</span></div>
      </figcaption>
    </figure>
    <div className="about-copy">
      <div className="section-heading"><p className="section-heading__eyebrow"><span className="section-number">01 /</span> A LITTLE ABOUT ME</p><h2 id="about-title">Beyond the<br/>numbers<span className="heading-full-stop">.</span></h2></div>
      <p>I combine financial analysis with technology to understand businesses, build valuation models and develop practical tools.</p>
      <p>My work spans equity research, financial modelling and software development, turning complex data into clear insights and ideas into working projects.</p>
      <p>I am always open to new ideas and opportunities. So, if you have something in mind, get in touch!</p>
      <div className="about-skills" id="skills" aria-labelledby="skills-title"><h3 id="skills-title">WHAT I WORK WITH</h3><ul className="skill-list" aria-label="Skills">{skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>
    </div>
  </section>;
}
