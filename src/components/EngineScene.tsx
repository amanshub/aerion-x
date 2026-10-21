import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import * as THREE from 'three'

export type EngineView = 'SIDE' | 'REAR'
export type DisplayMode = 'MODEL' | 'X-RAY' | 'SCHEMATIC'

interface EngineSceneProps {
  throttle: number
  target: number
  actual?: number
  running: boolean
  view: EngineView
  displayMode: DisplayMode
}

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value))

function material(mode: DisplayMode, color: string, metalness = 0.65) {
  return new THREE.MeshStandardMaterial({
    color: mode === 'MODEL' ? color : '#a8aaa5',
    metalness: mode === 'SCHEMATIC' ? 0.05 : metalness,
    roughness: mode === 'SCHEMATIC' ? 0.9 : 0.38,
    transparent: mode === 'X-RAY',
    opacity: mode === 'X-RAY' ? 0.4 : 1,
    wireframe: mode === 'SCHEMATIC',
  })
}

function Ring({
  x,
  radius,
  mode,
  color = '#b9beb9',
}: {
  x: number
  radius: number
  mode: DisplayMode
  color?: string
}) {
  return (
    <mesh
      position={[x, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      material={material(mode, color)}
    >
      <torusGeometry args={[radius, 0.035, 10, 48]} />
    </mesh>
  )
}

function Duct({
  x,
  radius,
  length,
  mode,
  color = '#7b8588',
}: {
  x: number
  radius: number
  length: number
  mode: DisplayMode
  color?: string
}) {
  return (
    <mesh
      position={[x, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}
      material={material(mode, color)}
    >
      <cylinderGeometry args={[radius, radius, length, 40, 1, true]} />
    </mesh>
  )
}

function BladeStage({
  x,
  radius,
  count,
  mode,
}: {
  x: number
  radius: number
  count: number
  mode: DisplayMode
}) {
  return (
    <group position={[x, 0, 0]}>
      <Ring x={0} radius={radius} mode={mode} />
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[
              0,
              Math.cos(angle) * radius * 0.52,
              Math.sin(angle) * radius * 0.52,
            ]}
            rotation={[angle, 0, 0]}
            material={material(mode, '#aab1b0')}
          >
            <boxGeometry args={[0.08, radius * 0.78, 0.025]} />
          </mesh>
        )
      })}
    </group>
  )
}

function Combustor({
  mode,
  throttle,
  running,
}: {
  mode: DisplayMode
  throttle: number
  running: boolean
}) {
  return (
    <group>
      <Duct x={0.02} radius={0.46} length={0.62} mode={mode} />
      <Ring x={-0.29} radius={0.46} mode={mode} />
      <Ring x={0.33} radius={0.46} mode={mode} />

      {running && throttle > 0 && mode === 'MODEL' && (
        <mesh position={[0.02, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.48, 32, 1, true]} />
          <meshBasicMaterial
            color="#f18a46"
            transparent
            opacity={0.1 + clamp(throttle) / 600}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

function ActuatorRails({
  mode,
  actual,
}: {
  mode: DisplayMode
  actual: number
}) {
  const travel = clamp(actual) / 100

  return (
    <group>
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const y = Math.cos(angle) * 0.57
        const z = Math.sin(angle) * 0.57

        return (
          <group key={i}>
            <mesh
              position={[0.8, y, z]}
              material={material(mode, '#778184')}
            >
              <boxGeometry args={[0.65, 0.045, 0.045]} />
            </mesh>
            <mesh
              position={[0.58 + travel * 0.35, y * 1.08, z * 1.08]}
              material={material(mode, '#d4a06d')}
            >
              <boxGeometry args={[0.18, 0.075, 0.075]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function NozzlePetals({
  actual,
  mode,
}: {
  actual: number
  mode: DisplayMode
}) {
  const opening = clamp(actual) / 100
  const innerRadius = 0.26 + opening * 0.25
  const outerRadius = innerRadius + 0.16

  return (
    <group>
      <Duct
        x={1.18}
        radius={0.65}
        length={0.56}
        mode={mode}
        color="#737d80"
      />
      <Ring x={0.9} radius={0.58} mode={mode} />
      <Ring x={1.46} radius={0.65} mode={mode} />

      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const shape = new THREE.Shape()
        shape.moveTo(-0.27, innerRadius)
        shape.lineTo(0.27, innerRadius)
        shape.lineTo(0.31, outerRadius)
        shape.lineTo(-0.31, outerRadius)
        shape.closePath()

        return (
          <mesh
            key={i}
            geometry={new THREE.ShapeGeometry(shape)}
            position={[1.18, 0, 0]}
            rotation={[angle, 0, 0]}
            material={material(mode, '#b4b9b4')}
          />
        )
      })}

      <Ring x={1.49} radius={innerRadius} mode={mode} color="#dca779" />
    </group>
  )
}

function ExhaustPlume({
  throttle,
  running,
  mode,
}: {
  throttle: number
  running: boolean
  mode: DisplayMode
}) {
  if (!running || throttle <= 0 || mode !== 'MODEL') return null

  const intensity = clamp(throttle) / 100
  const length = 0.45 + intensity * 1.3
  const radius = 0.1 + intensity * 0.23

  return (
    <group position={[1.65, 0, 0]}>
      <mesh
        position={[length / 2, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[radius, length, 28, 1, true]} />
        <meshBasicMaterial
          color="#f1a05e"
          transparent
          opacity={0.12 + intensity * 0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        position={[length * 0.35, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[radius * 0.4, length * 0.7, 24, 1, true]} />
        <meshBasicMaterial
          color="#fff0ce"
          transparent
          opacity={0.12 + intensity * 0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function EngineModel({
  throttle,
  actual,
  running,
  displayMode,
}: {
  throttle: number
  actual: number
  running: boolean
  displayMode: DisplayMode
}) {
  return (
    <group>
      <Duct x={-0.76} radius={0.51} length={1.45} mode={displayMode} />
      <Ring x={-1.48} radius={0.51} mode={displayMode} />
      <Ring x={-0.04} radius={0.51} mode={displayMode} />
      <BladeStage x={-1.25} radius={0.42} count={14} mode={displayMode} />
      <BladeStage x={-0.82} radius={0.41} count={12} mode={displayMode} />
      <Combustor mode={displayMode} throttle={throttle} running={running} />
      <BladeStage x={0.49} radius={0.42} count={12} mode={displayMode} />
      <ActuatorRails mode={displayMode} actual={actual} />
      <NozzlePetals actual={actual} mode={displayMode} />
      <ExhaustPlume throttle={throttle} running={running} mode={displayMode} />
    </group>
  )
}

export default function EngineScene({
  throttle,
  target,
  actual = 0,
  running,
  view,
  displayMode,
}: EngineSceneProps) {
  const measuredPosition = clamp(actual)
  const rearView = view === 'REAR'

  return (
    <div
      className={`engine-canvas ${displayMode === 'X-RAY' ? 'engine-xray' : ''} ${displayMode === 'SCHEMATIC' ? 'engine-schematic' : ''}`}
      role="img"
      aria-label={`${rearView ? 'Rear' : 'Side'} view of the AERION-X conceptual exhaust model`}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#171b1b', 1)
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.1
        }}
      >
        <color attach="background" args={['#171b1b']} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 5, 5]} intensity={2.1} />
        <directionalLight position={[-4, 2, -3]} intensity={1.1} />
        <pointLight position={[2, 0, 0]} color="#e8a16d" intensity={0.8} />

        <PerspectiveCamera
          makeDefault
          position={rearView ? [3.2, 0.15, 0.01] : [0.15, 1.25, 6.0]}
          fov={rearView ? 38 : 32}
        />

        <Suspense fallback={null}>
          <Environment preset="city" environmentIntensity={0.35} />
        </Suspense>

        <EngineModel
          throttle={throttle}
          actual={measuredPosition}
          running={running}
          displayMode={displayMode}
        />

        <gridHelper
          args={[8, 24, '#343c3b', '#252b2b']}
          position={[0, -1.05, 0]}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={2.5}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>

      <div className="engine-overlay">
        <span>{rearView ? 'NOZZLE / REAR VIEW' : 'AXIAL / SIDE VIEW'}</span>
        <span>
          TARGET {clamp(target).toFixed(0)}% · ACTUAL {measuredPosition.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}