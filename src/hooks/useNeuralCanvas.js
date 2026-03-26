import { useEffect, useRef } from 'react'

/**
 * Full-viewport ANN canvas: feed-forward / backprop visualization for intro and page background.
 */
export function useNeuralCanvas(theme, showContent) {
  const neuralCanvasRef = useRef(null)
  const neuralContainerRef = useRef(null)

  useEffect(() => {
    const canvas = neuralCanvasRef.current
    const container = neuralContainerRef.current
    if (!canvas || !container) return undefined
  
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
  
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isLight = theme === 'light'
    const maxDpr = Math.min(window.devicePixelRatio || 1, 2)
    const cpu = navigator.hardwareConcurrency || 6
    const lowPower = cpu <= 4 || prefersReducedMotion
  
    let width = 0
    let height = 0
    let frameId = 0
    let tick = 0
    // Intro (feed-forward only) should finish quickly so content feels instant.
    const slowFactor = showContent ? 4.8 : 0.55
    const layerDelayMs = (lowPower ? 240 : 180) * slowFactor
    const edgeTravelMs = (lowPower ? 320 : 260) * slowFactor
    const layerPulseWindowMs = (lowPower ? 250 : 210) * slowFactor
    const pointer = { x: 0.5, y: 0.5, active: false }
    const ripples = []
    const particles = []
    let nodes = []
    let edges = []
    let droppedNodes = new Set()
    let passStart = 0
    let passId = 0
    let outputLayerIndex = 0
    let introLocked = false
    // Backprop should be a consistent “red” family, but slightly different per theme.
    const backPropRed = isLight ? { r: 239, g: 68, b: 68 } : { r: 244, g: 114, b: 182 }
    let forwardPalette = null

    const hslToRgb = (h, s, l) => {
      // h: 0..360, s/l: 0..100
      const ss = s / 100
      const ll = l / 100
      const c = (1 - Math.abs(2 * ll - 1)) * ss
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = ll - c / 2
      let r1 = 0
      let g1 = 0
      let b1 = 0

      if (h < 60) {
        r1 = c
        g1 = x
      } else if (h < 120) {
        r1 = x
        g1 = c
      } else if (h < 180) {
        g1 = c
        b1 = x
      } else if (h < 240) {
        g1 = x
        b1 = c
      } else if (h < 300) {
        r1 = x
        b1 = c
      } else {
        r1 = c
        b1 = x
      }

      return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
      }
    }

    const createForwardPalette = () => {
      // Fixed forward palette per theme (no per-pass randomness).
      // Kept away from red/orange hues.
      const baseHue = isLight ? 205 : 235 // forward: 185..270-ish with offsets below

      const fwdHigh = hslToRgb(baseHue + 35, 85, 55)
      const fwdMid = hslToRgb(baseHue + 15, 90, 55)
      const fwdLow = hslToRgb(baseHue - 20, 90, 50)
      const fwdBase = hslToRgb(baseHue + 5, 85, 62)
      const layer0Start = hslToRgb(baseHue + 10, 85, 52)
      const layer0End = hslToRgb(baseHue - 10, 85, 65)
      const edgeRGB = fwdMid
      const particleRGB = fwdBase

      return {
        fwdHigh,
        fwdMid,
        fwdLow,
        fwdBase,
        layer0Start,
        layer0End,
        edgeRGB,
        particleRGB,
      }
    }

    forwardPalette = createForwardPalette()
    const textParticles = []
    const neuronRings = []
    let lastNow = performance.now()
    const hoverBreakStreaks = []
  
    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * maxDpr)
      canvas.height = Math.floor(height * maxDpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(maxDpr, 0, 0, maxDpr, 0, 0)
  
      const baseLayers = width < 680 ? 6 : width < 1100 ? 8 : 10
      const layers = Array.from({ length: baseLayers }, (_, layer) => {
        if (layer === baseLayers - 1) return width < 680 ? 3 : 4
        const t = layer / Math.max(1, baseLayers - 1)
        const base = width < 680 ? 7 : 10
        return Math.round(base + Math.sin(t * Math.PI) * (lowPower ? 4 : 9))
      })
      outputLayerIndex = layers.length - 1

      nodes = []
      const layerIndexes = []
      layers.forEach((count, layer) => {
        const x = 70 + (layer * (width - 140)) / Math.max(1, layers.length - 1)
        const gap = (height - 120) / Math.max(1, count - 1)
        const ids = []
        for (let i = 0; i < count; i += 1) {
          const depth = 0.4 + Math.random() * 0.9
          const y = 60 + i * gap + ((i + layer) % 2 === 0 ? 1 : -1) * 8
          const idx = nodes.length
          nodes.push({
            x,
            y,
            z: depth,
            r: 1.8 + depth * 1.6,
            layer,
            i,
            total: count,
            activation: 0,
            history: 0,
            historyMode: 'fwd',
            noise: Math.random(),
            lastNumericPass: -1,
          })
          ids.push(idx)
        }
        layerIndexes.push(ids)
      })
  
      edges = []
      for (let layer = 0; layer < layerIndexes.length - 1; layer += 1) {
        const left = layerIndexes[layer]
        const right = layerIndexes[layer + 1]
        left.forEach((fromIdx) => {
          right.forEach((toIdx) => {
            edges.push({
              from: fromIdx,
              to: toIdx,
              layer,
              gate: Math.random(),
              history: 0,
              historyMode: 'fwd',
            })
          })
        })
      }
  
      particles.length = 0
      hoverBreakStreaks.length = 0
      const particleCount = lowPower ? 24 : 56
      for (let i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: 0.2 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
        })
      }
    }
  
    // Fully-connected network (no dropout concept for intro/portfolio animation).
    const rerollDropout = () => {
      droppedNodes = new Set()
    }
  
    const draw = () => {
      tick += 1
      const now = performance.now()
      const dt = Math.min(0.06, (now - lastNow) / 1000)
      lastNow = now
      let cycleElapsed = now - passStart
      const introForwardOnly = !showContent
      const forwardFinishMs = outputLayerIndex * layerDelayMs + layerPulseWindowMs
      const backBufferMs = layerDelayMs * 0.35
      const backStartMs = introForwardOnly ? Number.POSITIVE_INFINITY : forwardFinishMs + backBufferMs
      const backFinishMs = introForwardOnly ? Number.POSITIVE_INFINITY : backStartMs + outputLayerIndex * layerDelayMs + layerPulseWindowMs
      const cycleMsEffective = introForwardOnly ? forwardFinishMs + layerDelayMs * 0.15 : backFinishMs + layerDelayMs * 0.4
  
      if (cycleElapsed >= cycleMsEffective) {
        if (introForwardOnly) {
          if (!introLocked) {
            introLocked = true
          }
          cycleElapsed = cycleMsEffective
        } else {
          passStart = now
          passId += 1
          rerollDropout()
          cycleElapsed = 0
          neuronRings.length = 0
          textParticles.length = 0
        }
      }
      const cycleTime = cycleElapsed

      const inputNodeStaggerMs = Math.max(16, 30 * slowFactor) * (lowPower ? 1.05 : 1)

      const bgA = showContent
        ? isLight
          ? '#eef6ff'
          : '#04143a'
        : isLight
          ? '#f4f3ff'
          : '#030712'
      const bgB = showContent
        ? isLight
          ? '#dbeafe'
          : '#060f2a'
        : isLight
          ? '#eaeaff'
          : '#050b1a'
      const grad = ctx.createLinearGradient(0, 0, width, height)
      grad.addColorStop(0, bgA)
      grad.addColorStop(1, bgB)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
  
      const motionScale = showContent ? 0.35 : 1
      particles.forEach((p) => {
        p.x += p.vx * p.z * motionScale
        p.y += p.vy * p.z * motionScale
        if (p.x < -4) p.x = width + 4
        if (p.x > width + 4) p.x = -4
        if (p.y < -4) p.y = height + 4
        if (p.y > height + 4) p.y = -4
        const alpha = isLight ? 0.12 : 0.22
        ctx.fillStyle = isLight ? `rgba(99,102,241,${alpha * p.z})` : `rgba(56,189,248,${alpha * p.z})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 0.9 + p.z, 0, Math.PI * 2)
        ctx.fill()
      })
  
      const clamp01 = (v) => Math.max(0, Math.min(1, v))
      const dropoutFlickerMs = Math.max(200, layerDelayMs * 0.8)
      const dropoutPreMs = Math.min(dropoutFlickerMs, 240 * slowFactor)
      const pointerX = pointer.active ? pointer.x * width : 0
      const pointerY = pointer.active ? pointer.y * height : 0
  
      const layerBasePulseLocal = (local, windowMs) => {
        if (local < 0 || local > windowMs) return 0
        return Math.sin((local / windowMs) * Math.PI)
      }
  
      // Color mapping for hover "line break" streaks.
      // Forward colors rotate per pass; backprop is always red.
      const clamp01local = (v) => Math.max(0, Math.min(1, v))
      const lerpLocal = (a, b, t) => a + (b - a) * t
      const getNeuronBreakRGB = (node) => {
        const pulse = node.pulse ?? 0
        const history = node.history ?? 0
        const signal = Math.max(pulse, history)
        const mode = node.historyMode === 'back' ? 'back' : 'fwd'

        if (mode === 'back') return backPropRed

        if (node.layer === 0) {
          const t = clamp01local(signal)
          return {
            r: Math.round(lerpLocal(forwardPalette.layer0Start.r, forwardPalette.layer0End.r, t)),
            g: Math.round(lerpLocal(forwardPalette.layer0Start.g, forwardPalette.layer0End.g, t)),
            b: Math.round(lerpLocal(forwardPalette.layer0Start.b, forwardPalette.layer0End.b, t)),
          }
        }

        if (signal > 0.72) return forwardPalette.fwdHigh
        if (signal > 0.45) return forwardPalette.fwdMid
        if (signal > 0.18) return forwardPalette.fwdLow
        return forwardPalette.fwdBase
      }
  
      // 1) Node activations (feed-forward + color story + dropout)
      nodes.forEach((node, nodeIdx) => {
        const forwardLocalStart = node.layer * layerDelayMs
        let forwardLocal = cycleTime - forwardLocalStart
        if (node.layer === 0) forwardLocal -= node.i * inputNodeStaggerMs
        const forwardPulse = layerBasePulseLocal(forwardLocal, layerPulseWindowMs)
  
        const backLocal = cycleTime - backStartMs
        const nodeBackStart = (outputLayerIndex - node.layer) * layerDelayMs
        const backPulse = layerBasePulseLocal(backLocal - nodeBackStart, layerPulseWindowMs)
  
        const pulseMode = backPulse > forwardPulse ? 'back' : 'fwd'
        const pulse = Math.max(forwardPulse, backPulse)
        const noise = 0.78 + node.noise * 0.4
  
        const isDropped = droppedNodes.has(nodeIdx)
  
        // Closer to 1 = slower fade of prior layer activations (glow / “memory”)
        // Faster forward fade so it doesn't linger after the forward wave passes layers.
        const fwdHistoryDecay = showContent ? 0.992 : 0.988
        const backHistoryDecay = showContent ? 0.9996 : 0.99985
        if (!isDropped && pulse > 0.08) {
          const decay = pulseMode === 'back' ? backHistoryDecay : fwdHistoryDecay
          node.history = Math.max(node.history * decay, pulse)
          node.historyMode = pulseMode
        } else if (!isDropped) {
          const decay = node.historyMode === 'back' ? backHistoryDecay : fwdHistoryDecay
          node.history *= decay
        } else {
          node.history *= 0.9
        }
        let activation = isDropped ? 0 : clamp01(pulse * noise)
  
        // Mouse hover boosts glow locally (doesn't change direction)
        if (!isDropped && pointer.active && !lowPower) {
          const dx = pointerX - node.x
          const dy = pointerY - node.y
          const d = Math.hypot(dx, dy)
          if (d < 150) {
            const boost = 1 - d / 150
            activation = Math.max(activation, boost * boost * 0.95)
          }
        }
  
        node.activation = activation
        node.pulse = pulse
        node.pulseMode = pulseMode
        node.isDropped = isDropped
      })
  
      // 2) Edges + particles (feed-forward + backprop)
      edges.forEach((edge) => {
        const fromIdx = edge.from
        const toIdx = edge.to
        const from = nodes[fromIdx]
        const to = nodes[toIdx]
  
        const blocked = droppedNodes.has(fromIdx) || droppedNodes.has(toIdx)
  
        // Forward: left -> right (from -> to)
        const forwardStartAbs = edge.layer * layerDelayMs
        const forwardLocal = cycleTime - forwardStartAbs
        const forwardInFlight =
          forwardLocal >= 0 && forwardLocal <= edgeTravelMs && cycleTime <= forwardFinishMs && !blocked
        const forwardStrength = forwardInFlight
          ? layerBasePulseLocal(forwardLocal, edgeTravelMs) * edge.gate
          : 0
  
        // Backprop: right -> left (to -> from)
        const edgeBackStartAbs = backStartMs + (outputLayerIndex - (edge.layer + 1)) * layerDelayMs
        const backLocal = cycleTime - edgeBackStartAbs
        const backInFlight = backLocal >= 0 && backLocal <= edgeTravelMs && cycleTime >= backStartMs && !blocked
        const backStrength = backInFlight
          ? layerBasePulseLocal(backLocal, edgeTravelMs) * edge.gate
          : 0
  
        const edgeStrength = Math.max(forwardStrength, backStrength)
        const backDominant = backStrength > forwardStrength
        const fwdEdgeHistoryDecay = showContent ? 0.9922 : 0.9885
        const backEdgeHistoryDecay = showContent ? 0.9996 : 0.99995
        // Keep edge color based on the last strong propagation direction,
        // so backprop edges slowly fade away instead of snapping back immediately.
        if (!blocked && edgeStrength > 0.03) {
          edge.historyMode = backDominant ? 'back' : 'fwd'
        }
        const edgeMode = edge.historyMode === 'back' ? 'back' : 'fwd'
        const edgeHistoryDecay = edgeMode === 'back' ? backEdgeHistoryDecay : fwdEdgeHistoryDecay
        if (blocked) {
          edge.history *= 0.9
        } else {
          edge.history = Math.max(edge.history * edgeHistoryDecay, edgeStrength)
        }
        const edgeAlpha = blocked ? 0.008 : 0.01 + edge.history * 0.55

        const lineColor =
          edgeMode === 'back'
            ? `rgba(${backPropRed.r},${backPropRed.g},${backPropRed.b},${edgeAlpha})`
            : `rgba(${forwardPalette.edgeRGB.r},${forwardPalette.edgeRGB.g},${forwardPalette.edgeRGB.b},${edgeAlpha})`
  
        const segAx = from.x
        const segAy = from.y
        const segBx = to.x
        const segBy = to.y
  
        let didBreak = false
        if (!blocked && pointer.active && !lowPower && edgeAlpha > 0.04) {
          const abx = segBx - segAx
          const aby = segBy - segAy
          const abLen2 = abx * abx + aby * aby
          if (abLen2 > 0.0001) {
            const px = pointerX
            const py = pointerY
            const tClosest =
              ((px - segAx) * abx + (py - segAy) * aby) / abLen2
            const t = clamp01(tClosest)
            const cx = segAx + abx * t
            const cy = segAy + aby * t
            const dist = Math.hypot(px - cx, py - cy)
  
            const breakDistPx = isLight ? 26 : 24
            if (dist < breakDistPx) {
              didBreak = true
              const segLen = Math.sqrt(abLen2)
              const gapPx = 10 + edgeStrength * 34
              const gapHalf = Math.min(
                0.2,
                (gapPx / (segLen + 0.0001)) / 2,
              )
  
              const tStart = Math.max(0, t - gapHalf)
              const tEnd = Math.min(1, t + gapHalf)
              const xStart = segAx + abx * tStart
              const yStart = segAy + aby * tStart
              const xEnd = segAx + abx * tEnd
              const yEnd = segAy + aby * tEnd
  
              const fromSignal = Math.max(from.pulse ?? 0, from.history ?? 0)
              const toSignal = Math.max(to.pulse ?? 0, to.history ?? 0)
              const pickNode = fromSignal >= toSignal ? from : to
              const breakRGB = getNeuronBreakRGB(pickNode)
  
              const alpha = blocked ? 0.008 : edgeAlpha * 0.98
              ctx.strokeStyle = `rgba(${breakRGB.r},${breakRGB.g},${breakRGB.b},${alpha})`
              ctx.lineWidth = 0.26 + edge.history * 1.35
  
              ctx.beginPath()
              ctx.moveTo(segAx, segAy)
              ctx.lineTo(xStart, yStart)
              ctx.stroke()
  
              ctx.beginPath()
              ctx.moveTo(xEnd, yEnd)
              ctx.lineTo(segBx, segBy)
              ctx.stroke()
  
              if (tick - (edge.lastHoverBreakTick ?? -9999) > 14) {
                edge.lastHoverBreakTick = tick
  
                const midX = cx
                const midY = cy
                const perpX = -aby / segLen
                const perpY = abx / segLen
                const cross = (px - segAx) * aby - (py - segAy) * abx
                const sign = cross >= 0 ? 1 : -1
                const dirX = perpX * sign
                const dirY = perpY * sign
                const alongX = abx / segLen
                const alongY = aby / segLen
                const speed = 28 + edgeStrength * 120
  
                const streakCount = lowPower ? 3 : 5
                for (let s = 0; s < streakCount; s += 1) {
                  const alongJitter = (Math.random() - 0.5) * 16
                  const streakLen = 10 + edgeStrength * 30 + Math.random() * 14
                  hoverBreakStreaks.push({
                    x: midX,
                    y: midY,
                    vx: dirX * speed + alongX * alongJitter,
                    vy: dirY * speed + alongY * alongJitter,
                    t: 0,
                    life: 0.48 + Math.random() * 0.22,
                    col: breakRGB,
                    dirX,
                    dirY,
                    len: streakLen,
                    width: 1.0 + Math.random() * 1.0,
                  })
                }
              }
            }
          }
        }
  
        if (!didBreak) {
          ctx.strokeStyle = lineColor
          ctx.lineWidth = blocked ? 0.26 : 0.26 + edge.history * 1.35
          ctx.beginPath()
          ctx.moveTo(segAx, segAy)
          ctx.lineTo(segBx, segBy)
          ctx.stroke()
        }
  
        const drawParticleTrail = (dirFrom, dirTo, progress, strength, glow, fadePow = 2) => {
          for (let k = 0; k < 6; k += 1) {
            const t = clamp01(progress - k * 0.05)
            const x = dirFrom.x + (dirTo.x - dirFrom.x) * t
            const y = dirFrom.y + (dirTo.y - dirFrom.y) * t
            const fade = Math.pow(1 - k / 6, fadePow)
            const a = (0.05 + strength * 0.35) * fade
            ctx.fillStyle = `rgba(${glow[0]},${glow[1]},${glow[2]},${a})`
            ctx.shadowColor = `rgba(${glow[0]},${glow[1]},${glow[2]},${a})`
            ctx.shadowBlur = 14 * fade
            ctx.beginPath()
            ctx.arc(x, y, 1 + strength * 1.4 * fade, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.shadowBlur = 0
        }
  
        // Forward particle trail (left -> right)
        if (forwardInFlight && forwardStrength > 0.12 && !blocked) {
          const progress = forwardLocal / edgeTravelMs
          const glow = [
            forwardPalette.particleRGB.r,
            forwardPalette.particleRGB.g,
            forwardPalette.particleRGB.b,
          ]
          drawParticleTrail(from, to, progress, forwardStrength, glow, 1.7)
        }
  
        // Backprop particle trail (right -> left)
        if (backInFlight && backStrength > 0.12 && !blocked) {
          const progress = backLocal / edgeTravelMs
          const glow = [backPropRed.r, backPropRed.g, backPropRed.b]
          drawParticleTrail(to, from, progress, backStrength, glow, 1.35)
        }
      })
  
      // 2.5) Hover line-break streaks (rendered behind neuron circles)
      if (hoverBreakStreaks.length > 0) {
        for (let i = hoverBreakStreaks.length - 1; i >= 0; i -= 1) {
          const b = hoverBreakStreaks[i]
          b.t += dt
          if (b.t >= b.life) {
            hoverBreakStreaks.splice(i, 1)
            continue
          }
          const u = 1 - b.t / b.life
          const alpha = u * u
  
          b.x += b.vx * dt
          b.y += b.vy * dt
          // Slight damping so the streak "floats" into place.
          const damp = 1 - dt * 1.35
          b.vx *= damp
          b.vy *= damp
  
          const len = b.len * (0.72 + 0.28 * u)
          ctx.strokeStyle = `rgba(${b.col.r},${b.col.g},${b.col.b},${alpha * 0.9})`
          ctx.lineWidth = b.width * (0.55 + 0.65 * u)
          ctx.beginPath()
          ctx.moveTo(b.x - b.dirX * len * 0.5, b.y - b.dirY * len * 0.5)
          ctx.lineTo(b.x + b.dirX * len * 0.5, b.y + b.dirY * len * 0.5)
          ctx.stroke()
        }
      }
  
      // 3) Draw neurons + firing bursts + dropout visualization + numeric values
      const backRed = backPropRed
      const fwdHigh = forwardPalette.fwdHigh
      const fwdMid = forwardPalette.fwdMid
      const fwdLow = forwardPalette.fwdLow
      const fwdBase = forwardPalette.fwdBase
      const fwdLayer0Start = forwardPalette.layer0Start
      const fwdLayer0End = forwardPalette.layer0End
  
      const lerp = (a, b, t) => a + (b - a) * t
      nodes.forEach((node, nodeIdx) => {
        const layerParallax = (node.layer / Math.max(1, outputLayerIndex) - 0.5) * (pointer.active ? 10 : 3)
        const px = node.x + layerParallax * (pointer.x - 0.5)
        const py = node.y + layerParallax * (pointer.y - 0.5)
  
        if (node.isDropped) {
          const flickerT = cycleTime < dropoutPreMs ? 1 - cycleTime / dropoutPreMs : 0
          const flicker = 0.5 + 0.5 * Math.sin(tick * 0.22 + nodeIdx * 0.9)
          const alpha = 0.08 + flickerT * (0.08 + flicker * 0.12)
          ctx.shadowBlur = 0
          ctx.fillStyle = `rgba(148,163,184,${alpha})`
          ctx.beginPath()
          ctx.arc(px, py, Math.max(0.8, node.r * 0.9), 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = `rgba(148,163,184,${alpha + 0.12})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(px - 4, py - 4)
          ctx.lineTo(px + 4, py + 4)
          ctx.moveTo(px + 4, py - 4)
          ctx.lineTo(px - 4, py + 4)
          ctx.stroke()
          return
        }
  
        const a = node.activation
        const pulse = node.pulse ?? 0
        const history = node.history ?? 0
        const mode = node.historyMode === 'back' ? 'back' : 'fwd'
  
        const firedNow = pulse > 0.14
        const showRing = firedNow || history > 0.18
        if (!showRing) {
          ctx.shadowBlur = 0
          return
        }
  
        const signal = Math.max(pulse, history)
  
        // Color story driven by the strongest signal (pulse or history)
        let col = fwdBase
        let ringAlpha = 0.0
        if (mode === 'back') {
          // Backprop always stays red (consistent, easier to read).
          col = backRed
          ringAlpha = 0.15 + signal * 0.55
        } else if (node.layer === 0) {
          col = {
            r: Math.round(lerp(fwdLayer0Start.r, fwdLayer0End.r, signal)),
            g: Math.round(lerp(fwdLayer0Start.g, fwdLayer0End.g, signal)),
            b: Math.round(lerp(fwdLayer0Start.b, fwdLayer0End.b, signal)),
          }
          ringAlpha = 0.12 + signal * 0.42
        } else if (signal > 0.72) {
          col = fwdHigh
          ringAlpha = 0.2 + signal * 0.65
        } else if (signal > 0.45) {
          col = fwdMid
          ringAlpha = 0.13 + signal * 0.55
        } else if (signal > 0.18) {
          col = fwdLow
          ringAlpha = 0.11 + signal * 0.5
        } else {
          col = fwdBase
          ringAlpha = 0.06 + signal * 0.22
        }
  
        // Ring glow / bloom (no filled circles)
        const bloom = 3 + signal * 28
        ctx.shadowBlur = bloom
        ctx.shadowColor = `rgba(${col.r},${col.g},${col.b},${0.65 + a * 0.25})`
        ctx.lineWidth = 1.2 + signal * 1.4
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${ringAlpha})`
  
        const radius = node.r + signal * (node.layer === 0 ? 2.8 : 4.2)
        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.stroke()
  
        // Burst ripple on strong forward firing
        if (node.layer > 0 && mode === 'fwd' && signal > 0.72) {
          const ring = radius + 7 + a * 10
          const ringAlpha = clamp01((signal - 0.6) / 0.4) * 0.85
          ctx.lineWidth = 1.1
          ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${ringAlpha})`
          ctx.beginPath()
          ctx.arc(px, py, ring, 0, Math.PI * 2)
          ctx.stroke()
        }
  
        // Numeric micro-detail when neuron fires strongly during forward
        if (node.layer > 0 && mode === 'fwd' && signal > 0.72 && node.lastNumericPass !== passId) {
          node.lastNumericPass = passId
          const value = a.toFixed(2)
          textParticles.push({ x: px, y: py - 10, t: 0, life: 0.95, text: value, col })
          if (textParticles.length > 10) textParticles.shift()
        }
  
        ctx.shadowBlur = 0
      })
  
      // Render numeric value particles
      for (let i = textParticles.length - 1; i >= 0; i -= 1) {
        const p = textParticles[i]
        p.t += dt
        const tt = p.t / p.life
        if (tt >= 1) {
          textParticles.splice(i, 1)
          continue
        }
        const alpha = 1 - tt
        ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
        ctx.fillStyle = `rgba(${p.col.r},${p.col.g},${p.col.b},${0.25 + alpha * 0.85})`
        ctx.shadowBlur = 12 * alpha
        ctx.shadowColor = `rgba(${p.col.r},${p.col.g},${p.col.b},${alpha})`
        ctx.fillText(p.text, p.x - 6, p.y)
        ctx.shadowBlur = 0
      }
  
      ripples.forEach((r) => {
        r.t += 0.02
        const alpha = 1 - r.t
        if (alpha <= 0) return
        ctx.strokeStyle = isLight ? `rgba(99,102,241,${alpha * 0.55})` : `rgba(34,211,238,${alpha * 0.7})`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(r.x, r.y, 12 + r.t * 120, 0, Math.PI * 2)
        ctx.stroke()
      })
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        if (ripples[i].t >= 1) ripples.splice(i, 1)
      }
  
      frameId = window.requestAnimationFrame(draw)
    }
  
    const onPointerMove = (event) => {
      pointer.x = event.clientX / Math.max(1, width)
      pointer.y = event.clientY / Math.max(1, height)
      pointer.active = true
    }
    const onPointerLeave = () => {
      pointer.active = false
    }
    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      passStart = performance.now()
      passId += 1
      rerollDropout()
      ripples.length = 0
      textParticles.length = 0
      ripples.push({ x: event.clientX, y: event.clientY, t: 0 })
    }
  
    resize()
    passStart = performance.now()
    passId = 0
    rerollDropout()
    draw()
    window.addEventListener('resize', resize)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)
    container.addEventListener('pointerdown', onPointerDown)
  
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      container.removeEventListener('pointerdown', onPointerDown)
    }
  }, [theme, showContent])

  return { neuralCanvasRef, neuralContainerRef }
}
