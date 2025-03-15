import "./Header.css";
import { Search, Bell, X, User, Settings, LifeBuoy } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";

import ProfileIconFallBack from "../../assets/images/profile_icon.png";
import Logo from "../../assets/icons/BioKey_Logo.png";
import { formatFileSize } from "../../utils/formatFileSize";
import FilePreview from "../../pages/FilePreview/FilePreview";
import {
  clearNotification,
  getNotifications,
} from "../../services/userOperations";
import AccountCard from "../AccountCard/AccountCard";
import SettingsCard from "../SettingsCard/SettingsCard";
import SupportCard from "../SupportCard/SupportCard";

export default function Header({ onSearch }) {
  const allFilesMetaData = useSelector((state) => state.files.allFilesMetadata);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [profileIcon, setProfileIcon] = useState(null);
  const [isNotificationModal, setIsNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.user);

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const response = await getNotifications(userId, token);
      if (response) {
        setNotifications(response);
      } else {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [userId, token, isNotificationModal]);

  useEffect(() => {
    if (user) {
      if (user.profileImage) {
        setProfileIcon(user.profileImage);
      } else if (user.name) {
        setProfileIcon(null);
      }
    }
  }, [user]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (allFilesMetaData?.files) {
      const filtered = allFilesMetaData.files.filter((file) =>
        file.name.toLowerCase().includes(query)
      );
      setFilteredFiles(filtered);
      onSearch(filtered);
    }
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    setFilteredFiles([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClearAllNotifications = async () => {
    const response = await clearNotification(userId, null, true, token);
    if (response) {
      setNotifications([]);
    }
  };

  const handleClearNotification = async (notificationId) => {
    const response = await clearNotification(
      userId,
      notificationId,
      false,
      token
    );
    if (response) {
      setNotifications((prev) =>
        prev.filter((item) => item._id !== notificationId)
      );
    }
  };

  return (
    <div className="header-container">
      <div className="header-logo">
        <img src={Logo} alt="Logo" className="header-logo-img" />
        <div className="header-logo-text">BioKey</div>
      </div>

      <div className="header-search-container">
        <Search
          color="var(--text-color2)"
          className="header-search-icon"
          size={"1.4rem"}
        />

        <input
          type="text"
          placeholder="Search any files..."
          className="header-search-input"
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <div onClick={handleCloseSearch} className="cancel-icon-search">
            <X color="var(--text-color2)" size={"1.5rem"} />
          </div>
        )}
      </div>

      <div className="header-right">
        <div
          onClick={() => {
            setIsNotificationModal(true);
          }}
          className="header-notifications-container"
        >
          <Bell color="var(--text-color2)" size={"1.7rem"} />
        </div>

        <div
          onClick={() => {
            setIsProfileOpen(true);
          }}
          className="header-profile-container"
        >
          {profileIcon ? (
            <img
              src={profileIcon}
              alt="Profile"
              className="header-profile-img"
            />
          ) : (
            <div className="header-profile-fallback">
              {user?.userName?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {searchQuery && (
        <div className="search-results-dropdown">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                onClick={() => setPreviewFile(file)}
                key={file.name}
                className="search-result-item"
              >
                <div className="search-result-item-name">{file.name}</div>
                <div className="search-result-item-date">
                  {new Date(file.createdAt).toLocaleDateString()}
                </div>
                <div className="search-result-item-size">
                  {formatFileSize(file.size)}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results-text">No matching files found</div>
          )}
        </div>
      )}
      {isNotificationModal && (
        <div
          onMouseLeave={() => setIsNotificationModal(false)}
          className="notification-modal-container"
        >
          <div className="notification-modal-header">
            <div className="notification-modal-title">Notifications</div>
            <div
              className="notification-modal-clear-all"
              onClick={handleClearAllNotifications}
            >
              Clear All
            </div>
          </div>
          <div className="notification-modal-content">
            {notifications.map((item) => (
              <div key={item._id} className="notification-item">
                <div className="notification-item-date">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}{" "}
                  &nbsp;
                  {new Date(item.createdAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      flexDirection: "column",
                    }}
                  >
                    <div className="notification-item-title">{item.title}</div>
                    <div className="notification-item-message">
                      {item.message}
                    </div>
                  </div>
                  <X
                    color="var(--text-color2)"
                    size={"1.2rem"}
                    className="notification-item-clear"
                    onClick={() => handleClearNotification(item._id)}
                    style={{
                      cursor: "pointer",
                      opacity: 0.8,
                    }}
                  />
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignSelf: "center",
                }}
                className="no-results-text"
              >
                No new Notifications
              </div>
            )}
          </div>
        </div>
      )}
      {isProfileOpen && (
        <div
          onMouseLeave={() => {
            setIsProfileOpen(false);
          }}
          className="profile-options-modal"
        >
          <div
            onClick={() => {
              setIsProfileOpen(false);
              setIsAccountOpen(true);
            }}
            className="profile-option"
          >
            <User size={18} className="profile-option-icon" />
            Account
          </div>
          <div
            onClick={() => {
              setIsProfileOpen(false);
              setIsSettingsOpen(true);
            }}
            className="profile-option"
          >
            <Settings size={18} className="profile-option-icon" />
            Settings
          </div>
          <div onClick={()=>{
            setIsProfileOpen(false);
            setIsSupportOpen(true);
          }} className="profile-option">
            <LifeBuoy size={18} className="profile-option-icon" />
            Support
          </div>
        </div>
      )}
      {
        isAccountOpen && (
          <AccountCard
            onClose={() => {
              setIsAccountOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )
      }
      {
        isSettingsOpen && (
          <SettingsCard
            onClose={() => {
              setIsSettingsOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )
      }{
        isSupportOpen && (
          <SupportCard
            onClose={() => {
              setIsSupportOpen(false);
              setIsProfileOpen(false);
            }}
          />
        )
      }
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
