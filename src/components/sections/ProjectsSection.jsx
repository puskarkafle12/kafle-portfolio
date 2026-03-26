import { featuredProjects } from '@/data/portfolioContent.js'

export function ProjectsSection() {
  return (
    <section id="projects" className="section reveal">
      <div className="section-head">
        <p className="section-label">Portfolio</p>
        <h2>Featured Projects & Research Work</h2>
      </div>
      <div className="grid">
        {featuredProjects.map((project) => (
          <article className={project.featured ? 'card project-card-featured' : 'card'} key={project.title}>
            <p className="meta">{project.featured ? 'Primary Project' : 'Project'}</p>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <p className="stack">{project.tech}</p>
            <a href={project.link} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
