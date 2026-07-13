import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Text } from '@react-three/drei'
import { Arrow3D } from './Arrow3D'

type V3 = [number, number, number]

function scale(v: V3, s: number): V3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}
function add3(a: V3, b: V3): V3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function Scene3D({
  c1,
  c2,
  c3,
  x,
  y,
  z,
  b,
  isMatch,
}: {
  c1: V3
  c2: V3
  c3: V3
  x: number
  y: number
  z: number
  b: V3
  isMatch: boolean
}) {
  const xc1 = scale(c1, x)
  const yc2 = scale(c2, y)
  const zc3 = scale(c3, z)
  const step1 = xc1
  const step2 = add3(step1, yc2)
  const result = add3(step2, zc3)

  return (
    <Canvas camera={{ position: [5, 4, 6], fov: 45 }} className="rounded-xl">
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={40} color="#4c7dff" />
      <pointLight position={[-5, -3, -5]} intensity={20} color="#a855f7" />

      <Grid
        args={[12, 12]}
        cellColor="#1a1a24"
        sectionColor="#2a2a38"
        fadeDistance={16}
        infiniteGrid
        position={[0, -0.001, 0]}
      />

      {/* axes */}
      <Arrow3D from={[0, 0, 0]} to={[3.4, 0, 0]} color="#3a3a46" radius={0.012} />
      <Arrow3D from={[0, 0, 0]} to={[0, 3.4, 0]} color="#3a3a46" radius={0.012} />
      <Arrow3D from={[0, 0, 0]} to={[0, 0, 3.4]} color="#3a3a46" radius={0.012} />
      <Text position={[3.6, 0, 0]} fontSize={0.2} color="#555">x</Text>
      <Text position={[0, 3.6, 0]} fontSize={0.2} color="#555">y</Text>
      <Text position={[0, 0, 3.6]} fontSize={0.2} color="#555">z</Text>

      {/* base columns, faint */}
      <Arrow3D from={[0, 0, 0]} to={c1} color="#4c7dff" radius={0.02} />
      <Arrow3D from={[0, 0, 0]} to={c2} color="#22d3ee" radius={0.02} />
      <Arrow3D from={[0, 0, 0]} to={c3} color="#a855f7" radius={0.02} />

      {/* scaled + chained columns (head-to-tail) */}
      <Arrow3D from={[0, 0, 0]} to={xc1} color="#4c7dff" label="x·c1" glow />
      <Arrow3D from={step1} to={step2} color="#22d3ee" label="y·c2" glow />
      <Arrow3D from={step2} to={result} color="#a855f7" label="z·c3" glow />

      {/* target b */}
      <Arrow3D from={[0, 0, 0]} to={b} color="#ffffff" radius={0.015} />

      {/* result */}
      <Arrow3D from={[0, 0, 0]} to={result} color={isMatch ? '#34d399' : '#fb6b6b'} radius={0.045} glow label="Ax" />

      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={20} />
    </Canvas>
  )
}
