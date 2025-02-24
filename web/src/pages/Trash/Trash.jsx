import { Search } from "lucide-react";
import "./Trash.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchRecycleBinFiles } from "../../services/fileOperations";
import { formatFileSize } from "../../utils/formatFileSize";
import { IoTrashOutline } from "react-icons/io5";

export default function Trash() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const TrashFiles = useSelector((state) => state.files.recycleBinFiles);

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchRecycleBinFiles(userId, token, dispatch);
    }, [userId, token, dispatch]);


    const sortedFiles = [...TrashFiles].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));


    const filteredFiles = sortedFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="trash-container">
            <div className="trash-header">
                <span className="trash-title">Trash</span>
                <div className="trash-options-container">
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2rem",
                    }} >
                        <div className="clear-trash-button">
                            <IoTrashOutline color="var(--text-color3)" size={"1.2rem"} />
                            Clear Trash
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
                    </div>
                </div>
            </div>
            <div className="trash-content">
                <div className="trash-files-list">
                    {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <div key={file.id} className="trash-file-item">
                                <div className="trash-file-icon-container">
                                    <img src={file.thumbnailUrl} alt={file.name} className="trash-file-icon" />
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
