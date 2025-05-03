import React, { useState } from "react";
import ReactSelect from "react-select";
import "./AppPreferences.css";

export default function AppPreferences() {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  const themeOptions = [
    { value: "system", label: "System Default" },
    { value: "light", label: "Light Mode" },
    { value: "dark", label: "Dark Mode" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ta", label: "தமிழ் (Tamil)" },
    { value: "hi", label: "हिन्दी (Hindi)" },
  ];

  return (
    <div className="app-preferences">
      <div className="app-preferences__title">App Preferences</div>
      <p className="app-preferences__description">
        Customize your BioKey experience. Adjust settings below to personalize
        the app to your needs.
      </p>

      <div className="app-preferences__section">
        <div className="app-preferences__label">Theme</div>
        <ReactSelect
          options={themeOptions}
          value={themeOptions.find((option) => option.value === theme)}
          onChange={(selectedOption) => setTheme(selectedOption.value)}
          className="app-preferences__select"
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "var(--light-color2)",
              color: "var(--text-color3)",
              borderColor: "#ccc",
              borderRadius: "8px",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "var(--light-color2)",
              color: "var(--text-color3)",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "var(--text-color3)",
            }),
          }}
        />
      </div>

      <div className="app-preferences__section">
        <div className="app-preferences__label">Notification Settings</div>
        <label className="app-preferences__checkbox-label">
          <input
            type="checkbox"
            defaultChecked
            className="app-preferences__checkbox"
          />
          Enable push notifications
        </label>
      </div>

      <div className="app-preferences__section">
        <div className="app-preferences__label">Language</div>
        <ReactSelect
          options={languageOptions}
          value={languageOptions.find((option) => option.value === language)}
          onChange={(selectedOption) => setLanguage(selectedOption.value)}
          className="app-preferences__select"
          styles={{
            control: (provided) => ({
              ...provided,
              backgroundColor: "var(--light-color2)",
              color: "var(--text-color3)",
              borderColor: "#ccc",
              borderRadius: "8px",
            }),
            menu: (provided) => ({
              ...provided,
              backgroundColor: "var(--light-color2)",
              color: "var(--text-color3)",
            }),
            singleValue: (provided) => ({
              ...provided,
              color: "var(--text-color3)",
            }),
          }}
        />
      </div>
    </div>
  );
}
