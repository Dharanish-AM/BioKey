import { useState } from "react";
import { X } from "lucide-react";
import "./AddPassword.css";
import { addPassword } from "../../services/passwordOperations";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function AddPassword({ onClose }) {
  const [formData, setFormData] = useState({
    website: "",
    name: "",
    username: "",
    email: "",
    password: "",
    note: "",
  });
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.user.userId);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.website || !formData.password) {
      alert("Website and Password are required!");
      return;
    }

    const response = await addPassword(
      userId,
      token,
      formData.name,
      formData.username,
      formData.email,
      formData.password,
      formData.website,
      formData.note,
      dispatch,
    );

    if (response.success) {
      toast.success("Password added successfully!");
    } else {
      toast.error(response.message);
    }

    setFormData({
      website: "",
      username: "",
      email: "",
      password: "",
      note: "",
    });
    onClose();
  };

  return (
    <div className="overlay">
      <div className="add-password-container">
        <div className="add-password-header">
          <div className="add-password-title">Add New Password</div>
          <X
            style={{
              cursor: "pointer",
            }}
            onClick={onClose}
            className="close-icon"
          />
        </div>

        <form className="add-password-form" onSubmit={handleSubmit}>
          <div className="add-password-group">
            <label className="add-password-label">Name</label>
            <input
              className="add-password-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name..."
              required
            />
          </div>
          <div className="add-password-group">
            <label className="add-password-label">Website</label>
            <input
              className="add-password-input"
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="www.example.com"
              required
            />
          </div>

          <div className="add-password-group">
            <label className="add-password-label">Username</label>
            <input
              className="add-password-input"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
          </div>

          <div className="add-password-group">
            <label className="add-password-label">Email</label>
            <input
              className="add-password-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="add-password-group">
            <label className="add-password-label">Password</label>
            <input
              className="add-password-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="add-password-group">
            <label className="add-password-label">Note</label>
            <textarea
              className="add-password-textarea"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add a note (optional)"
            />
          </div>

          <button type="submit" className="add-password-submit">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
