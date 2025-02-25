import "./Header.css";
import { Search, Bell, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

import ProfileIcon from "../../assets/images/profile_icon_1.png";
import Logo from "../../assets/icons/BioKey_Logo.png";
import { formatFileSize } from "../../utils/formatFileSize";
import FilePreview from "../../pages/FilePreview/FilePreview";

export default function Header({ onSearch }) {
    const allFilesMetaData = useSelector((state) => state.files.allFilesMetadata);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (allFilesMetaData?.files) {
            const filtered = allFilesMetaData.files.filter((file) =>
                file.name.toLowerCase().includes(query)
            );
            setFilteredFiles(filtered);
            onSearch(filtered);
        }
    };

    const handleCloseSearch = () => {
        setSearchQuery("");
        setFilteredFiles([]);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                handleCloseSearch();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (
        <div className="header-container">
            <div className="header-logo">
                <img src={Logo} alt="Logo" className="header-logo-img" />
                <div className="header-logo-text">BioKey</div>
            </div>

            <div className="header-search-container">
                <Search color="var(--text-color2)" className="header-search-icon" size={"1.4rem"} />
                <input
                    type="text"
                    placeholder="Search any files..."
                    className="header-search-input"
                    value={searchQuery}
                    onChange={handleSearch}
                />
                {
                    searchQuery && (
                        <div onClick={handleCloseSearch} className="cancel-icon-search">
                            <X color="var(--text-color2)" size={"1.5rem"} />
                        </div>
                    )
                }
            </div>

            <div className="header-right">
                <div className="header-notifications-container">
                    <Bell color="var(--text-color2)" size={"1.7rem"} />
                </div>

                <div className="header-profile-container">
                    <img src={ProfileIcon} alt="Profile" className="header-profile-img" />
                </div>
            </div>

            {searchQuery && (
                <div className="search-results-dropdown">
                    {filteredFiles.length > 0 ? (
                        filteredFiles.map((file) => (
                            <div onClick={() => setPreviewFile(file)} key={file.name} className="search-result-item">
                                <div className="search-result-item-name">{file.name}</div>
                                <div className="search-result-item-date">
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </div>
                                <div className="search-result-item-size">{formatFileSize(file.size)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results-text">No matching files found</div>
                    )}
                </div>
            )}

            {previewFile && <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />}
        </div>
    );
}
