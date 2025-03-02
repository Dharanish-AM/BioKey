import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory, uploadMedia } from "../../../services/fileOperations";
import { formatFileSize } from "../../../utils/formatFileSize";
import { EllipsisVertical, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import "./Videos.css";
import toast from "react-hot-toast";
import { FaPlay } from "react-icons/fa6";
import FilePreview from "../../FilePreview/FilePreview";

export default function Videos() {
    const videos = useSelector((state) => state.files.videos);
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [isAddingVideos, setIsAddingVideos] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const fileInputRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name-asc");
    const [isShowSortOptions, setIsShowSortOptions] = useState(false);

    useEffect(() => {
        if (userId && token) {
            fetchFilesByCategory(userId, "videos", token, dispatch);
        }
    }, [dispatch, userId, token]);

    const handleAddFiles = () => {
        setIsAddingVideos(true);
        fileInputRef.current.click();
    };

    const handleVideosChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length > 0) {
            console.log("Selected files:", selectedFiles);
            const response = await uploadMedia(userId, selectedFiles, token, dispatch);

            if (response.success) {
                fetchFilesByCategory(userId, "videos", token, dispatch);
                toast.success("Upload successful!");
            } else {
                toast.error(response.message || "Upload failed. Please try again.");
            }
        }
    };

    const filteredVideos = videos.filter((video) =>
        video.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedVideos = [...filteredVideos].sort((a, b) => {
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
        <div className="videos-container">
            <div className="videos-container-header">
                <span className="videos-container-title">Videos</span>
                <div className="videos-container-header-options">
                    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search videos..."
                            className="videos-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search style={{ position: "absolute", left: "1rem" }} color="var(--text-color2)" size={"1.5rem"} />
                        {searchTerm && (
                            <X
                                style={{ position: "absolute", right: "1rem", cursor: "pointer" }}
                                color="var(--text-color2)" size={"1.3rem"}
                                onClick={() => setSearchTerm("")}
                            />
                        )}
                    </div>

                    <SlidersHorizontal
                        onClick={() => setIsShowSortOptions((state) => !state)}
                        style={{ cursor: "pointer" }}
                        color="var(--text-color2)" size={"1.7rem"}
                    />

                    <div className="add-videos-btn" onClick={handleAddFiles}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            multiple
                            accept="video/*"
                            onChange={handleVideosChange}
                        />
                        <Plus size={"1.5rem"} color="var(--text-color3)" /> <span>|</span> Add Files
                    </div>
                </div>
            </div>

            <div className="videos-container-body">
                <div className="videos-container-list">
                    {sortedVideos.length > 0 ? (
                        sortedVideos.map((video) => (
                            <div
                                key={video._id}
                                className="video-list-item"
                                onClick={() => setPreviewFile(video)}
                            >
                                <div className="video-list-item-video-container">
                                    <FaPlay color="var(--text-color3)" size={"2.3rem"} style={{
                                        position: "absolute",
                                        zIndex: 1,
                                        opacity: "0.8"
                                    }} />
                                    <div className="video-overlay-black"></div>
                                    <img src={video.thumbnail} alt={video.fileName} className="video-thumbnail" />
                                </div>
                                <div className="video-list-item-details">
                                    <span className="video-list-item-name">{video.name}</span>
                                    <span className="video-list-item-size">{formatFileSize(video.size)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-files-found">No videos found</div>
                    )}
                </div>
            </div>
            {isShowSortOptions && (
                <div className="videos-sort-dropdown">
                    <span>Sort by:</span>
                    <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="date-asc">Date (Oldest First)</option>
                        <option value="date-desc">Date (Newest First)</option>
                        <option value="size-asc">Size (Smallest First)</option>
                        <option value="size-desc">Size (Largest First)</option>
                    </select>
                </div>
            )}
            {
                previewFile && <FilePreview file={previewFile} onClose={() => {
                    setPreviewFile(null);
                }} />
            }
        </div>
    );
}
