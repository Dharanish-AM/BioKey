import { Plus } from "lucide-react"
import "./Home.css"

export default function Home() {
    return (
        <div className="home-container">
            <div className="home-header">
                <div className="home-header-text">Hello, Dharanish A M! Your Vault Awaits.</div>
                <div className="home-add-files-btn"> <Plus size={"1.5rem"} color="var(--text-color3)" /> <span>|</span> Add Files</div>
            </div>
            <div className="home-content">
                <div className="home-storage-overview">
                    <div className="home-card-title">Storage Overview</div>
                </div>
                <div className="home-quick-access">
                    <div className="home-card-title">Quick Access</div>
                    <div className="quick-access-items">
                        <div className="quick-access-item">
                            <div className="quick-access-item-icon">Icon</div>
                            <div className="quick-access-item-text">Text</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-icon">Icon</div>
                            <div className="quick-access-item-text">Text</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-icon">Icon</div>
                            <div className="quick-access-item-text">Text</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-icon">Icon</div>
                            <div className="quick-access-item-text">Text</div>
                        </div>
                        <div className="quick-access-item">
                            <div className="quick-access-item-icon">Icon</div>
                            <div className="quick-access-item-text">Text</div>
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
