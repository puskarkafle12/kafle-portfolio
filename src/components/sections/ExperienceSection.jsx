import { useMemo, useState } from 'react'
import { timelineData } from '@/data/portfolioContent.js'

const TABS = [
  { id: 'work', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certification', label: 'Certifications' },
]

function typeLabel(type) {
  if (type === 'work') return 'Work'
  if (type === 'education') return 'Education'
  return 'Certification'
}

export function ExperienceSection() {
  const [activeTab, setActiveTab] = useState('work')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return timelineData.filter((item) => {
      if (item.type !== activeTab) return false
      if (!value) return true
      const hay = `${item.title} ${item.org} ${item.location} ${item.stack} ${item.bullets.join(' ')}`
        .toLowerCase()
      return hay.includes(value)
    })
  }, [activeTab, query])

  return (
    <section id="experience" className="section reveal">
      <div className="section-head">
        <div>
          <p className="section-label">Career</p>
          <h2>Experience & Education</h2>
        </div>
        <input
          type="search"
          placeholder="Search roles, schools, skills…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter experience and education"
        />
      </div>

      <div className="tabs" role="tablist" aria-label="Timeline category">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="timeline">
        {filtered.length === 0 ? (
          <p className="empty">No entries match your search.</p>
        ) : (
          filtered.map((item, idx) => (
            <article className="card" key={`${item.org}-${item.date}-${idx}`}>
              <p className="meta">{typeLabel(item.type)}</p>
              <h3>{item.title}</h3>
              <p className="org">{item.org}</p>
              <p className="resume-qr-blurb">
                {item.location} · {item.date}
              </p>
              <ul>
                {item.bullets.map((bullet, bi) => (
                  <li key={bi}>{bullet}</li>
                ))}
              </ul>
              <p className="stack">{item.stack}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
