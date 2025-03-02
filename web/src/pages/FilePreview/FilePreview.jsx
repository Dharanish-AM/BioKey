/* eslint-disable react/prop-types */


import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteFile, previewFile } from "../../services/fileOperations";
import "./FilePreview.css";
import { ArrowLeft, Download, EllipsisVertical, Heart, X } from "lucide-react";
import { FiDownload, FiMoreVertical } from "react-icons/fi";
import { FiHeart, FiFolderPlus, FiExternalLink, FiInfo, FiTrash2 } from "react-icons/fi";
import { fetchFolderList, handleFolderMove, likeOrUnlikeFile } from "../../services/userOperations";
import toast from "react-hot-toast";
import { formatFileSize } from "../../utils/formatFileSize";
import heartLiked from "../../assets/icons/like-heart.png"

export default function FilePreview({ file, onClose }) {
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [fileData, setFileData] = useState(null);
    const [error, setError] = useState(false);
    const [isShowOptions, setIsShowOptions] = useState(false);
    const [isAddToFolder, setIsAddToFolder] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const dispatch = useDispatch()
    const modalRef = useRef(null);
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const folders = useSelector((state) => state.user.folders);

    useEffect(() => {
        const fetchFilePreview = async () => {
            if (!file) return;
            try {
                const response = await previewFile(userId, file._id, token);
                if (response && response.url) {
                    setFileData(response);
                    setError(false);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Error fetching file preview:", error);
                setError(true);
            }
        };

        fetchFilePreview();
        fetchFolderList(userId, token, dispatch)
    }, [file, userId, token, dispatch]);

    useEffect(() => {
        if (file.isLiked) {
            setIsLiked(true)
        }
        else {
            setIsLiked(false)
        }
    }, [file])


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    const handleDownload = async () => {
        if (!fileData?.url) return;

        try {
            const response = await fetch(fileData.url, { mode: "cors" });
            if (!response.ok) throw new Error("Failed to fetch file");

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileData.fileName || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);


            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const handleAddToFavorites = async () => {
        console.log("Toggling favorite for:", file.name);
        const response = await likeOrUnlikeFile(userId, file._id, token, file.type, dispatch);

        if (response.success) {
            if (isLiked) {
                setIsLiked(false);
                toast.success(`${file.name} removed from favourites`);
            } else {
                setIsLiked(true);
                toast.success(`${file.name} added to favourites`);
            }
        } else {
            toast.error(`${file.name} failed to update favourites`);
        }
    };



    const handleMoveFileToFolder = async (folderId) => {
        try {
            console.log("Moving file to folder:", folderId);
            const response = await handleFolderMove(userId, folderId, file._id, token, dispatch);
            if (response.success) {
                toast.success(`${file.name} moved to folder successfully`);
                setIsAddToFolder(false);
            } else {
                toast.error(`Failed to move ${file.name} to folder`);
            }
        } catch (error) {
            console.error("Error moving file:", error);
            toast.error("An error occurred while moving the file.");
        }
    };


    const handleOpenInNewTab = () => {
        if (fileData?.url) {
            window.open(fileData.url, "_blank");
        }
    };

    const handleMoreDetails = () => {
        console.log("Showing details for:", file.name);
        setIsShowMoreInfo(true)
    };

    const handleDelete = async () => {
        console.log("Deleting file:", file.name);
        const response = await deleteFile(userId, file._id, file.type, token, dispatch);
        console.log(response)
        if (response.success) {
            toast.success(`${file.name} deleted successfully`);
            onClose()
        }
        else {
            toast.error(`${file.name} failed to delete`);
        }

    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsShowOptions(false);
                setIsAddToFolder(false)
                setIsShowMoreInfo(false)

            }
        }

        if (isShowOptions) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isShowOptions]);

    const renderPreview = () => {
        if (error || !fileData) {
            return <p className="error-text">No preview available for this file.</p>;
        }

        switch (file.type) {
            case "images":
                return <ImagePreview fileData={fileData} />;
            case "videos":
                return <VideoPreview fileData={fileData} />;
            case "audios":
                return <AudioPreview thumbnail={file.thumbnail} fileData={fileData} />;
            default:
                return <OtherFilePreview fileData={fileData} fileName={file.name} />;
        }
    };

    return (
        <div className="file-preview-container" >
            <div className="file-preview-header">
                <div className="file-preview-header-left">
                    <X style={{ cursor: "pointer" }} onClick={onClose} size={"1.7rem"} color="var(--text-color3)" />
                    <div className="file-preview-name">{file.name}</div>
                    {
                        file.isLiked && <img style={{
                            width: "2rem",
                            height: "2rem",
                            aspectRatio: 1,

                        }} src={heartLiked} />
                    }
                </div>
                <div className="file-preview-header-right">
                    <FiDownload onClick={handleDownload} className="options-icons" size={"1.5em"} />
                    <FiMoreVertical className="options-icons" onClick={() => {
                        setIsShowOptions((state) => !state)
                    }} style={{
                        cursor: "pointer"
                    }} size={"1.5rem"} />
                </div>
            </div>

            <div className="file-preview-content">{renderPreview()}</div>

            <div className="file-preview-footer"></div>
            {isShowOptions &&
                <div ref={modalRef} className="file-options-modal">

                    {isAddToFolder ? (
                        <div className="folder-list-options">
                            {folders.length > 0 ? (
                                folders.map((folder, index) => {
                                    const fileExists = folder.files.some(f => f._id === file._id);

                                    return (
                                        <div
                                            key={folder.folderId}
                                            className={`folder-item-options 
                        ${index === 0 ? "first-folder-options" : ""} 
                        ${index === folders.length - 1 ? "last-folder-options" : ""} 
                        ${fileExists ? "disabled-folder" : ""}`
                                            }
                                            onClick={!fileExists ? () => handleMoveFileToFolder(folder.folderId) : undefined}
                                        >
                                            📁 {folder.folderName}
                                            {fileExists && <span className="file-exists"> (Already Exists)</span>}
                                        </div>
                                    );
                                })
                            ) : (
                                <p>No folders available</p>
                            )}
                        </div>

                    ) : isShowMoreInfo ? (
                        <div className="file-more-info-options">
                            <div className="file-more-info-options-row">
                                <div className="file-more-info-options-label">Name:</div>
                                <div className="file-more-info-options-value name">{file.name}</div>
                            </div>
                            <div className="file-more-info-options-row">
                                <div className="file-more-info-options-label">Created At:</div>
                                <div className="file-more-info-options-value">{new Date(file.createdAt).toLocaleDateString()}</div>
                            </div>
                            <div className="file-more-info-options-row">
                                <div className="file-more-info-options-label">Size:</div>
                                <div className="file-more-info-options-value">{formatFileSize(file.size)} KB</div>
                            </div>
                            <div className="file-more-info-options-row">
                                <div className="file-more-info-options-label">Type:</div>
                                <div className="file-more-info-options-value">{file.type}</div>
                            </div>
                            <div className="file-more-info-options-row">
                                <div className="file-more-info-options-label">Folders:</div>
                                <div className={`file-more-info-options-value ${file.folders.length === 0 ? "no-folders" : file.folders.length >= 3 ? "folders-wrap" : ""}`}>
                                    {file.folders.length > 0 ? file.folders.join(", ") : "No folders available"}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="file-option first" onClick={handleAddToFavorites}>
                                <FiHeart size={"1.2rem"} className="file-option-icon" />
                                {isLiked ? "Remove from favorites" : "Add to favorites"}
                            </div>
                            <div className="file-option" onClick={() => setIsAddToFolder(true)}>
                                <FiFolderPlus size={"1.2rem"} className="file-option-icon" />
                                Add to folder
                            </div>
                            <div className="file-option" onClick={handleOpenInNewTab}>
                                <FiExternalLink size={"1.2rem"} className="file-option-icon" />
                                Open in new tab
                            </div>
                            <div className="file-option" onClick={handleMoreDetails}>
                                <FiInfo size={"1.2rem"} className="file-option-icon" />
                                More details
                            </div>
                            <div className="file-option delete" onClick={handleDelete}>
                                <FiTrash2 size={"1.2rem"} className="file-option-icon" />
                                Delete
                            </div>
                        </>
                    )}
                </div>

            }

        </div>
    );
}



function ImagePreview({ fileData }) {
    return <img src={fileData.url} className="file-preview-file" alt="Image Preview" onError={(e) => e.target.style.display = "none"} />;
}

function VideoPreview({ fileData }) {
    return (
        <video autoPlay loop controls className="file-preview-file" onError={(e) => e.target.style.display = "none"}>
            <source src={fileData.url} type={fileData.contentType || "video/mp4"} />
            Your browser does not support the video tag.
        </video>
    );
}

function AudioPreview({ thumbnail, fileData }) {
    if (!fileData?.url) {
        return <p className="error-text">Audio preview not available.</p>;
    }
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem"
        }}>
            <img style={{
                width: "70%",
                height: "70%",
                aspectRatio: 1
            }} src={thumbnail} />
            <audio autoPlay loop controls onError={(e) => e.target.style.display = "none"}>
                <source src={fileData.url} type={fileData.contentType || "audio/mpeg"} />
                Your browser does not support the audio element.
            </audio>
        </div>
    );
}

const OtherFilePreview = ({ fileData, fileName }) => {
    if (!fileData?.url) {
        return <p className="error-text">No preview available.</p>;
    }

    const fileUrl = fileData.url;
    const fileExtension = fileName?.split(".").pop()?.toLowerCase();


    const isIframeSupported = ["pdf", "html", "svg", "txt"].includes(fileExtension);

    return (
        <div className="other-file-preview">
            {isIframeSupported ? (
                <iframe
                    src={fileUrl}
                    title={fileName || "File Preview"}
                    className="file-preview-iframe"
                    allowFullScreen
                ></iframe>
            ) : (
                <p className="error-text">No preview available for this file type.</p>
            )}
        </div>
    );
};
