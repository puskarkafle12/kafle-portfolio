export function SkillsSection() {
  return (
    <section id="skills" className="section reveal">
      <p className="section-label">Capabilities</p>
      <h2>Core Skills</h2>
      <div className="skills-grid">
        <article>
          <h3>Machine Learning</h3>
          <p>PyTorch, TensorFlow, scikit-learn, CNN, RNN, GAN, NLP</p>
        </article>
        <article>
          <h3>Data & Backend</h3>
          <p>PySpark, Pandas, Flask, FastAPI, MongoDB, MySQL</p>
        </article>
        <article>
          <h3>Cloud & Infra</h3>
          <p>AWS Glue, EC2, S3, ETL pipelines, vector databases</p>
        </article>
      </div>
    </section>
  )
}
