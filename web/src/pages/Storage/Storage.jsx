import { useDispatch, useSelector } from "react-redux";
import "./Storage.css";
import { useEffect, useState } from "react";
import { getStorageInfo } from "../../services/userOperations";
import { deleteFile, fetchFilesByCategory, fetchRecycleBinFiles } from "../../services/fileOperations";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { formatFileSize } from "../../utils/formatFileSize";
import { IoTrashOutline } from "react-icons/io5";
import FilePreview from "../FilePreview/FilePreview";
import toast from "react-hot-toast";

ChartJS.register(ArcElement, Tooltip);

export default function Storage() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const [selectedFile, setSelectedFile] = useState(null);

    const images = useSelector((state) => state.files.images);
    const videos = useSelector((state) => state.files.videos);
    const audios = useSelector((state) => state.files.audios);
    const others = useSelector((state) => state.files.others);
    const recycleBin = useSelector((state) => state.files.recycleBin);

    const { storage, usedSpaceBytes, totalSpaceBytes } = useSelector((state) => state.user.storageInfo) || {
        storage: { images: 0, videos: 0, audios: 0, others: 0, recycleBin: 0 },
        usedSpaceBytes: 0,
        totalSpaceBytes: 0
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

        if (!recycleBin) {
            fetchRecycleBinFiles(userId, token, dispatch);
        }
    }, [userId, token, dispatch, images, videos, audios, others, recycleBin]);

    const totalUsedSpace = usedSpaceBytes + storage.recycleBin;

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
                    storage.recycleBin
                ],
                backgroundColor: COLORS,
                hoverBackgroundColor: COLORS.map(color => color + "CC"),
                borderWidth: 0,
                cutout: "65%",
            }
        ]
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
                    }
                }
            }
        }
    };


    const getFilteredFiles = () => {
        switch (selectedCategory) {
            case "images":
                return images || [];
            case "videos":
                return videos || [];
            case "audios":
                return audios || [];
            case "others":
                return others || [];
            case "recycleBin":
                return recycleBin || [];
            default:
                return [...(images || []), ...(videos || []), ...(audios || []), ...(others || [])];
        }
    };

    const filteredFiles = getFilteredFiles();

    const handleDeleteFile = async (file) => {
        const response = confirm(`Are you sure you want to delete ${file.name}?`);
        if (response) {
            const apiResponse = await deleteFile(userId, file._id, file.type, token, dispatch);
            if (apiResponse.success) {
                toast.success(`${file.name} delete successfully!`);
            }
            else {
                toast.success(`${file.name} delete failed!`);
            }
        }
    }

    return (
        <div className="storage-container">
            <div className="storage-container-top">
                <div className="storage-container-top-left">
                    <div className="storage-container-top-left-chart-container">
                        {totalUsedSpace > 0 ? (
                            <div className="chart-wrapper">
                                <Doughnut data={doughnutData} options={options} />
                                <div className="chart-center-text">
                                    <h3>{formatFileSize(totalUsedSpace)}</h3>
                                    <p>Used Space</p>
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
                    <div className="storage-container-bottom-options"></div>
                </div>
                <div className="storage-container-bottom-content">
                    <table className="storage-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Created At</th>
                                <th>Size</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFiles.length > 0 ? (
                                filteredFiles
                                    .sort((a, b) => b.size - a.size)
                                    .map((file, index) => (
                                        <tr onClick={() => {
                                            setSelectedFile(file);
                                        }} key={file._id}>
                                            <td>{index + 1}.{file.name}</td>
                                            <td style={{
                                                textTransform: "capitalize"
                                            }} >{file.type}</td>
                                            <td>{new Date(file.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                            <td>{formatFileSize(file.size)}</td>
                                            <td>
                                                <div onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFile(file)
                                                }} className="action-btn-container" >
                                                    <IoTrashOutline size={"1.4rem"} color="var(--red)" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                                        No files found in this category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>{
                selectedFile && <FilePreview file={selectedFile} onClose={() => {
                    setSelectedFile(null);
                }} />
            }
        </div>
    );
}
