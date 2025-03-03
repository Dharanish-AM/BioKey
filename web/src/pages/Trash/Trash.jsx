import { Search, X } from "lucide-react";
import "./Trash.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchRecycleBinFiles, permanentDelete, restoreFile } from "../../services/fileOperations";
import { formatFileSize } from "../../utils/formatFileSize";
import { IoTrashOutline } from "react-icons/io5";
import { FileIcon, defaultStyles } from "react-file-icon";
import toast from "react-hot-toast";
import { TbCheckbox } from "react-icons/tb";

export default function Trash() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const TrashFiles = useSelector((state) => state.files.recycleBinFiles);

    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [isMultiSelect, setIsMultiSelect] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchRecycleBinFiles(userId, token, dispatch);
    }, [userId, token, dispatch]);

    const getFileExtension = (fileName) => fileName.split(".").pop();
    const sortedFiles = [...TrashFiles].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
    const filteredFiles = sortedFiles.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleFileSelection = (fileId) => {
        setSelectedFiles((prev) => {
            const newSelection = new Set(prev);
            newSelection.has(fileId) ? newSelection.delete(fileId) : newSelection.add(fileId);
            return newSelection;
        });
    };

    const handleClearTrash = async (isAll = false) => {
        const confirmation = confirm(`Are you sure you want to delete ${isAll ? "all files" : "the selected files"}?`);

        if (confirmation) {
            const fileIds = isAll ? [] : Array.from(selectedFiles);
            console.log(fileIds);

            const apiResponse = await permanentDelete(userId, fileIds, isAll, token, dispatch);
            if (apiResponse.success) {
                toast.success("Files deleted successfully");
                setSelectedFiles(new Set());
            } else {
                toast.error(apiResponse.message);
            }
        }
    };

    const handleRestoreTrash = async (isAll = false) => {
        const confirmation = confirm(`Are you sure you want to restore ${isAll ? "all files" : "the selected files"}?`);

        if (!confirmation) return;

        const fileIds = isAll ? [] : Array.from(selectedFiles);


        const selectedTypes = new Set([...TrashFiles]
            .filter(file => selectedFiles.has(file._id))
            .map(file => file.type)
        );

        const type = selectedTypes.size === 1 ? [...selectedTypes][0] : "all";

        try {
            const apiResponse = await restoreFile(userId, fileIds, type, token, dispatch);

            if (apiResponse?.success) {
                toast.success("Files restored successfully");
                setSelectedFiles(new Set());
            } else {
                toast.error(apiResponse?.message || "Failed to restore files.");
            }
        } catch (error) {
            console.error("Restore error:", error);
            toast.error("Failed to restore files. Please try again.");
        }
    };



    return (
        <div className="trash-container">
            <div className="trash-header">
                <span className="trash-title">Trash</span>
                <div className="trash-options-container">
                    <div
                        className="recycle-bin-checkbox"
                        onClick={() => {
                            setIsMultiSelect(!isMultiSelect);
                            if (!isMultiSelect) setSelectedFiles(new Set());
                        }}
                    >
                        {isMultiSelect ? <X color="var(--text-color2)" size={"1.7rem"} /> : <TbCheckbox color="var(--text-color2)" size={"1.9rem"} />}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="trash-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search style={{ position: "absolute", left: "1rem" }} color="var(--text-color2)" size={"1.5rem"} />
                    </div>
                    <div onClick={() => handleRestoreTrash(isMultiSelect ? false : true)} className="restore-trash-button">
                        {isMultiSelect ? "Restore Selected" : "Restore All"}
                    </div>
                    <div onClick={() => handleClearTrash(isMultiSelect ? false : true)} className="clear-trash-button">
                        <IoTrashOutline color="var(--text-color3)" size={"1.2rem"} />
                        {isMultiSelect ? "Delete Selected" : "Clear Trash"}
                    </div>
                </div>
            </div>
            <div className="trash-content">
                <div className="trash-files-list">
                    {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <div
                                key={file._id}
                                className={`trash-file-item ${selectedFiles.has(file.id) ? "selected" : ""}`}
                            >
                                {isMultiSelect && (
                                    <input
                                        type="checkbox"
                                        checked={selectedFiles.has(file._id)}
                                        onChange={() => toggleFileSelection(file._id)}
                                        className="recycle-bin-file-checkbox"
                                    />
                                )}
                                <div className="trash-file-icon-container">
                                    {file.type === "others" ? (
                                        <FileIcon fold={true} radius={3} extension={getFileExtension(file.name)} {...defaultStyles[getFileExtension(file.name)]} />
                                    ) : (
                                        <img src={file.thumbnailUrl} alt={file.name} className="trash-file-icon" />
                                    )}
                                </div>
                                <div className="trash-file-info">
                                    <div className="trash-file-name">{file.name}</div>
                                    <div className="trash-file-size">{formatFileSize(file.size)}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-files-message">No files found</p>
                    )}
                </div>
            </div>
        </div>
    );
}
