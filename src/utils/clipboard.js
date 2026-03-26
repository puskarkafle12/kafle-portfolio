/**
 * Copies text to the clipboard with a fallback for older browsers.
 * @returns {Promise<boolean>} whether the copy likely succeeded
 */
export async function copyTextToClipboard(value) {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
    const textArea = document.createElement('textarea')
    textArea.value = value
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textArea)
    return ok
  } catch {
    return false
  }
}
