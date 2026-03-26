import { RESUME_FILENAME } from '@/config/site.js'

export function getResumeAssetUrl() {
  return new URL(`${import.meta.env.BASE_URL}${RESUME_FILENAME}`, window.location.href).href
}

export function getPortfolioQrUrl() {
  if (typeof window === 'undefined') return ''
  const { origin, pathname, hash } = window.location
  const path = pathname.replace(/\/index\.html?$/i, '') || '/'
  return `${origin}${path}${hash || ''}`
}
