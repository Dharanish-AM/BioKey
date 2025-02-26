/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { previewFile } from "../../services/fileOperations";
import "./FilePreview.css";
import { EllipsisVertical, X } from "lucide-react";

export default function FilePreview({ file, onClose }) {
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [fileData, setFileData] = useState(null);
    const [error, setError] = useState(false);

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
    }, [file, userId, token]);

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
                return <AudioPreview fileData={fileData} />;
            default:
                return <OtherFilePreview fileData={fileData} fileName={file.fileName} />;
        }
    };

    return (
        <div className="file-preview-container">
            <div className="file-preview-header">
                <div className="file-preview-header-left">
                    <X style={{ cursor: "pointer" }} onClick={onClose} size={"1.7rem"} color="var(--text-color3)" />
                    <div className="file-preview-name">{file.name}</div>
                </div>
                <EllipsisVertical style={{ cursor: "pointer" }} size={"1.7rem"} color="var(--text-color3)" />
            </div>

            <div className="file-preview-content">{renderPreview()}</div>

            <div className="file-preview-footer"></div>
        </div>
    );
}



function ImagePreview({ fileData }) {
    return <img src={fileData.url} className="file-preview-file" alt="Image Preview" onError={(e) => e.target.style.display = "none"} />;
}

function VideoPreview({ fileData }) {
    return (
        <video controls className="file-preview-file" onError={(e) => e.target.style.display = "none"}>
            <source src={fileData.url} type={fileData.contentType || "video/mp4"} />
            Your browser does not support the video tag.
        </video>
    );
}

function AudioPreview({ fileData }) {
    if (!fileData?.url) {
        return <p className="error-text">Audio preview not available.</p>;
    }
    return (
        <audio controls onError={(e) => e.target.style.display = "none"}>
            <source src={fileData.url} type={fileData.contentType || "audio/mpeg"} />
            Your browser does not support the audio element.
        </audio>
    );
}

function OtherFilePreview({ fileData, fileName }) {
    if (!fileData?.url) {
        return <p className="error-text">No preview available.</p>;
    }
    return (
        <iframe
            title={fileName || "File Preview"}
            referrerPolicy="no-referrer"
            loading="lazy"
            allowFullScreen={true}
            className="other-file-preview"
            src={fileData.url}
            onError={(e) => e.target.style.display = "none"}
        ></iframe>
    );
}
