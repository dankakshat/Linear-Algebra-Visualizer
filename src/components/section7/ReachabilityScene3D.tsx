import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo } from 'react'
import { Arrow3D } from '../section3/Arrow3D'

type V3 = [number, number, number]

export function ReachabilityScene3D({
  c1,
  c2,
  b,
  closest,
  revealed,
  reachable,
}: {
  c1: V3
  c2: V3
  b: V3
  closest: V3
  revealed: boolean
  reachable: boolean
}) {
  const planeGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(7, 7, 1, 1)
    const a = new THREE.Vector3(...c1).normalize()
    let bb = new THREE.Vector3(...c2)
    bb = bb.sub(a.clone().multiplyScalar(bb.dot(a)))
    if (bb.lengthSq() < 1e-6) bb = new THREE.Vector3(0, 1, 0)
    bb.normalize()
    const normal = new THREE.Vector3().crossVectors(a, bb)
    const m = new THREE.Matrix4().makeBasis(a, bb, normal)
    geom.applyMatrix4(m)
    return geom
  }, [c1, c2])

  return (
    <Canvas camera={{ position: [5, 4, 6], fov: 45 }} className="rounded-xl">
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={40} color="#4c7dff" />
      <Grid args={[12, 12]} cellColor="#1a1a24" sectionColor="#2a2a38" fadeDistance={16} infiniteGrid position={[0, -0.001, 0]} />

      <mesh geometry={planeGeom}>
        <meshBasicMaterial color="#a855f7" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      <Arrow3D from={[0, 0, 0]} to={c1} color="#4c7dff" label="c1" glow />
      <Arrow3D from={[0, 0, 0]} to={c2} color="#22d3ee" label="c2" glow />

      <Arrow3D from={[0, 0, 0]} to={b} color="#ffffff" label="b" radius={0.03} />

      {revealed && (
        <>
          <Arrow3D from={[0, 0, 0]} to={closest} color={reachable ? '#34d399' : '#fb6b6b'} radius={0.04} glow label={reachable ? 'reached' : 'closest reachable'} />
          {!reachable && (
            <mesh>
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...closest), new THREE.Vector3(...b)]),
                    new THREE.LineDashedMaterial({ color: '#fb6b6b', dashSize: 0.12, gapSize: 0.08 }),
                  )
                }
                onUpdate={(self: THREE.Line) => self.computeLineDistances()}
              />
            </mesh>
          )}
        </>
      )}

      <OrbitControls enableDamping dampingFactor={0.08} minDistance={3} maxDistance={20} />
    </Canvas>
  )
}
