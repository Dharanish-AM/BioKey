import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFilesByCategory, uploadMedia } from "../../../services/fileOperations";
import { formatFileSize } from "../../../utils/formatFileSize";
import { EllipsisVertical, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import "./Images.css";
import toast from "react-hot-toast";
import FilePreview from "../../FilePreview/FilePreview";

export default function Images() {
    const images = useSelector((state) => state.files.images);
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [isAddingImages, setIsAddingImages] = useState(false);
    const fileInputRef = useRef(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name-asc");
    const [isShowSortOptions, setIsShowSortOptions] = useState(false);

    useEffect(() => {
        if (userId && token) {
            fetchFilesByCategory(userId, "images", token, dispatch);
        }
    }, [dispatch, userId, token]);

    const handleAddFiles = () => {
        setIsAddingImages(true);
        fileInputRef.current.click();
    };

    const handleImagesChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (selectedFiles.length > 0) {
            console.log("Selected files:", selectedFiles);
            const response = await uploadMedia(userId, selectedFiles, token, dispatch);

            if (response.success) {
                fetchFilesByCategory(userId, "images", token, dispatch);
                toast.success("Upload successful!");
            } else {
                toast.error(response.message || "Upload failed. Please try again.");
            }
        }
    };


    const filteredImages = images.filter((image) =>
        image.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const sortedImages = [...filteredImages].sort((a, b) => {
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
        <div className="images-container">
            <div className="images-container-header">
                <span className="images-container-title">Images</span>
                <div className="images-container-header-options">

                    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search images..."
                            className="images-search-input"
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

                    <SlidersHorizontal onClick={() => {
                        setIsShowSortOptions((state) => !state)
                    }} style={{
                        cursor: "pointer"
                    }} color="var(--text-color2)" size={"1.7rem"} />

                    <div className="add-images-btn" onClick={handleAddFiles}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            multiple
                            accept="image/*"
                            onChange={handleImagesChange}
                        />
                        <Plus size={"1.5rem"} color="var(--text-color3" /> <span>|</span> Add Files
                    </div>
                </div>
            </div>

            <div className="images-container-body">
                <div className="images-container-list">
                    {sortedImages.length > 0 ? (
                        sortedImages.map((image) => (
                            <div
                            
                                key={image._id}
                                className="image-list-item"
                                onClick={() => setPreviewFile(image)}
                            >
                                <div className="image-list-item-image-container">
                                    <img src={image.thumbnail} alt={image.fileName} className="image-thumbnail" />
                                </div>
                                <div className="image-list-item-details">
                                    <span className="image-list-item-name">{image.name}</span>
                                    <span className="image-list-item-size">{formatFileSize(image.size)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-files-found">No images found</div>
                    )}
                </div>
            </div>
            {
                isShowSortOptions && <div className="images-sort-dropdown">

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
            }
            {
                previewFile && <FilePreview file={previewFile} onClose={()=>{
                    setPreviewFile(null);
                }} />
            }
        </div>
    );
}
