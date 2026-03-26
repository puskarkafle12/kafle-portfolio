import { useEffect } from 'react'

/** Drives `--mx` / `--my` for `.neural-cursor-glow` */
export function usePointerGlow() {
  useEffect(() => {
    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty('--mx', `${x}%`)
      document.documentElement.style.setProperty('--my', `${y}%`)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])
}
