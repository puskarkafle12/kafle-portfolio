import { useEffect, useState } from 'react'

const DEFAULT_SECTION_IDS = ['home', 'summary', 'experience', 'projects', 'skills', 'contact']

export function useActiveSection(sectionIds = DEFAULT_SECTION_IDS) {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const sectionElements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.2, 0.5, 0.8] },
    )

    sectionElements.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [sectionIds])

  return [activeSection, setActiveSection]
}
