import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons.jsx';

export default function Navbar() {
  return <nav className="site-nav" aria-label="Main navigation">
    <div className="site-nav__sections"><a href="#about">Bio</a><a href="#projects">Projects</a></div>
    <div className="site-nav__contacts">
      <a className="contact-link" href="https://github.com/Liredro" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><GitHubIcon/></a>
      <a className="contact-link" href="https://www.linkedin.com/in/liana-mariamova/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><LinkedInIcon/></a>
      <a className="contact-link" href="mailto:layonears@gmail.com" aria-label="Email" title="Email"><MailIcon/></a>
    </div>
  </nav>;
}
