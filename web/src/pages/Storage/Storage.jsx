import { useDispatch, useSelector } from "react-redux";
import "./Storage.css";
import { useEffect, useState } from "react";
import { getStorageInfo } from "../../services/userOperations";
import {
  deleteFile,
  fetchFilesByCategory,
  fetchRecycleBinFiles,
} from "../../services/fileOperations";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { formatFileSize } from "../../utils/formatFileSize";
import { IoTrashOutline } from "react-icons/io5";
import FilePreview from "../FilePreview/FilePreview";
import toast from "react-hot-toast";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import FilledHeartIcon from "../../assets/icons/like-heart.png";

ChartJS.register(ArcElement, Tooltip);

export default function Storage() {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("size-desc");
  const images = useSelector((state) => state.files.images);
  const videos = useSelector((state) => state.files.videos);
  const audios = useSelector((state) => state.files.audios);
  const others = useSelector((state) => state.files.others);
  const recycleBin = useSelector((state) => state.files.recycleBinFiles);

  const { storage, usedSpaceBytes, totalSpaceBytes } = useSelector(
    (state) => state.user.storageInfo,
  ) || {
    storage: { images: 0, videos: 0, audios: 0, others: 0, recycleBin: 0 },
    usedSpaceBytes: 0,
    totalSpaceBytes: 0,
  };

  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (userId && token) {
      getStorageInfo(userId, token, dispatch);
    }

    const categories = [
      { key: "images", state: images },
      { key: "videos", state: videos },
      { key: "audios", state: audios },
      { key: "others", state: others },
    ];

    categories.forEach(({ key, state }) => {
      if (!state || state.length === 0) {
        fetchFilesByCategory(userId, key, token, dispatch);
      }
    });

    fetchRecycleBinFiles(userId, token, dispatch);
  }, [dispatch]);

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#8884d8"];
  const doughnutData = {
    labels: ["Images", "Videos", "Audios", "Others", "Recycle Bin"],
    datasets: [
      {
        data: [
          storage.images,
          storage.videos,
          storage.audios,
          storage.others,
          storage.recycleBin,
        ],
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS.map((color) => color + "CC"),
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${formatFileSize(tooltipItem.raw)}`;
          },
        },
      },
    },
  };

  const getFilteredFiles = () => {
    let files = [];
    switch (selectedCategory) {
      case "images":
        files = images || [];
        break;
      case "videos":
        files = videos || [];
        break;
      case "audios":
        files = audios || [];
        break;
      case "others":
        files = others || [];
        break;
      case "recycleBin":
        files = recycleBin || [];
        break;
      default:
        files = [
          ...(images || []),
          ...(videos || []),
          ...(audios || []),
          ...(others || []),
        ];
    }

    return files
      .filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "size-asc":
            return a.size - b.size;
          case "size-desc":
            return b.size - a.size;
          case "date-asc":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "date-desc":
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
  };

  const filteredFiles = getFilteredFiles();

  const handleDeleteFile = async (file) => {
    const response = confirm(`Are you sure you want to delete ${file.name}?`);
    if (response) {
      const apiResponse = await deleteFile(
        userId,
        file._id,
        file.type,
        token,
        dispatch,
      );
      if (apiResponse.success) {
        toast.success(`${file.name} delete successfully!`);
      } else {
        toast.success(`${file.name} delete failed!`);
      }
    }
  };

  const fileCounts = {
    Images: images?.length || 0,
    Videos: videos?.length || 0,
    Audios: audios?.length || 0,
    Others: others?.length || 0,
    "Recycle Bin": recycleBin?.length || 0,
  };

  return (
    <div className="storage-container">
      <div className="storage-container-top">
        <div className="storage-container-top-left">
          <div className="storage-container-top-left-chart-container">
            {usedSpaceBytes > 0 ? (
              <div className="chart-wrapper">
                <Doughnut data={doughnutData} options={options} />
                <div className="chart-center-text">
                  <h3>{formatFileSize(usedSpaceBytes)}</h3>
                  <p>of</p>
                  <h3>{formatFileSize(totalSpaceBytes)}</h3>
                </div>
              </div>
            ) : (
              <p>No files found.</p>
            )}
          </div>
          <div className="storage-container-top-left-legends-container">
            {doughnutData.labels.map((label, index) => (
              <div key={index} className="legend-item">
                <span
                  className="legend-color"
                  style={{ backgroundColor: COLORS[index] }}
                ></span>
                <span className="legend-label">{label}:</span>
                <span className="legend-value">
                  {formatFileSize(doughnutData.datasets[0].data[index])}
                  {console.log(label, fileCounts[label])}
                  {" (" + fileCounts[label] + " files)"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="storage-container-top-right"></div>
      </div>
      <div className="storage-container-bottom">
        <div className="storage-container-bottom-header">
          <div className="storage-container-bottom-media-btn">
            {["all", "images", "videos", "audios", "others"].map((category) => (
              <div
                key={category}
                className={`media-btn-item ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
            ))}
          </div>
          <div className="storage-container-bottom-options">
            <div className="storage-container-bottom-search-container">
              <Search
                style={{
                  position: "absolute",
                  zIndex: 1,
                  left: "0.8em",
                  top: "0.6em",
                }}
                color="var(--text-color2)"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="search"
                className="storage-container-search"
                placeholder="Search files . . ."
              />
              <X
                onClick={() => {
                  setSearchQuery("");
                }}
                style={{
                  position: "absolute",
                  zIndex: 1,
                  right: "1rem",
                  top: "0.75em",
                  opacity: "0.5",
                  cursor: "pointer",
                }}
                size={"1.2rem"}
                color="var(--text-color2)"
              />
            </div>
            <div className="storage-container-sort-container">
              <Filter
                style={{
                  position: "absolute",
                  zIndex: 1,
                  left: "1em",
                  top: "0.8em",
                  cursor: "pointer",
                }}
                size={"1.5rem"}
                color="var(--text-color2)"
              />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="size-desc">Sort by Size (Largest First)</option>
                <option value="size-asc">Sort by Size (Smallest First)</option>
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="date-asc">Sort by Date (Oldest First)</option>
                <option value="date-desc">Sort by Date (Newest First)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="storage-container-bottom-content">
          <table className="storage-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Type</th>
                <th>Created At</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, index) => (
                  <tr
                    onClick={() => {
                      setSelectedFile(file);
                    }}
                    key={file._id}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {file.name}{" "}
                        {file.isLiked && (
                          <span>
                            &nbsp;
                            <img
                              src={FilledHeartIcon}
                              style={{
                                width: "2rem",
                                height: "2rem",
                                aspectRatio: 1,
                                objectFit: "contain",
                                marginTop: "0.5rem",
                              }}
                            />
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>{file.type}</td>
                    <td>
                      {new Date(file.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file);
                        }}
                        className="action-btn-container"
                      >
                        <IoTrashOutline size={"1.4rem"} color="var(--red)" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No files found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => {
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
}
