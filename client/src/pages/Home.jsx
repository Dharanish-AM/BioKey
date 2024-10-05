import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Logo from "../assets/BioKey_Logo.png";
import axios from "axios";
import Modal from "../components/Modal";
import Options from "../components/Options";

function Home() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState({ url: "", name: "" });
  const [user, setUser] = useState(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(null);

  const fetchFiles = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Token not found, redirecting to login.");

      const response = await axios.get("http://localhost:3000/viewfiles", {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user.user_id },
      });

      if (response.status === 200) {
        setFiles(response.data.files);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(
        "Error fetching files:",
        error.response?.data || error.message
      );
      sessionStorage.removeItem("token");
      navigate("/login");
    }
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const response = await axios.post("http://localhost:3000/checktoken", {
          token,
        });
        const { exp } = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (exp < currentTime) {
          sessionStorage.removeItem("token");
          return navigate("/login");
        }

        const userDetailsResponse = await axios.get(
          "http://localhost:3000/getuserdetails",
          {
            params: { email: response.data.user.email },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(userDetailsResponse.data.user);
      } catch (error) {
        console.error("Token validation failed:", error);
        sessionStorage.removeItem("token");
        navigate("/login");
      }
    };

    validateToken();
  }, [navigate]);

  useEffect(() => {
    if (user && user.user_id) {
      fetchFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setSelectedFiles(selectedFiles);
  };

  const uploadFile = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select a file to upload");
      return;
    }

    const form = new FormData();
    selectedFiles.forEach((file) => form.append(`files[]`, file));
    form.append("userId", user.user_id);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post("http://localhost:3000/upload", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        fetchFiles();
      }
    } catch (error) {
      console.error("File upload failed", error);
    }
  };

  const handleDelete = async (file) => {
    const fileKey = file.Key;
    if (typeof fileKey !== "string") {
      console.error("fileKey is not a string", fileKey);
      return;
    }

    const actualFileKey = fileKey.split("/").pop();
    if (!actualFileKey) return;

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(`http://localhost:3000/deletefile`, {
        params: { fileKey: actualFileKey, userId: user.user_id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        fetchFiles();
      } else {
        console.error(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }
  };

  const handleSearch = () => {
    console.log("Search functionality to be implemented");
  };

  const openModal = (file) => {
    setModalFile({ url: file.Url, name: file.Key });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalFile({ url: "", name: "" });
  };

  const handleOptionsClick = (index) => {
    setIsOptionsOpen(isOptionsOpen === index ? null : index);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div
          className="home-header-left-titlelogo"
          onClick={() => window.location.reload()}
        >
          <img src={Logo} className="home-header-logo" alt="BioKey Logo" />
          <span className="home-header-text">BioKey</span>
        </div>
        <div className="search-container">
          <div className="search-icon">
            <i className="fas fa-search"></i>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Enter the file name"
          />
          <button
            type="button"
            className="search-button"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className="profile-container">
          <div className="profile-icon">
            <i className="fas fa-user"></i>
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="left">
          <div className="left-top">
            {user && <span className="name-greeting">Hello {user.name}!</span>}
            <button className="addfile-button">Add File</button>
          </div>
          <div className="left-center-recent"></div>
        </div>
        <div className="right">
          <div className="medias-container">
            <div className="box images-box">Images</div>
            <div className="box videos-box">Videos</div>
            <div className="box documents-box">Documents</div>
            <div className="box audios-box">Audios</div>
            <div className="box passwords-box">Passwords</div>
            <div className="box recently-deleted-box">Recently Deleted</div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        fileUrl={modalFile.url}
        fileName={modalFile.name}
      />
    </div>
  );
}

export default Home;
