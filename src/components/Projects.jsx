import { useCallback, useEffect, useRef, useState } from 'react';
import { projects } from '../data/projects.js';
import { asset } from '../utils.js';
import { GitHubIcon, OpenIcon } from './Icons.jsx';

function ProjectLink({ href, label, eventName, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} data-umami-event={eventName}>{children}</a>;
}
function ProjectCard({ project, index, onPlay }) {
  return <article className="project-card">
    <div className="project-card__top"><span className="project-card__index">P / {String(index + 1).padStart(3, '0')}</span>{project.comingSoon && <span className="project-card__status">COMING</span>}</div>
    {project.image ? <div className="project-art project-art--image"><img src={asset(`assets/images/projects/${project.image}`)} alt={project.imageAlt} loading="lazy"/></div>
      : <div className="project-art" aria-hidden="true"><span>01</span><small>MARKETS / SIM</small><i/><i/><i/></div>}
    <h3>{project.title}</h3><p>{project.description}</p>
    <div className="project-card__footer">
      <div className="project-card__tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      <div className="project-card__links">
        {project.github && <ProjectLink href={project.github} label={`View ${project.title} on GitHub`} eventName={`project-github-${project.id}`}><GitHubIcon/></ProjectLink>}
        {project.live && <ProjectLink href={project.live} label={`Open ${project.title} live demo`} eventName={`project-live-${project.id}`}><OpenIcon/></ProjectLink>}
        {project.play && onPlay && <button type="button" onClick={onPlay} data-umami-event="game-launch" aria-label="Play Bull vs Bear game" title="Play Bull vs Bear"><OpenIcon/></button>}
      </div>
    </div>
  </article>;
}
export default function Projects({ onPlay }) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cards = [...el.querySelectorAll('.project-card')];
    if (!cards.length) return;
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const ended = el.scrollLeft >= max - 2;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(ended);
    setCurrent(ended ? cards.length : Math.min(cards.length, Math.round(el.scrollLeft / Math.max(1, step)) + 1));
  }, []);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    observer?.observe(el);
    window.addEventListener('resize', update);
    update();
    return () => { observer?.disconnect(); window.removeEventListener('resize', update); };
  }, [update]);
  const move = direction => {
    const el = trackRef.current;
    const cards = [...el.querySelectorAll('.project-card')];
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <section className="content-section projects-section" id="projects" aria-labelledby="projects-title">
    <div className="section-heading"><p className="section-heading__eyebrow"><span className="section-number">02 /</span> THINGS I&apos;M EXPLORING</p><h2 id="projects-title">Projects<span className="heading-full-stop">.</span></h2><p>Research, code and experiments.</p></div>
    <div className="project-controls"><span className="project-controls__hint">EXPLORE THE PROJECTS <span aria-hidden="true">→</span></span><div className="project-controls__buttons">
      <span id="project-position" aria-live="polite" aria-atomic="true">{String(current).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
      <button type="button" id="project-prev" aria-label="Previous project" aria-controls="project-track" disabled={atStart} data-umami-event="projects-carousel-previous" onClick={() => move(-1)}>←</button>
      <button type="button" id="project-next" aria-label="Next project" aria-controls="project-track" disabled={atEnd} data-umami-event="projects-carousel-next" onClick={() => move(1)}>→</button>
    </div></div>
    <div className="projects-grid" id="project-track" tabIndex="0" role="region" aria-label="Projects. Use left and right arrow keys or swipe to browse." ref={trackRef} onScroll={update} onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    }}>
      {projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onPlay={onPlay}/>)}
    </div>
  </section>;
}
