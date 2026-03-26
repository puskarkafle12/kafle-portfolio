import { HeroQrCard } from '@/components/sections/HeroQrCard.jsx'
import { LINKEDIN_URL, RESUME_FILENAME } from '@/config/site.js'
import { downloadResumePdf } from '@/utils/resume.js'

const resumeHref = `${import.meta.env.BASE_URL}${RESUME_FILENAME}`

export function HeroSection({ theme }) {
  return (
    <section id="home" className="hero reveal">
      <p className="eyebrow">Professional Portfolio</p>
      <h1>Puskar Kafle</h1>
      <p className="lead">
        Software Engineer and AI practitioner building production-grade data systems, machine learning workflows, and
        scalable backend services.
      </p>
      <div className="contact-strip">
        <span>Prairie View, TX</span>
        <span>+1 (806) 441-9487</span>
        <a href="mailto:puskarkafle2031@gmail.com">puskarkafle2031@gmail.com</a>
        <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">
          linkedin.com/in/puskarkafle
        </a>
      </div>
      <div className="hero-actions">
        <a href={resumeHref} className="btn btn-primary" onClick={downloadResumePdf}>
          Download Resume
        </a>
        <a href="#contact" className="btn btn-ghost">
          Hire Me
        </a>
      </div>
      <HeroQrCard theme={theme} />
      <div className="kpi-row">
        <article>
          <h3>4+ Years</h3>
          <p>Professional software development experience</p>
        </article>
        <article>
          <h3>AI + Data</h3>
          <p>Production ML, ETL, NLP, and backend automation</p>
        </article>
        <article>
          <h3>Global Work</h3>
          <p>Engineering and research across Nepal and the U.S.</p>
        </article>
      </div>
    </section>
  )
}
