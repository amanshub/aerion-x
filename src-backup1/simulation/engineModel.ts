
export interface EngineState {
  throttle: number
  target: number
  actual: number
  running: boolean
  temperatureK: number
}

const MIN_POSITION = 0
const MAX_POSITION = 100
const ACTUATOR_TIME_CONSTANT_SECONDS = 0.8

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, value))
}

/**
 * First-order actuator approximation.
 * This is a software demonstration model, not validated engine physics.
 */
export function stepNozzlePosition(
  actual: number,
  target: number,
  dtSeconds: number,
  running: boolean,
): number {
  const position = clamp(actual, MIN_POSITION, MAX_POSITION)

  if (!running) return position

  const boundedTarget = clamp(target, MIN_POSITION, MAX_POSITION)
  const dt = clamp(dtSeconds, 0, 0.2)

  if (dt === 0) return position

  const alpha = 1 - Math.exp(-dt / ACTUATOR_TIME_CONSTANT_SECONDS)
  const nextPosition = position + (boundedTarget - position) * alpha

  return clamp(nextPosition, MIN_POSITION, MAX_POSITION)
}

/**
 * Illustrative display value only.
 * It is not a thermodynamic engine-temperature prediction.
 */
export function illustrativeTemperature(
  throttle: number,
  running: boolean,
): number {
  if (!running) return 295

  return Math.round(320 + clamp(throttle, 0, 100) * 7.4)
}
