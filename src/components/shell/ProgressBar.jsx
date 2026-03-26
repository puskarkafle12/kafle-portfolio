export function ProgressBar({ progress }) {
  return (
    <div className="progress-track" aria-hidden="true">
      <span style={{ width: `${progress}%` }} />
    </div>
  )
}
