/* eslint-disable react/prop-types */
import React from "react";
import { Fingerprint, KeyRound } from "lucide-react";

export default function FingerprintCard({ isFingerPrint, setIsFingerPrint }) {
  const [isDeviceConnected, setIsDeviceConnected] = React.useState(false);
  return (
    <div className="authpage-left-card-fingerprint">
      <div className="authpage-left-card-toggle-btn">
        <button
          className={`auth-toggle-btn ${!isFingerPrint ? "active" : ""}`}
          onClick={() => setIsFingerPrint(false)}
        >
          <KeyRound
            size={"1.1em"}
            className={`toggle-icon ${!isFingerPrint ? "active-icon" : ""}`}
          />
          Credentials
        </button>
        <button
          className={`auth-toggle-btn ${isFingerPrint ? "active" : ""}`}
          onClick={() => setIsFingerPrint(true)}
        >
          <Fingerprint
            size={"1.1em"}
            className={`toggle-icon ${isFingerPrint ? "active-icon" : ""}`}
          />
          Fingerprint
        </button>
      </div>
      <div className="fingy-auth-img"></div>
      <button className="auth-fp-btn">
        {isDeviceConnected ? "Ready to go . . ." : "Waiting for device . . ."}
      </button>
    </div>
  );
}
