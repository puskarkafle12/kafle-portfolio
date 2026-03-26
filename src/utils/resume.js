import { RESUME_FILENAME } from '@/config/site.js'
import { getResumeAssetUrl } from '@/utils/urls.js'

export async function downloadResumePdf(event) {
  event?.preventDefault()
  const url = getResumeAssetUrl()
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Download failed')
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = RESUME_FILENAME
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 2500)
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
