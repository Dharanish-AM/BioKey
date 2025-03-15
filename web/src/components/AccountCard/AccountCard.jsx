import { ArrowLeft, CheckCircle, Edit, Pen, Pencil, Trash2, X } from "lucide-react";
import "./AccountCard.css";
import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { handleProfileImageSet, updateUserProfile } from "../../services/userOperations";

export default function AccountCard({ onClose }) {
  const user = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileImageOpen, setIsProfileImageOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: user.userName || "",
    email: user.userEmail || "",
    phone: user.userPhone || "",
    gender: user.userGender || "",
    location: user.userLocation || "",
  });
  const [prevUserData, setPrevUserData] = useState(userData);
  const fileInputRef = useRef(null);
  const userId = useSelector((state) => state.user.userId);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async(e) => {
    e.preventDefault();
    setIsEditing(false);
    if (JSON.stringify(prevUserData) !== JSON.stringify(userData)) {
      const response = await updateUserProfile(userId, userData, token, dispatch);
      if (response.success) {
        console.log("Profile updated successfully");
        setPrevUserData(userData);
      } else {
        console.log("Failed to update profile");
      }
    } else {
      console.log("No changes detected, skipping API call.");
    }
  };

  const handleDeleteAccount = () => {
    var isOk = window.confirm("Are you sure you want to delete your account?");
    if (isOk) {
      onClose();
    }
  };

  const handleProfileImageEdit = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("profileImage", file);

      
      try {
        const response = await handleProfileImageSet(
          userId,
          formData,
          token,
          dispatch
        );
        if (response.success) {
          console.log("Profile image updated successfully");
        } else {
          console.error("Failed to update profile image:", response.message);
        }
      } catch (error) {
        console.error("Error updating profile image:", error);
      }
    }
  };

  return (
    <div
      onClick={() => {
        if (isProfileImageOpen) {
          setIsProfileImageOpen(false);
        }
      }}
      className="overlay"
    >
      {isProfileImageOpen ? (
        <div className="profile-image-view">
          <img
            src={user.profileImage || "/default-profile.png"}
            alt="Profile"
            className="profile-image-view-img"
          />
        </div>
      ) : (
        <div className="account-card-container">
          <div className="account-card-header">
            <ArrowLeft
              className="account-card-close"
              style={{
                position: "absolute",
                left: "1.5rem",
                right: "1.5rem",
              }}
              onClick={onClose}
              size="1.8rem"
            />
          </div>

          <div className="account-card-profile">
            <div
              onClick={() => {
                setIsProfileImageOpen(true);
              }}
              className="account-card-profile-img-container"
            >
              <img
                src={user.profileImage || "/default-profile.png"}
                alt="Profile"
                className="account-card-profile-img"
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
                className="account-card-edit-icon-container"
              >
                <Pencil className="account-card-edit-icon" size="1.2rem" />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleProfileImageEdit}
                  hidden
                />
              </div>
            </div>
          </div>

          <div className="account-card-body">
            <div className="account-card-info-group">
              <label className="account-card-info-label">Name:</label>
              <input
                type="text"
                name="name"
                className="account-card-input"
                value={userData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="account-card-info-group">
              <label className="account-card-info-label">Email:</label>
              <input
                type="email"
                name="email"
                className="account-card-input"
                value={userData.email}
                onChange={handleChange}
                disabled={!isEditing}
                color="var(--text-color3)"
              />
            </div>
            <div className="account-card-info-group">
              <label className="account-card-info-label">Phone:</label>
              <input
                type="tel"
                name="phone"
                className="account-card-input"
                value={userData.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="account-card-info-group">
              <label className="account-card-info-label">Gender:</label>
              <input
                type="text"
                name="gender"
                className="account-card-input"
                value={userData.gender}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="account-card-info-group">
              <label className="account-card-info-label">Location:</label>
              <input
                type="text"
                name="location"
                className="account-card-input"
                value={userData.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="account-card-footer">
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
              }}
            >
              <button
                className="account-card-edit-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                    if(isEditing){
                        handleSubmit(e);
                    }
                }
                }
              >
                {
                    isEditing ? (
                      <CheckCircle
                        color="var(--text-color3)"
                        size="1.2rem"
                      />
                    ) : (
                      <Pencil color="var(--text-color3)" size="1.2rem" />
                    )
                }
                {isEditing ? "Save" : "Edit Profile"}
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount();
                }}
                className="account-card-delete-btn"
              >
                <Trash2 color="var(--text-color3)" size="1.2rem" />
                Delete Account
              </button>
            </div>
            <button className="account-card-change-password-btn">
              Change Password ?
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
