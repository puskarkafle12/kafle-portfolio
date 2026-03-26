import { useMemo, useState } from 'react'
import { GITHUB_URL, LINKEDIN_URL } from '@/config/site.js'
import { getPortfolioQrUrl, getResumeAssetUrl } from '@/utils/urls.js'

export function useQrContent() {
  const [activeQr, setActiveQr] = useState('resume')

  const resumeQrValue = useMemo(
    () => (typeof window === 'undefined' ? '' : getResumeAssetUrl()),
    [],
  )
  const portfolioQrValue = useMemo(
    () => (typeof window === 'undefined' ? '' : getPortfolioQrUrl()),
    [],
  )

  const qrByKind = useMemo(
    () => ({
      resume: {
        eyebrow: 'Resume PDF',
        heading: 'Scan to download',
        description:
          'Point your camera at the code to open or save the latest Resume PDF on your phone.',
        hint: 'Links to the PDF hosted on this site.',
        value: resumeQrValue,
      },
      linkedin: {
        eyebrow: 'LinkedIn',
        heading: 'Scan for LinkedIn',
        description: 'Opens linkedin.com/in/puskarkafle — share your profile without typing the URL.',
        hint: 'Opens the LinkedIn profile in a browser.',
        value: LINKEDIN_URL,
      },
      github: {
        eyebrow: 'GitHub',
        heading: 'Scan for GitHub',
        description: 'Opens github.com/puskarkafle12 — jump straight to repos and contributions.',
        hint: 'Opens the GitHub profile in a browser.',
        value: GITHUB_URL,
      },
      portfolio: {
        eyebrow: 'This portfolio',
        heading: 'Scan for this site',
        description:
          'Share this portfolio URL in person — ideal for cards, posters, or event handouts.',
        hint: 'Opens this page in the browser.',
        value: portfolioQrValue || (typeof window !== 'undefined' ? window.location.href : ''),
      },
    }),
    [resumeQrValue, portfolioQrValue],
  )

  const currentQr = qrByKind[activeQr] ?? qrByKind.resume

  return { activeQr, setActiveQr, currentQr, qrByKind }
}
