import { Plus } from "lucide-react"
import "./Home.css"
import { useState } from "react"

export default function Home() {
    const [storageUsed, setStorageUsed] = useState(15)
    const [storageTotal, setStorageTotal] = useState(100)
    const [storageUsedBytes, setStorageUsedBytes] = useState(15)
    const [storageTotalBytes, setStorageTotalBytes] = useState(100)
    return (
        <div className="home-container">
            <div className="home-header">
                <div className="home-header-text">Hello, Dharanish A M! Your Vault Awaits.</div>
                <div className="home-add-files-btn"> <Plus size={"1.5rem"} color="var(--text-color3)" /> <span>|</span> Add Files</div>
            </div>
            <div className="home-content">
                <div className="home-storage-overview">
                    <div className="home-storage-header">
                        <div className="home-card-title">Storage Overview</div>
                        <div className="premium-btn">Get Premium !</div>
                    </div>
                    <div className="home-storage-content">
                        <div className="home-storage-text-container">
                            <div className="home-storage-space-text">{storageUsed}%</div>
                            <div className="home-storage-space-text">{storageUsedBytes} MB / {storageTotalBytes} GB</div>
                        </div>
                        <div className="home-storage-progress-track">
                            <div className="home-storage-progress-bar" style={{
                                width: `${storageUsed}%`
                            }} ></div>
                        </div>
                    </div>
                </div>
                <div className="home-quick-access">
                    <div style={{
                        marginBottom: "0.7rem"
                    }} className="home-card-title">Quick Access</div>
                    <div className="quick-access-items">
                        <div className="quick-access-item">
                            <div className="quick-access-item-content">
                                <div className="quick-access-item-icon-container">
                                    <div className="quick-access-item-icon-image"></div>
                                </div>
                                <div className="quick-access-item-text">Images</div>
                            </div>
                            <div className="quick-access-item-count">10 Files</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-content">
                                <div className="quick-access-item-icon-container">
                                    <div className="quick-access-item-icon-video"></div>
                                </div>
                                <div className="quick-access-item-text">Videos</div>
                            </div>
                            <div className="quick-access-item-count">5 Files</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-content">
                                <div className="quick-access-item-icon-container">
                                    <div className="quick-access-item-icon-audio"></div>
                                </div>
                                <div className="quick-access-item-text">Audios</div>
                            </div>
                            <div className="quick-access-item-count">8 Files</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-content">
                                <div className="quick-access-item-icon-container">
                                    <div className="quick-access-item-icon-other"></div>
                                </div>
                                <div className="quick-access-item-text">Others</div>
                            </div>
                            <div className="quick-access-item-count">3 Files</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-content">
                                <div className="quick-access-item-icon-container">
                                    <div className="quick-access-item-icon-password"></div>
                                </div>
                                <div className="quick-access-item-text">Passwords</div>
                            </div>
                            <div className="quick-access-item-count">2 Files</div>
                        </div>
                    </div>
                </div>
                <div className="home-recent-files">
                    <div className="home-recent-files-header">
                        <div className="home-card-title">Recent Files</div>
                        <div className="home-card-see-all">View All</div>
                    </div>
                    <div className="recent-files-list">
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                        <div className="recent-file-item">
                            <div className="recent-file-icon">Icon</div>
                            <div className="recent-file-text">Text</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
