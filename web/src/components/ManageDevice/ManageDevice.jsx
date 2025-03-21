import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, SpotLight } from "@react-three/drei";
import "./ManageDevice.css";

export default function ManageDevice() {
  const device = { id: "DVC-001", name: "Biokey-Alpha", status: "Active" };

  return (
    <div className="manage-device-container">
      <h2 className="manage-device-title">Manage Device</h2>
    <div className="manage-device-container-info" >  
    <div className="manage-device-fingy">
        <Canvas
          camera={{ position: [0, 3, 5], fov: 40 }}
          shadows
          gl={{ antialias: true }}
          style={{
            width: "20rem",
            height: "20rem",
            backgroundColor: "transparent",
          }}

        >
          <Environment preset="city" />
          <Fingy />
        </Canvas>
      </div>

      <div className="manage-device-info">
        <p className="device-name">{device.name}</p>
        <p className="device-id">ID: {device.id}</p>
        <p className={`device-status ${device.status.toLowerCase()}`}>
          Status: {device.status}
        </p>
      </div>
    </div>
    </div>
  );
}

// 3D Model Component with Auto-Rotate (All Directions)
function Fingy() {
  const { scene } = useGLTF("/fingy.glb");
  const modelRef = useRef();

  useFrame(() => {
    if (modelRef.current) {
     
      modelRef.current.rotation.y += 0.008; 
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1}
      position={[0, -5, -10]}
    />
  );
}
