import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, SpotLight } from "@react-three/drei";
import "./ManageDevice.css";

export default function ManageDevice() {
  const device = { id: "DVC-001", name: "FINGY", status: "Active" };

  return (
    <div className="manage-device-container">
      <div className="manage-device-title">Manage Device</div>
      <div className="manage-device-container-info">
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
          <div className="manage-device-info-row">
            <div className="manage-device-info-label">Device ID:</div>
            <div className="manage-device-info-value">{device.id}</div>
          </div>
          <div className="manage-device-info-row">
            <div className="manage-device-info-label">Device Name:</div>
            <div className="manage-device-info-value">{device.name}</div>
          </div>
          <div className="manage-device-info-row">
            <div className="manage-device-info-label">Status:</div>
            <div className="manage-device-info-value">{device.status}</div>
          </div>
        </div>
        <div className="manage-device-actions">
          <button className="manage-device-action-button">Edit Name</button>
          <button className="manage-device-action-button unlink">
            Unlink Device
          </button>
        </div>
      </div>
    </div>
  );
}

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
