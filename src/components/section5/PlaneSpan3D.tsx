import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import { Arrow3D } from '../section3/Arrow3D'

type V3 = [number, number, number]

export function PlaneSpan3D({ c1, c2, c3 }: { c1: V3; c2: V3; c3: V3 }) {
  const planeGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(6, 6, 1, 1)
    const a = new THREE.Vector3(...c1).normalize()
    let b = new THREE.Vector3(...c2)
    b = b.sub(a.clone().multiplyScalar(b.dot(a))).normalize()
    const normal = new THREE.Vector3().crossVectors(a, b)
    const m = new THREE.Matrix4().makeBasis(a, b, normal)
    geom.applyMatrix4(m)
    return geom
  }, [c1, c2])

  return (
    <Canvas camera={{ position: [5, 4, 6], fov: 45 }} className="rounded-xl">
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={40} color="#4c7dff" />
      <Grid args={[12, 12]} cellColor="#1a1a24" sectionColor="#2a2a38" fadeDistance={16} infiniteGrid position={[0, -0.001, 0]} />

      <mesh geometry={planeGeom}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>

      <Arrow3D from={[0, 0, 0]} to={c1} color="#4c7dff" label="c1" glow />
      <Arrow3D from={[0, 0, 0]} to={c2} color="#22d3ee" label="c2" glow />
      <Arrow3D from={[0, 0, 0]} to={c3} color="#a855f7" label="c3 = c1+c2" glow />

      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={20} />
    </Canvas>
  )
}
