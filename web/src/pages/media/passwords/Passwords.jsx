import { useState, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPasswords,
  getPasswordBreachStatus,
} from "../../../services/passwordOperations";
import "./Passwords.css";
import { TbEdit } from "react-icons/tb";
import toast from "react-hot-toast";
import AddPassword from "../../../components/AddPassword/AddPassword";
import EditPassword from "../../../components/EditPassword/EditPassword";

export default function Passwords() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const passwords = useSelector((state) => state.passwords.passwords);
  const [isAddPassword, setIsAddPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isShowSortOptions, setIsShowSortOptions] = useState(false);
  const [sortOption, setSortOption] = useState("name-asc");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [breachStatuses, setBreachStatuses] = useState({});
  const [selectedFile, setSelectedPassword] = useState();
  const [isEditing, setIsEditing] = useState(false);

  const availableIcons = [
    "amazon",
    "facebook",
    "flipkart",
    "google",
    "instagram",
    "netflix",
    "pinterest",
    "reddit",
    "snapchat",
    "twitter",
  ];

  useEffect(() => {
    if (userId && token) {
      getAllPasswords(userId, token, dispatch);
    }
  }, [userId, token, dispatch]);

  useEffect(() => {
    const fetchBreachStatuses = async () => {
      const breachData = {};
      for (const password of passwords) {
        try {
          const response = await getPasswordBreachStatus(password.password);
          breachData[password._id] = {
            breached: response.breached,
            breachCount: response.breachCount,
          };
        } catch (error) {
          console.error("Error fetching breach status:", error);
          breachData[password._id] = { breached: null, breachCount: null };
        }
      }
      setBreachStatuses(breachData);
    };

    if (passwords?.length > 0) {
      fetchBreachStatuses();
    }
  }, [passwords]);

  const handleAddPassword = () => {
    setIsAddPassword(true);
  };

  const getFavicon = (name) => {
    try {
      if (!Array.isArray(availableIcons)) {
        console.error("availableIcons is not defined or not an array");
        return null;
      }

      const lowerCase = name.toLowerCase();

      let isExist = availableIcons.includes(lowerCase);

      if (isExist) {
        const formattedName = name.toLowerCase().replace(/\s+/g, "");
        return `/icons/${formattedName}.png`;
      }

      return null;
    } catch (error) {
      console.error("Error in getFavicon:", error);
      return null;
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const noShowPassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const copyToClipboard = (text) => {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="passwords-container">
      <div className="passwords-container-header">
        <span className="passwords-container-title">Passwords</span>
        <div className="passwords-container-header-options">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Search passwords..."
              className="passwords-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              style={{ position: "absolute", left: "1rem" }}
              color="var(--text-color2)"
              size="1.5rem"
            />
            {searchTerm && (
              <X
                style={{
                  position: "absolute",
                  right: "1rem",
                  cursor: "pointer",
                }}
                color="var(--text-color2)"
                size="1.3rem"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          <SlidersHorizontal
            onClick={() => setIsShowSortOptions((prev) => !prev)}
            style={{ cursor: "pointer" }}
            color="var(--text-color2)"
            size="1.7rem"
          />

          <div className="add-passwords-btn" onClick={handleAddPassword}>
            <Plus size="1.5rem" color="var(--text-color3)" /> <span>|</span> Add
            Password
          </div>
        </div>
      </div>

      <div className="passwords-container-body">
        <div className="passwords-list">
          {passwords?.map((password) => (
            <div
              onMouseLeave={() => {
                noShowPassword(password._id);
              }}
              key={password._id}
              className="passwords-list-item"
            >
              <div className="password-list-item-header">
                <div className="password-list-item-icon-container">
                  {getFavicon(password.name) != null ? (
                    <img
                      src={getFavicon(password.name)}
                      alt={password.name}
                      className="password-list-item-icon"
                    />
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textTransform: "uppercase",
                      }}
                      className="password-list-item-icon-fallback"
                    >
                      {password.name
                        ? password.name.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                </div>
                <div className="password-name">{password.name}</div>
              </div>

              <div className="password-details">
                <div className="password-actions-item">
                  <div className="password-list-item-label">Username: </div>
                  <div className="password-list-item-value">
                    <input
                      type="text"
                      value={password.userName ? password.userName : "N/A"}
                      disabled
                      className="password-input"
                    />
                    <span
                      onClick={() => copyToClipboard(password.userName)}
                      style={{ cursor: "pointer", marginLeft: "1rem" }}
                    >
                      <Copy color="var(--text-color2)" size="1.2rem" />
                    </span>
                  </div>
                </div>

                <div className="password-actions-item">
                  <div className="password-list-item-label">Email: </div>
                  <div className="password-list-item-value">
                    <input
                      type="text"
                      value={password.email ? password.email : "N/A"}
                      disabled
                      className="password-input"
                    />
                    <span
                      onClick={() => copyToClipboard(password.email)}
                      style={{ cursor: "pointer", marginLeft: "1rem" }}
                    >
                      <Copy color="var(--text-color2)" size="1.2rem" />
                    </span>
                  </div>
                </div>

                <div className="password-actions-item">
                  <div className="password-list-item-label">Password: </div>
                  <div className="password-list-item-value">
                    <input
                      type={
                        visiblePasswords[password._id] ? "text" : "password"
                      }
                      value={password.password}
                      disabled
                      className="password-input"
                    />
                    <span
                      onClick={() => togglePasswordVisibility(password._id)}
                      style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                    >
                      {visiblePasswords[password._id] ? (
                        <EyeOff color="var(--text-color2)" size="1.2rem" />
                      ) : (
                        <Eye color="var(--text-color2)" size="1.2rem" />
                      )}
                    </span>
                    <span
                      onClick={() => copyToClipboard(password.password)}
                      style={{ cursor: "pointer", marginLeft: "1rem" }}
                    >
                      <Copy color="var(--text-color2)" size="1.2rem" />
                    </span>
                  </div>
                </div>

                <div className="password-actions-item">
                  <div className="password-list-item-label">Note: </div>
                  <div className="password-list-item-value">
                    <input
                      type="text"
                      value={password.note ? password.note : "N/A"}
                      disabled
                      className="password-input"
                    />
                  </div>
                </div>
              </div>
              <TbEdit
                onClick={() => {
                  setSelectedPassword(password);
                  setIsEditing(true);
                }}
                color="var(--text-color3)"
                size="1.7rem"
                style={{
                  stroke: "var(--text-color2)",
                  strokeWidth: "1.3",
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  cursor: "pointer",
                }}
              />
              {breachStatuses[password._id]?.breached ? (
                <span className={`passwords-list-item-breach-status breached`}>
                  Your password has been breached in{" "}
                  {breachStatuses[password._id]?.breachCount} places.
                </span>
              ) : (
                <span className="passwords-list-item-breach-status notBreached">
                  Your password is safe.
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isShowSortOptions && (
        <div className="passwords-sort-dropdown">
          <span>Sort by:</span>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="date-desc">Date (Newest First)</option>
            <option value="size-asc">Size (Smallest First)</option>
            <option value="size-desc">Size(Largest First)</option>
          </select>{" "}
        </div>
      )}
      {isAddPassword && (
        <AddPassword
          onClose={() => {
            setIsAddPassword(false);
          }}
        />
      )}
      {isEditing && (
        <EditPassword
          password={selectedFile}
          onClose={() => {
            setIsEditing(false);
            setSelectedPassword("");
          }}
        />
      )}
    </div>
  );
}
