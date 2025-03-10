import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, X } from "lucide-react";
import "./Folders.css";
import {
  fetchFolderList,
  handleFolderCreate,
} from "../../services/userOperations";
import FolderIcon from "../../assets/images/folder.png";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatFileSize } from "../../utils/formatFileSize";
import FilePreview from "../FilePreview/FilePreview";
import toast from "react-hot-toast";

export default function Folders() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const folderId = queryParams.get("folderId");
  const folderName = queryParams.get("folderName");
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const folders = useSelector((state) => state.user.folders) || [];
  const navigation = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [fileSearchTerm, setFileSearchTerm] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFileFilterModalOpen, setIsFileFilterModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState("date-newest");
  const [folderFiles, setFolderFiles] = useState([]);
  const [fileSortOption, setFileSortOption] = useState("name-asc");
  const [previewFile, setPreviewFile] = useState();
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (folderId) {
      const selectedFolder = folders.find(
        (folder) => folder.folderId === folderId
      );
      setFolderFiles(selectedFolder?.files || []);
    }
  }, [folderId, folders]);

  useEffect(() => {
    if (userId && token) {
      fetchFolderList(userId, token, dispatch);
    }
  }, [dispatch, token, userId]);

  const handleCreateFolder = async () => {
    const response = await handleFolderCreate(
      userId,
      newFolderName,
      token,
      dispatch
    );

    if (response.success) {
      toast.success("Folder created successfully");
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
    } else {
      toast.error("Failed to create folder");
    }
  };

  const filteredFolders = useMemo(() => {
    return folders
      .filter((folder) =>
        folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOption === "alphabetical-asc")
          return a.folderName.localeCompare(b.folderName);
        if (sortOption === "alphabetical-desc")
          return b.folderName.localeCompare(a.folderName);
        if (sortOption === "date-newest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortOption === "date-oldest")
          return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
      });
  }, [folders, searchTerm, sortOption]);

  const filteredFiles = useMemo(() => {
    return [...folderFiles]
      .filter((file) =>
        file.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (fileSortOption === "name-asc") return a.name.localeCompare(b.name);
        if (fileSortOption === "name-desc") return b.name.localeCompare(a.name);
        if (fileSortOption === "size-smallest") return a.size - b.size;
        if (fileSortOption === "size-largest") return b.size - a.size;
        if (fileSortOption === "date-newest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        if (fileSortOption === "date-oldest")
          return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
      });
  }, [folderFiles, fileSearchTerm, fileSortOption]);

  return (
    <div className="folders-container">
      <div className="folders-header">
        <span className="folders-title">
          {folderId ? folderName : "Folders"}
        </span>

        <div className="folders-options-container">
          <div
            onClick={() => {
              setIsCreateFolderModalOpen(true);
            }}
            className="create-folder-button"
          >
            Create Folder
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
            }}
          >
            <input
              type="text"
              placeholder={folderId ? "Search files..." : "Search folders..."}
              className="folder-search-input"
              value={folderId ? fileSearchTerm : searchTerm}
              onChange={(e) =>
                folderId
                  ? setFileSearchTerm(e.target.value)
                  : setSearchTerm(e.target.value)
              }
            />
            <Search
              style={{ position: "absolute", left: "1rem" }}
              color="var(--text-color2)"
              size={"1.5rem"}
            />
            {(folderId ? fileSearchTerm : searchTerm) && (
              <X
                style={{
                  position: "absolute",
                  right: "1rem",
                  cursor: "pointer",
                }}
                color="var(--text-color2)"
                size={"1.3rem"}
                onClick={() =>
                  folderId ? setFileSearchTerm("") : setSearchTerm("")
                }
              />
            )}
          </div>

          <SlidersHorizontal
            color="var(--text-color3)"
            size={"1.7rem"}
            onClick={() =>
              folderId
                ? setIsFileFilterModalOpen(true)
                : setIsFilterModalOpen(true)
            }
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      <div className="folders-content">
        {folderId ? (
          folderFiles && folderFiles.length > 0 ? (
            <div className="folder-files-list">
              {filteredFiles.map((file) => (
                <div
                  onClick={() => setPreviewFile(file)}
                  key={file._id}
                  className="folder-file-item"
                >
                  <div className="folder-file-image-container">
                    <img
                      src={file.thumbnail}
                      alt={file.name}
                      className="folder-file-image"
                    />
                  </div>
                  <div className="folder-file-info">
                    <div className="folder-file-name">{file.name}</div>
                    <div className="folder-file-size">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: "1.1rem",
                fontStyle: "italic",
                alignSelf: "center",
              }}
            >
              ✖️ Oops! Looks like this folder is empty.
            </div>
          )
        ) : (
          <div className="folders-list">
            {folders && folders.length > 0 ? (
              filteredFolders.map((folder) => (
                <div
                  onClick={() =>
                    navigation(
                      `/folders?folderId=${folder.folderId}&folderName=${folder.folderName}`
                    )
                  }
                  className="folder-item"
                  key={folder.folderId}
                >
                  <div className="folder-icon-container">
                    <img
                      src={FolderIcon}
                      alt="folder-icon"
                      className="folder-icon"
                    />
                  </div>
                  <span className="folder-name">{folder.folderName}</span>
                </div>
              ))
            ) : (
              <div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                    alignSelf: "center",
                  }}
                >
                  ✖️ Oops! Looks like you don&apos;t have any folders.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isFilterModalOpen && !folderId && (
        <div className="folder-filter-modal">
          <div className="folder-modal-content">
            <div className="folder-modal-header">
              <span className="folder-modal-title">Filter Options</span>
              <X
                size="1.3rem"
                color="var(--text-color3)"
                onClick={() => setIsFilterModalOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="folder-modal-body">
              <label>Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="folder-sort-select"
              >
                <option value="date-newest">Date Created (Newest First)</option>
                <option value="date-oldest">Date Created (Oldest First)</option>
                <option value="alphabetical-asc">Alphabetical (A-Z)</option>
                <option value="alphabetical-desc">Alphabetical (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {isFileFilterModalOpen && folderId && (
        <div className="folder-filter-modal">
          <div className="folder-modal-content">
            <div className="folder-modal-header">
              <span className="folder-modal-title">Filter Files</span>
              <X
                size="1.3rem"
                color="var(--text-color3)"
                onClick={() => setIsFileFilterModalOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="folder-modal-body">
              <label>Sort by:</label>
              <select
                value={fileSortOption}
                onChange={(e) => setFileSortOption(e.target.value)}
                className="folder-sort-select"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="size-smallest">Size (Smallest First)</option>
                <option value="size-largest">Size (Largest First)</option>
                <option value="date-newest">Date Created (Newest First)</option>
                <option value="date-oldest">Date Created (Oldest First)</option>
              </select>
            </div>
          </div>
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
      {isCreateFolderModalOpen && (
        <div className="create-folder-modal-content">
          <label
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            Folder Name:
          </label>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter new folder name"
          />
          <button onClick={handleCreateFolder}>Create Folder</button>
        </div>
      )}
    </div>
  );
}
