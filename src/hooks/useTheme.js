import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const initial = saved === 'dark' ? 'dark' : 'light'
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', initial)
      }
      return initial
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return [theme, setTheme]
}
