import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilesByCategory,
  uploadMedia,
} from "../../../services/fileOperations";
import { formatFileSize } from "../../../utils/formatFileSize";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import "./Others.css";
import toast from "react-hot-toast";
import FilePreview from "../../FilePreview/FilePreview";
import { FileIcon, defaultStyles } from "react-file-icon";

export default function Others() {
  const others = useSelector((state) => state.files.others);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const [isAddingOthers, setIsAddingOthers] = useState(false);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [isShowSortOptions, setIsShowSortOptions] = useState(false);

  useEffect(() => {
    if (userId && token) {
      fetchFilesByCategory(userId, "others", token, dispatch);
    }
  }, [dispatch, userId, token]);

  const getFileExtension = (fileName) => fileName.split(".").pop();

  const handleAddFiles = () => {
    setIsAddingOthers(true);
    fileInputRef.current.click();
  };

  const handleOthersChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      console.log("Selected files:", selectedFiles);
      const response = await uploadMedia(
        userId,
        selectedFiles,
        token,
        dispatch,
      );

      if (response.success) {
        fetchFilesByCategory(userId, "others", token, dispatch);
        toast.success("Upload successful!");
      } else {
        toast.error(response.message || "Upload failed. Please try again.");
      }
    }
  };

  const filteredOthers = others.filter((other) =>
    other.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedOthers = [...filteredOthers].sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date-desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "size-asc":
        return a.size - b.size;
      case "size-desc":
        return b.size - a.size;
      default:
        return 0;
    }
  });

  return (
    <div className="others-container">
      <div className="others-container-header">
        <span className="others-container-title">Others</span>
        <div className="others-container-header-options">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Search others..."
              className="others-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              style={{ position: "absolute", left: "1rem" }}
              color="var(--text-color2)"
              size={"1.5rem"}
            />
            {searchTerm && (
              <X
                style={{
                  position: "absolute",
                  right: "1rem",
                  cursor: "pointer",
                }}
                color="var(--text-color2)"
                size={"1.3rem"}
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>

          <SlidersHorizontal
            onClick={() => {
              setIsShowSortOptions((state) => !state);
            }}
            style={{
              cursor: "pointer",
            }}
            color="var(--text-color2)"
            size={"1.7rem"}
          />

          <div className="add-others-btn" onClick={handleAddFiles}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              accept="other/*"
              onChange={handleOthersChange}
            />
            <Plus size={"1.5rem"} color="var(--text-color3" /> <span>|</span>{" "}
            Add Files
          </div>
        </div>
      </div>

      <div className="others-container-body">
        <div className="others-container-list">
          {sortedOthers.length > 0 ? (
            sortedOthers.map((other) => (
              <div
                key={other._id}
                className="other-list-item"
                onClick={() => setPreviewFile(other)}
              >
                <div className="other-list-item-other-container">
                  <FileIcon
                    fold={true}
                    radius={3}
                    extension={getFileExtension(other.name)}
                    {...defaultStyles[getFileExtension(other.name)]}
                  />
                </div>
                <div className="other-list-item-details">
                  <span className="other-list-item-name">{other.name}</span>
                  <span className="other-list-item-size">
                    {formatFileSize(other.size)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-files-found">No others found</div>
          )}
        </div>
      </div>
      {isShowSortOptions && (
        <div className="others-sort-dropdown">
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
            <option value="size-desc">Size (Largest First)</option>
          </select>
        </div>
      )}
      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => {
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
}
