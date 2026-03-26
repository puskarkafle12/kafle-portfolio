import portfolioLogo from '@/assets/portfolio-logo.svg'
import { GitHubIcon, LinkedInIcon } from '@/components/icons/BrandIcons.jsx'
import { GITHUB_URL, LINKEDIN_URL, RESUME_FILENAME } from '@/config/site.js'

const resumeHref = `${import.meta.env.BASE_URL}${RESUME_FILENAME}`

export function SiteHeader({
  showContent,
  theme,
  onToggleTheme,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  activeSection,
  onResumeDownload,
}) {
  return (
    <header className={`site-header ${showContent ? 'content-visible' : ''}`}>
      <div className="topbar">
        <div className="nav-left">
          <a href="#home" className="brand" aria-label="Portfolio home">
            <img src={portfolioLogo} alt="" width={37} height={37} />
          </a>
          <div className="brand-copy">
            <strong>Puskar Kafle</strong>
            <span>Software Engineer</span>
          </div>
        </div>
        <button
          className={menuOpen ? 'menu-toggle is-open' : 'menu-toggle'}
          onClick={onToggleMenu}
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          <a
            href="#home"
            className={activeSection === 'home' ? 'active' : ''}
            onClick={onCloseMenu}
          >
            Home
          </a>
          <a
            href="#summary"
            className={activeSection === 'summary' ? 'active' : ''}
            onClick={onCloseMenu}
          >
            Profile
          </a>
          <a
            href="#experience"
            className={activeSection === 'experience' ? 'active' : ''}
            onClick={onCloseMenu}
          >
            Experience
          </a>
          <a
            href="#projects"
            className={activeSection === 'projects' ? 'active' : ''}
            onClick={onCloseMenu}
          >
            Projects
          </a>
          <a
            href="#skills"
            className={activeSection === 'skills' ? 'active' : ''}
            onClick={onCloseMenu}
          >
            Skills
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-social"
            aria-label="LinkedIn"
            onClick={onCloseMenu}
          >
            <LinkedInIcon />
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="nav-social"
            aria-label="GitHub"
            onClick={onCloseMenu}
          >
            <GitHubIcon />
          </a>
          <a
            href={resumeHref}
            className="nav-download"
            onClick={(e) => {
              onResumeDownload(e)
              onCloseMenu()
            }}
          >
            Download CV
          </a>
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle light and dark mode"
            title="Toggle theme"
          >
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </nav>
      </div>
    </header>
  )
}
