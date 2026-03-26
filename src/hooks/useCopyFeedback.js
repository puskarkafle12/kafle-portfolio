import { useState, useCallback } from 'react'
import { copyTextToClipboard } from '@/utils/clipboard.js'

export function useCopyFeedback(clearAfterMs = 1500) {
  const [copiedField, setCopiedField] = useState('')

  const copy = useCallback(
    async (id, value) => {
      const ok = await copyTextToClipboard(value)
      if (ok) {
        setCopiedField(id)
        window.setTimeout(() => setCopiedField(''), clearAfterMs)
      } else {
        setCopiedField('')
      }
    },
    [clearAfterMs],
  )

  return { copiedField, copy }
}
