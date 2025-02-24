import "./SideBar.css";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFolder, FiHeart, FiCloud, FiTrash, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";

export default function SideBar() {
    const location = useLocation();

    return (
        <div className="sidebar-container">
            <div className="sidebar-navs">
                <Link to="/" className={`sidebar-nav-item ${location.pathname === "/" ? "active" : ""}`}>
                    <FiHome size={"1.5rem"} className="sidebar-icon" />
                    <span>Home</span>
                </Link>

                <Link to="/folders" className={`sidebar-nav-item ${location.pathname === "/folder" ? "active" : ""}`}>
                    <FiFolder size={"1.5rem"} className="sidebar-icon" />
                    <span>Folders</span>
                </Link>

                <Link to="/favourites" className={`sidebar-nav-item ${location.pathname === "/favourites" ? "active" : ""}`}>
                    <FiHeart size={"1.5rem"} className="sidebar-icon" />
                    <span>Favourites</span>
                </Link>

                <Link to="/storage" className={`sidebar-nav-item ${location.pathname === "/storage" ? "active" : ""}`}>
                    <FiCloud size={"1.5rem"} className="sidebar-icon" />
                    <span>Storage</span>
                </Link>

                <Link to="/trash" className={`sidebar-nav-item ${location.pathname === "/trash" ? "active" : ""}`}>
                    <FiTrash size={"1.5rem"} className="sidebar-icon" />
                    <span>Trash</span>
                </Link>
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-seperator"></div>
                <div className="sidebar-logout-container" onClick={() => {
                   toast.success("Logged out successfully");
                    localStorage.removeItem("authToken");
                    window.location.reload();
                }}>
                    <FiLogOut size={"1.5rem"} className="sidebar-icon" />
                    <span>Logout</span>
                </div>
            </div>
        </div>
    );
}
