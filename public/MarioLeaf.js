/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model({ ...props }) {
  const group = useRef()
  const { nodes, materials } = useGLTF('/marioLeaf-transformed.glb')
  return (
    <group ref={group} {...props} dispose={null}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Mario_Leaf_Mario_Leaf_0.geometry} material={materials.Mario_Leaf} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/marioLeaf-transformed.glb')
