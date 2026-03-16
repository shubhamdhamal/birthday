'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function BirthdayCake3D() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load the 3D model
  const { scene } = useGLTF('/fnaf_hw_pizza_party_cake.glb');
  const litScene = React.useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat) => {
        const material = mat as THREE.MeshStandardMaterial;
        if (!material) return;

        if (material.color) {
          material.color.multiplyScalar(1.15);
        }

        if ('metalness' in material) {
          material.metalness = Math.min(material.metalness, 0.35);
        }

        if ('roughness' in material) {
          material.roughness = Math.max(material.roughness * 0.9, 0.35);
        }

        material.needsUpdate = true;
      });
    });

    return clone;
  }, [scene]);

  const { baseScale, modelOffset } = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(litScene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    return {
      baseScale: maxDim > 0 ? 2.3 / maxDim : 1,
      modelOffset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [litScene]);

  // Rotate the group
  useFrame((state, delta) => {
    if (groupRef.current) {
      if (hovered) {
        groupRef.current.rotation.y += delta * 0.5; // Spin faster when hovered
      } else {
        groupRef.current.rotation.y += delta * 0.08; // Keep default spin subtle
      }
      
      // Add slight floating effect
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.08;
    }
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      scale={hovered ? baseScale * 1.08 : baseScale}
      rotation={[0.2, 0, 0]} // Slight tilt to see the top
    >
      <group position={modelOffset}>
        <primitive object={litScene} />
      </group>
      
      {/* Flame lighting effect */}
      <pointLight color="#fde047" intensity={hovered ? 8 : 3} distance={5} position={[0, 2.0, 0]} />
    </group>
  );
}

useGLTF.preload('/fnaf_hw_pizza_party_cake.glb');
