import { CheckIcon, CopyIcon, GitHubIcon, LinkedInIcon } from '@/components/icons/BrandIcons.jsx'
import { GITHUB_URL, LINKEDIN_URL } from '@/config/site.js'
import { quickContactItems } from '@/data/portfolioContent.js'

export function ContactSection({ copiedField, onCopyField }) {
  return (
    <section id="contact" className="section reveal">
      <p className="section-label">Quick Links</p>
      <h2>Contact</h2>
      <p>Open to software engineering, machine learning, and AI platform opportunities.</p>
      <div className="contact-social-icons" aria-label="Social links">
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="LinkedIn">
          <LinkedInIcon />
        </a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="GitHub">
          <GitHubIcon />
        </a>
      </div>
      <div className="contact-copy-grid">
        {quickContactItems.map((item) => (
          <article className="contact-copy-card" key={item.id}>
            <p className="meta">{item.label}</p>
            <div className="contact-copy-row">
              <a
                className="contact-copy-value"
                href={item.href}
                target={item.id === 'linkedin' ? '_blank' : undefined}
                rel={item.id === 'linkedin' ? 'noreferrer' : undefined}
              >
                {item.value}
              </a>
              <button
                type="button"
                className="copy-btn"
                onClick={() => onCopyField(item.id, item.copyValue ?? item.value)}
                aria-label={copiedField === item.id ? 'Copied' : 'Copy to clipboard'}
              >
                {copiedField === item.id ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="contact-actions">
        <a href="mailto:puskarkafle2031@gmail.com" className="btn btn-primary">
          Email Me
        </a>
        <a href="tel:+18064419487" className="btn btn-ghost">
          Call: +1 (806) 441-9487
        </a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
          LinkedIn
        </a>
      </div>
    </section>
  )
}
