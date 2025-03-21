import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ManageDevice from "../ManageDevice/ManageDevice";
import AppPreferences from "../AppPreferences/AppPreferences";
import "./SettingsCard.css";

export default function SettingsCard({ onClose }) {
  const [activeTab, setActiveTab] = useState("Manage Devices");

  const settingsOptions = [
    { name: "Manage Devices", component: <ManageDevice /> },
    { name: "App Preferences", component: <AppPreferences /> },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-container">
          <div className="settings-sidebar">
            <div className="settings-header">
              <ArrowLeft
                className="back-icon"
                size={"1.8rem"}
                onClick={onClose}
              />
              <div className="settings-title">Settings</div>
            </div>
            {settingsOptions.map((option, index) => (
              <div
                key={index}
                className={`settings-tab ${
                  activeTab === option.name ? "active" : ""
                }`}
                onClick={() => setActiveTab(option.name)}
              >
                {option.name}
              </div>
            ))}
          </div>

          <div className="settings-content">
            {
              settingsOptions.find((option) => option.name === activeTab)
                ?.component
            }
          </div>
        </div>
      </div>
    </div>
  );
}
