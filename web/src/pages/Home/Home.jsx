

import { EllipsisVertical, Plus } from "lucide-react";
import "./Home.css";
import { useEffect, useRef, useState } from "react";

import ImageIcon from "../../assets/icons/image_icon.png";
import VideoIcon from "../../assets/icons/videos_icon.png";
import AudioIcon from "../../assets/icons/audio_icon.png";
import OtherIcon from "../../assets/icons/docs_icon.png";
import PassIcon from "../../assets/icons/pass_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecentFiles, fetchUsedSpace, getAllfileMetadata, uploadMedia } from "../../services/fileOperations";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatDate } from "../../utils/formatDate";
import toast from "react-hot-toast";

export default function Home() {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.user);
    const [isAddingFiles, setIsAddingFiles] = useState(false);
    const recentFiles = useSelector((state) => state.files.recents);
    const usedSpace = useSelector((state) => state.files.usedSpace);
    const allFilesMetaData = useSelector((state) => state.files.allFilesMetadata);

    const [fileCounts, setFileCounts] = useState({
        images: 0,
        videos: 0,
        audios: 0,
        others: 0,
        passwords: 0
    });

    useEffect(() => {
        getRecentFiles();
        getUsedSpace();
        fetchAllfilesMetaData();
    }, []);

    useEffect(() => {
        if (allFilesMetaData) {
            categorizeFiles(allFilesMetaData);
        }
    }, [allFilesMetaData]);

    const getRecentFiles = async () => {
        await fetchRecentFiles(userId, token, dispatch);
    };

    const getUsedSpace = async () => {
        await fetchUsedSpace(userId, token, dispatch);
    };

    const fetchAllfilesMetaData = async () => {
        await getAllfileMetadata(userId, token, dispatch);
    };

    const handleAddFiles = () => {
        setIsAddingFiles(true);
        fileInputRef.current.click();
    }

    const handleFileChange = async (event) => {
        const selectedFiles = Array.from(event.target.files);

        if (selectedFiles.length > 0) {
            console.log("Selected files:", selectedFiles);

            const response = await uploadMedia(userId, selectedFiles, token, dispatch);

            if (response.success) {
                toast.success("Upload successful!");
            } else {
                toast.error(response.message || "Upload failed. Please try again.");
            }

            console.log(response);
        }
    };


    const categorizeFiles = (data) => {
        const counts = {
            images: 0,
            videos: 0,
            audios: 0,
            others: 0,
            passwords: data.passwords?.length || 0,
            folders: data.folders?.length || 0
        };

        data.files.forEach((file) => {
            switch (file.type) {
                case "images":
                    counts.images++;
                    break;
                case "videos":
                    counts.videos++;
                    break;
                case "audios":
                    counts.audios++;
                    break;
                default:
                    counts.others++;
            }
        });

        setFileCounts(counts);
    };



    const usedSpaceBytes = usedSpace?.usedSpaceBytes || 0;
    const totalSpaceBytes = usedSpace?.totalSpaceBytes || 1;
    const storageUsed = ((usedSpaceBytes / totalSpaceBytes) * 100).toFixed(1);


    const QuickAccessItem = ({ icon, label, count }) => (
        <div className="quick-access-item">
            <div className="quick-access-item-content">
                <div className="quick-access-item-icon-container">
                    <img src={icon} alt={label} className="quick-access-item-icon" />
                </div>
                <div className="quick-access-item-text">{label}</div>
            </div>
            <div className="quick-access-item-count">{count} Files</div>
        </div>
    );


    return (
        <div className="home-container">
            <div className="home-header">
                <div className="home-header-text">Hello, {user.userName}! Your Vault Awaits.</div>
                <div className="home-add-files-btn" onClick={handleAddFiles}>
                    <Plus size={"1.5rem"} color="var(--text-color3)" /> <span>|</span> Add Files
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    multiple
                    onChange={handleFileChange}
                    visibility="hidden"
                />
            </div>
            <div className="home-content">
                <div className="home-storage-overview">
                    <div className="home-storage-header">
                        <div className="home-card-title">Storage Overview</div>
                        <div className="premium-btn">Get Premium !</div>
                    </div>
                    <div className="home-storage-content">
                        <div className="home-storage-text-container">
                            <div className="home-storage-space-text">{storageUsed}% Used</div>
                            <div className="home-storage-space-text">
                                {formatFileSize(usedSpaceBytes)} / {formatFileSize(totalSpaceBytes)}
                            </div>
                        </div>
                        <div className="home-storage-progress-track">
                            <div className="home-storage-progress-bar" style={{ width: `${storageUsed}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="home-quick-access">
                    <div style={{ marginBottom: "0.7rem" }} className="home-card-title">
                        Quick Access
                    </div>
                    <div className="quick-access-items">
                        <QuickAccessItem icon={ImageIcon} label="Images" count={fileCounts.images} />
                        <QuickAccessItem icon={VideoIcon} label="Videos" count={fileCounts.videos} />
                        <QuickAccessItem icon={AudioIcon} label="Audios" count={fileCounts.audios} />
                        <QuickAccessItem icon={OtherIcon} label="Others" count={fileCounts.others} />
                        <QuickAccessItem icon={PassIcon} label="Passwords" count={fileCounts.passwords} />
                    </div>
                </div>
                <div className="home-recent-files">
                    <div className="home-recent-files-header">
                        <div className="home-card-title">Recent Files</div>
                        <div className="home-card-see-all">View All</div>
                    </div>
                    <div className="recent-files-list">
                        {recentFiles && recentFiles.length > 0 ? (
                            recentFiles.map((file, index) => (
                                <div key={index} className="recent-file-item">
                                    <div className="recent-file-icon-container">
                                        <img src={file.thumbnail} alt={file.type} className="recent-file-icon" />
                                    </div>
                                    <div className="recent-file-item-right">
                                        <div className="recent-file-item-metadata">
                                            <div className="recent-file-text">{file.name}</div>
                                            <div className="recent-file-date">
                                                {formatFileSize(file.size)}&nbsp; • &nbsp;{formatDate(file.createdAt)}
                                            </div>
                                        </div>
                                        <EllipsisVertical size={"1.5rem"} color="var(--text-color2)" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-recent-files">No recent files found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
