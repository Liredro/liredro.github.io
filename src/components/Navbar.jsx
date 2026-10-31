import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons.jsx';

export default function Navbar() {
  return <nav className="site-nav" aria-label="Main navigation">
    <div className="site-nav__sections">
      <a href="#about" data-umami-event="nav-bio">Bio</a>
      <a href="#projects" data-umami-event="nav-projects">Projects</a>
    </div>
    <div className="site-nav__contacts">
      <a className="contact-link" href="https://github.com/Liredro" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub" data-umami-event="contact-github"><GitHubIcon/></a>
      <a className="contact-link" href="https://www.linkedin.com/in/liana-mariamova/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn" data-umami-event="contact-linkedin"><LinkedInIcon/></a>
      <a className="contact-link" href="mailto:layonears@gmail.com" aria-label="Email" title="Email" data-umami-event="contact-email"><MailIcon/></a>
    </div>
  </nav>;
}
