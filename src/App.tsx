// @ts-nocheck
import { forwardRef, Suspense, useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import './App.css';
import * as THREE from 'three';
import create from 'zustand';
import { Environment, useGLTF, OrbitControls, Sky, Cloud} from '@react-three/drei';
import { BufferGeometry, Material } from 'three';
import { SphereProps, TrimeshProps, usePlane, Debug, useContactMaterial, Triplet, useSphere } from '@react-three/cannon'
import { Physics, useBox, useTrimesh } from '@react-three/cannon'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'


const leafMaterial = 'leaf';
const groundMaterial = 'ground';
type State = {
  count: number;
  updateCount(): void;
}
const useStore = create<State>((set) => ({
  count: 0,
  updateCount(){
    set((state) => ({ count: state.count + 1 }))
  }
}))

const useContactsMaterials = () => {
  useContactMaterial(leafMaterial, groundMaterial, {
    contactEquationStiffness: 1e8,
    frictionEquationStiffness: 1e8,
    friction: 100,
    restitutionEquationStiffness: 1e8,
    restitution: 0.00000001,
  })

  useContactMaterial(leafMaterial, leafMaterial, {
    friction: 4,
    frictionEquationStiffness: 1e8,
    restitution: 0.01,
  })
}

const Env = (props) => {
  const { nodes, materials } = useGLTF('/environment.glb');
  // const [groundRef] = useTrimesh(() => ({
  //   material: groundMaterial,
  //   args: [nodes.Ground.geometry.attributes.position.array, nodes.Ground.geometry.index.array],
  //   // position: [-115.87, 0, -31.11],
  //   scale: [185.02, 233.77, 184.33]
  // }))
  return (
    <group scale={0.2} dispose={null} position={[14, -2, -10]} rotation={[0, -Math.PI / 2, 0]} >
      <group position={[-126.97, -9, 0]} rotation={[0, -0.44, 0]} scale={[171.48, 1, 1.11]}>
        <mesh geometry={nodes.Cube054.geometry} material={materials.Wood} />
        <mesh geometry={nodes.Cube054_1.geometry} material={materials.Metal} />
      </group>
      <mesh receiveShadow castShadow geometry={nodes.Ground.geometry} material={materials.Material} position={[-115.87, 0, -31.11]} scale={[185.02, 233.77, 184.33]} />
      <group position={[33.22, 40.52, 88.4]} rotation={[2.84, 0.04, 0.09]} scale={12.13}>
        <mesh geometry={nodes.Sphere013.geometry} material={materials.Foliage} />
        <mesh geometry={nodes.Sphere013_1.geometry} material={materials.Wood} />
      </group>
      <group position={[-62.44, 45.77, -40.19]} rotation={[0.23, -0.03, -3.1]} scale={15.55}>
        <mesh geometry={nodes.Sphere014.geometry} material={materials.Foliage} />
        <mesh geometry={nodes.Sphere014_1.geometry} material={materials.Wood} />
      </group>
      <group position={[43.73, 4.02, 37.21]} rotation={[0.08, 0.02, -0.03]} scale={5.47}>
        <mesh geometry={nodes.Cube002.geometry} material={materials.Wood} />
        <mesh geometry={nodes.Cube002_1.geometry} material={materials.Foliage} />
      </group>
      <group position={[-260.06, 77.05, 30.05]} rotation={[-0.03, 0.01, -0.01]} scale={[5.54, 4.37, 5.53]}>
        <mesh geometry={nodes.Cylinder007.geometry} material={materials['Foliage 2']} />
        <mesh geometry={nodes.Cylinder007_1.geometry} material={materials['Wood 2']} />
      </group>
      <group position={[-99.4, -0.21, 92.62]} rotation={[3.09, 0.23, -3.11]} scale={8.49}>
        <mesh geometry={nodes.Cube003.geometry} material={materials['Wood 3']} />
        <mesh geometry={nodes.Cube003_1.geometry} material={materials['Leaves 3']} />
      </group>
      <mesh geometry={nodes.Leafless_tree.geometry} material={materials['Wood 4']} position={[-200.14, 3.52, -15.15]} rotation={[-0.02, -0.01, -0.03]} scale={12.94} />
      <mesh geometry={nodes.Leafless_tree001.geometry} material={materials['Wood 4']} position={[-28.51, 14.57, 141.19]} rotation={[-3.12, 0.18, 3.11]} scale={6.7} />
      <group position={[-20.54, 4.35, -12.92]} rotation={[0.33, -0.76, -0.05]} scale={12.29}>
        <mesh geometry={nodes.Cube005.geometry} material={materials['Wood 2']} />
        <mesh geometry={nodes.Cube005_1.geometry} material={materials['Leaves 3']} />
        <mesh geometry={nodes.Cube005_2.geometry} material={materials.Foliage} />
        <mesh geometry={nodes.Cube005_3.geometry} material={materials['Foliage 2']} />
      </group>
    </group>
  )
}


function Leaf({z}: { z: number }) {
  const { nodes, materials }: {
    nodes: {
      [key: string]: BufferGeometry
    },
    materials: {
      [key: string]: Material
    }
  } = useGLTF('/marioLeaf-transformed.glb')
  const instancedMaterial = useMemo(() => materials.Mario_Leaf.clone(), []);

  
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, z));
  const isFading = useRef(false);
  const isDisposed = useRef(false);
  const isMouseDown = useRef(false);
  const updateCount = useStore((state) => state.updateCount)

  const randomValue = useMemo(() => (Math.random() + 0.5) * (-1 * z), []);
  const data = useMemo(() => ({
    x: THREE.MathUtils.randFloatSpread(width - width/2),
    y: THREE.MathUtils.randFloatSpread(height) + height
  }), [width, height]);
  instancedMaterial.transparent = true;
  const [ref, api] = useBox(() => ({
     mass: 1, 
     position: [data.x, data.y, 0], args: [0.3, 1, 1],
     material: leafMaterial,
     angularDamping: 0.01,
     linearDamping: 0.2
  }));
  
  useEffect(() => {
    const randomtimeout = THREE.MathUtils.clamp(Math.random() * 5000, 1000, 10000);
    window.addEventListener('mousedown', () => {
      isMouseDown.current = true;
    })
    window.addEventListener('mouseup', () => {
      isMouseDown.current = false;
    })
    setTimeout(() => api.applyLocalImpulse([randomValue / 2, randomValue / 2, randomValue / 2], [0, 0, 0]), randomtimeout);
  })
  useFrame((state) => {
    if(isDisposed.current) return;
    if (!ref.current) return;
    if(isFading.current === true) {
      if(ref.current.material.opacity > 0) {
        ref.current.material.opacity = ref.current.material.opacity - 0.05;
      }
      if (ref.current.material.opacity < 0) {
        ref.current.material.dispose();
        ref.current.geometry.dispose();
        ref?.current?.parent?.remove(ref.current);
        api.position.set(999, 999, 999);
        isDisposed.current = true;
      }
    }
  });

  return !isDisposed.current ? <mesh
    castShadow
    receiveShadow
    onPointerOver={ (e) => {
      // e.stopPropagation();
      if (isMouseDown.current && !isFading.current) {
        updateCount();
        isFading.current = true;
      }
    }}
    ref={ref} 
    geometry={nodes.Mario_Leaf_Mario_Leaf_0.geometry} 
    material={instancedMaterial} 
    scale={0.3}
    // rotation={[0, 0, Math.PI]}
  /> : null
}

function HitCount() {
    const hitCount = useStore((state) => state.count);
  return <div>count: {hitCount} </div>
}


const Bound = ({position, rotation, material = 'defaultContactMaterial'}: {position: Triplet, rotation: Triplet, material?: string}) => {

  const [ref] = usePlane(() => ({
    position, 
    rotation,
    material
    // type: 'Static'
  }));

  return <mesh ref={ref}>
    <planeBufferGeometry args={[1000, 1000]}/>
    <meshBasicMaterial opacity={0} transparent={true}/>
  </mesh>

}

function Mouse() {
  const { viewport } = useThree()
  const [, api] = useSphere(() => ({ type: "Kinematic", args: [6] }))
  return useFrame((state) => api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, -7))
}


const Bounds = () => {

  useContactsMaterials();
  const { viewport, camera } = useThree();
  const { width, height } = viewport.getCurrentViewport(camera, new THREE.Vector3(0, 0, 0));

  return <>
    {/* Sides */}
    <Bound position={[5, 0, -5]} rotation={[Math.PI, -Math.PI / 2, 0]}/>
    <Bound position={[-5, 0, -5]} rotation={[Math.PI, Math.PI / 2, -Math.PI]}/>

    {/* Back */}
    <Bound position={[0, 0, -5]} rotation={[-Math.PI, -Math.PI, 0]}/>

    {/* Front and ground */}
    <Bound position={[0, 0, camera.position.z - 4]} rotation={[Math.PI, 0, 0]}/>
    <Bound material={groundMaterial} position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}/>
  </>
}

function App({count = 80}) {

  return (
    <Suspense fallback={<div/>}>
      {/* <HitCount /> */}
      <Canvas
        shadows
        camera={{fov: 70}}
      >
        <EffectComposer>
          <DepthOfField focusDistance={0} focalLength={0.07} bokehScale={10} />
          <Bloom luminanceThreshold={0.8} luminanceSmoothing={0.1} />
        </EffectComposer>

          {/* <OrbitControls /> */}
          <Sky
            distance={3000}
            turbidity={1}
            rayleigh={1.6}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
            inclination={0.49}
            azimuth={0.25}
          />
          <Cloud
            position={[10, 35, -100]}
            width={20}
            segments={80}
          />
          <Cloud
            position={[45, 32, -100]}
            segments={80}
          />
          <Cloud
            position={[40, 32, -100]}
            width={20}
            segments={100}
          />
          <ambientLight 
            intensity={0.2}
          />
          <directionalLight 
            position={[0, 70, -10]} 
            color={'#ff671f'}
            intensity={2}
            castShadow
            shadow-mapSize-height={512}
            shadow-mapSize-width={512}
          />
          <Physics
            gravity={[0, -0.3, 0]}
            defaultContactMaterial={{
              friction: 1,
              restitution: 1,
            }}
          >
            {/* <Debug> */}
              {Array.from({length: count}, (_, i) => 
                (<Leaf key={i} z={Math.floor(-i / 10) || -1}></Leaf>))
              }
              {/* <Mouse /> */}
              <Bounds />
              <Env />
            {/* </Debug> */}
          </Physics>
          <Environment preset={"sunset"}/>
      </Canvas>
    </Suspense>
  )
}

export default App
