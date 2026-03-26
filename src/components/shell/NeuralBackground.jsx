import { useNeuralCanvas } from '@/hooks/useNeuralCanvas.js'

export function NeuralBackground({ theme, showContent }) {
  const { neuralCanvasRef, neuralContainerRef } = useNeuralCanvas(theme, showContent)

  return (
    <div className="neural-network-bg" aria-hidden="true" ref={neuralContainerRef}>
      <canvas ref={neuralCanvasRef} className="ann-canvas" />
      <div className="neural-cursor-glow" />
    </div>
  )
}
