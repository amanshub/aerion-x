
import { memo, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export type EngineView = 'SIDE' | 'REAR'
type DisplayMode = 'MODEL' | 'X-RAY' | 'SCHEMATIC'

const ENGINE_COLORS = {
  steel: '#777a70',
  lightSteel: '#bcb9ac',
  paleMetal: '#d8d3c5',
  darkMetal: '#3d4039',
  bronze: '#d1a16f',
  exhaust: '#ed9b58',
}

function MetalCylinder({
  x,
  length,
  radius,
  color,
  roughness = 0.42,
}: {
  x: number
  length: number
  radius: number
  color: string
  roughness?: number
}) {
  return (
    <mesh
      position={[x, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}
      castShadow
      receiveShadow
    >
      <cylinderGeometry args={[radius, radius, length, 48]} />
      <meshStandardMaterial
        color={color}
        metalness={0.82}
        roughness={roughness}
      />
    </mesh>
  )
}

function Ring({
  x,
  radius,
  tube = 0.035,
  color = '#c4c0b3',
}: {
  x: number
  radius: number
  tube?: number
  color?: string
}) {
  return (
    <mesh
      position={[x, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      castShadow
    >
      <torusGeometry args={[radius, tube, 10, 56]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.28}
      />
    </mesh>
  )
}

function BladeStage({
  x,
  count,
  radius,
  innerRadius,
  color,
  width = 0.11,
}: {
  x: number
  count: number
  radius: number
  innerRadius: number
  color: string
  width?: number
}) {
  const blades = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, index) => (index * Math.PI * 2) / count,
      ),
    [count],
  )

  return (
    <group position={[x, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry
          args={[(radius + innerRadius) / 2, 0.025, 8, 48]}
        />
        <meshStandardMaterial
          color="#77786e"
          metalness={0.85}
          roughness={0.32}
        />
      </mesh>

      {blades.map((angle, index) => (
        <mesh
          key={index}
          position={[
            0,
            Math.cos(angle) * ((innerRadius + radius) / 2),
            Math.sin(angle) * ((innerRadius + radius) / 2),
          ]}
          rotation={[angle, 0, 0]}
          castShadow
        >
          <boxGeometry args={[width, radius - innerRadius, 0.035]} />
          <meshStandardMaterial
            color={color}
            metalness={0.78}
            roughness={0.36}
          />
        </mesh>
      ))}

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[innerRadius, innerRadius, 0.12, 32]}
        />
        <meshStandardMaterial
          color="#65675e"
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

function Combustor({
  throttle,
  running,
}: {
  throttle: number
  running: boolean
}) {
  return (
    <group>
      <MetalCylinder
        x={-0.1}
        length={0.78}
        radius={0.78}
        color="#66564a"
        roughness={0.6}
      />

      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.66, 0.66, 0.7, 48, 1, true]} />
        <meshBasicMaterial
          color="#e27b3d"
          transparent
          opacity={running ? 0.15 + throttle / 300 : 0.035}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[-0.39, -0.2, 0.02, 0.23].map((x) => (
        <Ring
          key={x}
          x={x}
          radius={0.69}
          tube={0.025}
          color={ENGINE_COLORS.bronze}
        />
      ))}

      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.73, 32, 1, true]} />
        <meshStandardMaterial
          color="#f0a15a"
          emissive="#e46e28"
          emissiveIntensity={running ? throttle / 180 : 0}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/**
 * Simplified variable-area exhaust nozzle.
 *
 * Engine axis: X.
 * Actual position: simulated actuator position from 0 to 100%.
 *
 * The petals form a ring around the X axis and extend longitudinally
 * from the turbine outlet. This is a conceptual visualization,
 * not manufacturing geometry.
 */
function NozzlePetals({ actual }: { actual: number }) {
  const opening = THREE.MathUtils.clamp(actual, 0, 100) / 100

  const petals = useMemo(
    () =>
      Array.from(
        { length: 12 },
        (_, index) => (index * Math.PI * 2) / 12,
      ),
    [],
  )

  // The throat radius increases with simulated nozzle opening.
  const throatRadius = 0.42 + opening * 0.27
  const exitRadius = throatRadius + 0.12

  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape()

    // Local X is the nozzle's longitudinal axis.
    // Local Y is its radial direction before rotation around X.
    shape.moveTo(0, 0.39)
    shape.lineTo(0.70, 0.51)
    shape.lineTo(0.70, 0.63)
    shape.lineTo(0, 0.51)
    shape.closePath()

    return new THREE.ShapeGeometry(shape)
  }, [])

  return (
    <group>
      {/* Structural rings are centred on the engine's X axis. */}
      <Ring
        x={0}
        radius={throatRadius}
        tube={0.04}
        color="#8d8c7e"
      />

      <Ring
        x={0.70}
        radius={exitRadius}
        tube={0.035}
        color="#c3bdae"
      />

      {petals.map((angle, index) => (
        <mesh
          key={index}
          geometry={petalGeometry}
          position={[0, 0, 0]}
          rotation={[angle, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={index % 2 ? '#bcb9ac' : '#d8d3c5'}
            metalness={0.86}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Thin outer shroud around the variable-area petal assembly. */}
      <mesh
        position={[0.36, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[exitRadius + 0.055, throatRadius + 0.055, 0.72, 48, 1, true]}
        />
        <meshStandardMaterial
          color="#4d5048"
          metalness={0.72}
          roughness={0.42}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function ActuatorRails() {
  return (
    <group>
      {[0, 1, 2, 3].map((index) => {
        const angle = (index * Math.PI) / 2 + Math.PI / 4
        const y = Math.cos(angle) * 0.79
        const z = Math.sin(angle) * 0.79

        return (
          <group key={index}>
            {/* Rails connect the turbine casing to the nozzle support. */}
            <mesh
              position={[1.17, y, z]}
              rotation={[angle, 0, 0]}
              castShadow
            >
              <boxGeometry args={[0.95, 0.045, 0.045]} />
              <meshStandardMaterial
                color="#77796e"
                metalness={0.86}
                roughness={0.32}
              />
            </mesh>

            {/* Actuator canister near the aft end of each rail. */}
            <mesh
              position={[1.42, y * 1.06, z * 1.06]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.055, 0.055, 0.30, 16]} />
              <meshStandardMaterial
                color="#c3bdae"
                metalness={0.9}
                roughness={0.25}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function EngineModel({
  throttle,
  actual,
  running,
}: {
  throttle: number
  actual: number
  running: boolean
  view: EngineView
}) {
  const plumeLength = running
    ? 0.25 + (throttle / 100) * 1.0
    : 0.05

  return (
    <group>
      {/* Intake and compressor casing. */}
      <MetalCylinder
        x={-1.15}
        length={0.72}
        radius={0.78}
        color="#9d9d91"
      />

      <MetalCylinder
        x={-0.58}
        length={0.42}
        radius={0.72}
        color="#777a70"
      />

      <Ring
        x={-1.53}
        radius={0.78}
        tube={0.065}
        color="#d2cec0"
      />

      <Ring x={-0.88} radius={0.76} tube={0.035} />

      <BladeStage
        x={-1.48}
        count={18}
        radius={0.64}
        innerRadius={0.16}
        color="#d0cbbb"
        width={0.12}
      />

      {[-0.78, -0.63, -0.48, -0.33].map((x) => (
        <BladeStage
          key={x}
          x={x}
          count={14}
          radius={0.65}
          innerRadius={0.28}
          color="#aaa99d"
          width={0.075}
        />
      ))}

      {/* Combustor casing and internal liner. */}
      <MetalCylinder
        x={0}
        length={0.72}
        radius={0.68}
        color="#8c8170"
      />

      <Combustor throttle={throttle} running={running} />

      {/* Turbine stages. */}
      {[0.34, 0.5, 0.66].map((x) => (
        <BladeStage
          key={x}
          x={x}
          count={12}
          radius={0.64}
          innerRadius={0.3}
          color="#d1c6b2"
          width={0.075}
        />
      ))}

      {/* Aft turbine casing; its downstream end is near X = 1.205. */}
      <MetalCylinder
        x={0.98}
        length={0.45}
        radius={0.65}
        color="#77796f"
      />

      <Ring x={0.77} radius={0.65} tube={0.045} />
      <Ring x={1.18} radius={0.61} tube={0.04} />

      {/* Supports sit between the turbine casing and nozzle assembly. */}
      <ActuatorRails />

      {/*
        Nozzle throat starts at X = 1.20, close to the aft turbine outlet.
        The petal assembly extends downstream along the positive X axis.
      */}
      <group position={[1.20, 0, 0]}>
        <NozzlePetals actual={actual} />
      </group>

      {/* Illustrative exhaust plume. Not a fluid or combustion simulation. */}
      <mesh
        position={[2.62 + plumeLength / 2, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[
            0.06,
            0.35 + (throttle / 100) * 0.2,
            plumeLength,
            32,
            1,
            true,
          ]}
        />
        <meshBasicMaterial
          color={ENGINE_COLORS.exhaust}
          transparent
          opacity={running ? 0.24 + throttle / 400 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[2.68 + plumeLength * 0.28, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry
          args={[
            0.025,
            0.12 + (throttle / 100) * 0.09,
            plumeLength * 0.65,
            24,
            1,
            true,
          ]}
        />
        <meshBasicMaterial
          color="#fff0d0"
          transparent
          opacity={running ? throttle / 180 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Component labels. */}
      <Html
        position={[-1.2, 1.05, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <span className="scene-label">COMPRESSOR</span>
      </Html>

      <Html
        position={[-0.08, 1.05, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <span className="scene-label">COMBUSTOR</span>
      </Html>

      <Html
        position={[0.85, 1.05, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <span className="scene-label">TURBINE</span>
      </Html>

      <Html
        position={[1.95, 1.05, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: 'none' }}
      >
        <span className="scene-label">VARIABLE NOZZLE</span>
      </Html>
    </group>
  )
}

function SceneFallback() {
  return (
    <Html center>
      <div className="scene-loading">Preparing 3D engine…</div>
    </Html>
  )
}

function EngineScene({
  throttle,
  target: _target,
  actual,
  running,
  view,
  displayMode = 'MODEL',
}: {
  throttle: number
  target: number
  actual: number
  running: boolean
  view: EngineView
  displayMode?: DisplayMode
}) {
  const cameraPosition: [number, number, number] =
    view === 'REAR'
      ? [5.8, 0.12, 0.01]
      : [0.25, 3.6, 7.2]

  return (
    <div
      className={`engine-scene ${
        view === 'REAR' ? 'rear-camera' : 'side-camera'
      } ${displayMode.toLowerCase()}`}
    >
      <Canvas
        key={view}
        shadows
        dpr={[1, 1.6]}
        camera={{
          position: cameraPosition,
          fov: view === 'REAR' ? 46 : 38,
        }}
      >
        <color attach="background" args={['#eae6dc']} />

        <ambientLight intensity={1.25} />

        <directionalLight
          position={[4, 5, 6]}
          intensity={2.1}
          castShadow
        />

        <directionalLight
          position={[-4, 2, -4]}
          intensity={1.0}
          color="#e7a16f"
        />

        <Suspense fallback={<SceneFallback />}>
          <EngineModel
            throttle={throttle}
            actual={actual}
            running={running}
            view={view}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={3.4}
          maxDistance={10}
          maxPolarAngle={Math.PI * 0.82}
          minPolarAngle={0.18}
        />
      </Canvas>

      <span className="scene-view-label">
        {view === 'REAR'
          ? 'REAR NOZZLE / PETAL GEOMETRY'
          : 'ENGINE CUTAWAY / SIDE VIEW'}
      </span>

      <span className="scene-scale-label">
        PROCEDURAL MODEL · NOT TO SCALE
      </span>
    </div>
  )
}

export default memo(EngineScene)
