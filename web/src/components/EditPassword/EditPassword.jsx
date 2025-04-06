/* eslint-disable react/prop-types */
import { useState } from "react";
import "./EditPassword.css";
import { X } from "lucide-react";
import {
  deletePassword,
  handlePasswordUpdate,
} from "../../services/passwordOperations";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function EditPassword({ onClose, password }) {
  const [formData, setFormData] = useState({
    name: password.name || "",
    website: password.website || "",
    userName: password.userName || "",
    email: password.email || "",
    password: password.password || "",
    note: password.note || "",
  });

  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeletePassword = async () => {
    const response = await deletePassword(
      userId,
      password._id,
      token,
      dispatch
    );
    if (response.success) {
      toast.success("Password deleted successfully");
      onClose();
    } else {
      toast.error("Failed to delete password");
    }
  };

  const handleSavePassword = async () => {
    const response = await handlePasswordUpdate(
      userId,
      password._id,
      formData,
      token,
      dispatch
    );
    if (response.success) {
      toast.success("Password updated successfully");
      onClose();
    } else {
      toast.error("Failed to update password");
    }
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

        <label className="edit-password-label">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="edit-password-input"
        />

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
          <button onClick={handleSavePassword} className="edit-password-save">
            Save
          </button>
          <button
            onClick={handleDeletePassword}
            className="edit-password-save delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
