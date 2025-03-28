import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilesByCategory,
  uploadMedia,
} from "../../../services/fileOperations";
import { formatFileSize } from "../../../utils/formatFileSize";
import {
  EllipsisVertical,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import "./Audios.css";
import toast from "react-hot-toast";
import { FaHeadphones, FaHeadphonesSimple, FaPlay } from "react-icons/fa6";
import FilePreview from "../../FilePreview/FilePreview";

export default function Audios() {
  const audios = useSelector((state) => state.files.audios);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const [isAddingAudios, setIsAddingAudios] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name-asc");
  const [isShowSortOptions, setIsShowSortOptions] = useState(false);

  useEffect(() => {
    if (userId && token) {
      fetchFilesByCategory(userId, "audios", token, dispatch);
    }
  }, [dispatch, userId, token]);

  const handleAddFiles = () => {
    setIsAddingAudios(true);
    fileInputRef.current.click();
  };

  const handleAudiosChange = async (event) => {
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
        fetchFilesByCategory(userId, "audios", token, dispatch);
        toast.success("Upload successful!");
      } else {
        toast.error(response.message || "Upload failed. Please try again.");
      }
    }
  };

  const filteredAudios = audios.filter((audio) =>
    audio.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedAudios = [...filteredAudios].sort((a, b) => {
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
    <div className="audios-container">
      <div className="audios-container-header">
        <span className="audios-container-title">Audios</span>
        <div className="audios-container-header-options">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder="Search audios..."
              className="audios-search-input"
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
            onClick={() => setIsShowSortOptions((state) => !state)}
            style={{ cursor: "pointer" }}
            color="var(--text-color2)"
            size={"1.7rem"}
          />

          <div className="add-audios-btn" onClick={handleAddFiles}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              accept="audio/*"
              onChange={handleAudiosChange}
            />
            <Plus size={"1.5rem"} color="var(--text-color3)" /> <span>|</span>{" "}
            Add Files
          </div>
        </div>
      </div>

      <div className="audios-container-body">
        <div className="audios-container-list">
          {sortedAudios.length > 0 ? (
            sortedAudios.map((audio) => (
              <div
                onClick={() => {
                  setPreviewFile(audio);
                }}
                key={audio._id}
                className="audio-list-item"
              >
                <div className="audio-list-item-audio-container">
                  <FaHeadphonesSimple
                    color="var(--text-color3)"
                    size={"2.3rem"}
                    style={{
                      position: "absolute",
                      zIndex: 1,
                      opacity: "0.8",
                    }}
                  />
                  <div className="audio-overlay-black"></div>
                  <img
                    src={audio.thumbnail}
                    alt={audio.fileName}
                    className="audio-thumbnail"
                  />
                </div>
                <div className="audio-list-item-details">
                  <span className="audio-list-item-name">{audio.name}</span>
                  <span className="audio-list-item-size">
                    {formatFileSize(audio.size)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-files-found">No audios found</div>
          )}
        </div>
      </div>
      {isShowSortOptions && (
        <div className="audios-sort-dropdown">
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
