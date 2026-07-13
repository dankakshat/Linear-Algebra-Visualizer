import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

export function Arrow3D({
  from,
  to,
  color,
  label,
  glow = false,
  radius = 0.035,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  label?: string
  glow?: boolean
  radius?: number
}) {
  const { dir, length, mid, quat, headPos } = useMemo(() => {
    const f = new THREE.Vector3(...from)
    const t = new THREE.Vector3(...to)
    const d = new THREE.Vector3().subVectors(t, f)
    const len = d.length()
    const dirN = d.clone().normalize()
    const midPoint = new THREE.Vector3().addVectors(f, t).multiplyScalar(0.5)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirN.lengthSq() > 0 ? dirN : new THREE.Vector3(0, 1, 0))
    const head = f.clone().add(dirN.clone().multiplyScalar(Math.max(len - 0.18, 0)))
    return { dir: dirN, length: len, mid: midPoint, quat: q, headPos: head }
  }, [from, to])

  if (length < 1e-4) return null

  return (
    <group>
      <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
        <cylinderGeometry args={[radius, radius, Math.max(length - 0.18, 0.001), 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow ? 1.4 : 0.5} toneMapped={false} />
      </mesh>
      <mesh position={[headPos.x, headPos.y, headPos.z]} quaternion={quat}>
        <coneGeometry args={[radius * 2.6, 0.18, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow ? 1.4 : 0.5} toneMapped={false} />
      </mesh>
      {label && (
        <Text position={[to[0] + 0.15, to[1] + 0.15, to[2]]} fontSize={0.22} color={color} anchorX="left">
          {label}
        </Text>
      )}
    </group>
  )
}
