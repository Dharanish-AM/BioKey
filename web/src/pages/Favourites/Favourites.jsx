import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, X } from "lucide-react";
import "./Favourites.css";
import { fetchLikedFiles } from "../../services/userOperations";
import { formatFileSize } from "../../utils/formatFileSize";
import FilePreview from "../FilePreview/FilePreview";

export default function Favourites() {
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.user.userId);
    const token = useSelector((state) => state.auth.token);
    const favourites = useSelector((state) => state.files.likedFiles);
    const [previewFile, setPreviewFile] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("name-asc");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    useEffect(() => {
        fetchLikedFiles(userId, token, dispatch);
    }, [userId, token, dispatch]);

    const filteredFiles = favourites.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedFiles = [...filteredFiles].sort((a, b) => {
        switch (sortOption) {
            case "name-asc":
                return a.name.localeCompare(b.name);
            case "name-desc":
                return b.name.localeCompare(a.name);
            case "size-asc":
                return a.size - b.size;
            case "size-desc":
                return b.size - a.size;
            case "date-asc":
                return new Date(a.createdAt) - new Date(b.createdAt);
            case "date-desc":
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    return (
        <div className='favourites-container'>
            <div className='favourites-header'>
                <span className='favourites-title'>Favourites</span>
                <div className="favourites-options-container">
                    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search folders..."
                            className="favourites-search-input"
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
                        color="var(--text-color3)"
                        size={"1.7rem"}
                        onClick={() => setIsFilterModalOpen(true)}
                        style={{ cursor: "pointer" }}
                    />
                </div>
            </div>

            {isFilterModalOpen && (
                <div className="favourites-filter-modal">
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        width: "100%",
                    }}>
                        <span className="favourites-filter-modal-title">Sort By:</span>
                        <X style={{
                            cursor: "pointer",
                        }} onClick={() => setIsFilterModalOpen(false)} color="var(--text-color2)" size={"1.5rem"} />
                    </div>
                    <select className="favourites-modal-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="size-asc">Size (Smallest to Largest)</option>
                        <option value="size-desc">Size (Largest to Smallest)</option>
                        <option value="date-asc">Date Created (Oldest to Newest)</option>
                        <option value="date-desc">Date Created (Newest to Oldest)</option>
                    </select>

                </div>
            )}

            <div className="favourites-content">
                <div className="favourites-list">
                    {sortedFiles && sortedFiles.length > 0 ? sortedFiles.map((file) => (
                        <div onClick={() => {
                            setPreviewFile(file);
                        }} key={file._id} className="favourites-item">
                            <div className="favourites-item-image-container">
                                <img src={file.thumbnail} alt={file.fileName} className="favourites-image" />
                            </div>
                            <div className="favourites-item-details">
                                <span className="favourites-item-name">{file.name}</span>
                                <span className="favourites-item-size">{formatFileSize(file.size)}</span>
                            </div>
                        </div>
                    )) : <div style={{ fontSize: "1.1rem", fontStyle: "italic", marginTop: "20rem", marginLeft: "38rem" }} >✖️ No favourite files found </div>}
                </div>
            </div>
            {
                previewFile && <FilePreview onClose={() => {
                    setPreviewFile(null);
                }} file={previewFile} />
            }
        </div>
    );
}
