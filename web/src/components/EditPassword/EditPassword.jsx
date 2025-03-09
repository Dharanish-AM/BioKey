import { useState } from "react";
import "./EditPassword.css";
import { X } from "lucide-react";

export default function EditPassword({ onClose, password }) {
  const [formData, setFormData] = useState({
    website: "www.instagram.com",
    userName: "dharanish_15",
    email: "dharanish816@gmail.com",
    password: password || "e21f242bf73683a2d9029c362adc0029",
    note: "Personal Account",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="overlay">
      <div className="edit-password-container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "1rem",
          }}
        >
          <div className="edit-password-title">Edit Password</div>
          <X onClick={onClose} className="edit-password-close-icon" />
        </div>

        <label className="edit-password-label">Website</label>
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="edit-password-input"
        />

        <label className="edit-password-label">Username</label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          className="edit-password-input"
        />

        <label className="edit-password-label">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="edit-password-input"
        />

        <label className="edit-password-label">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="edit-password-input"
        />

        <label className="edit-password-label">Note</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="edit-password-textarea"
        />

        <div className="edit-password-actions">
          <button className="edit-password-save">Save</button>
        </div>
      </div>
    </div>
  );
}