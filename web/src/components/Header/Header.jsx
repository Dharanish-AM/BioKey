import "./Header.css";
import { Search, Bell } from "lucide-react";

import ProfileIcon from "../../assets/images/profile_icon_1.png"
import Logo from "../../assets/icons/BioKey_Logo.png"

export default function Header() {
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

                />
            </div>

            <div className="header-right">
                <div className="header-notifications-container">
                    <Bell color="var(--text-color2)" size={"1.7rem"} />
                </div>

                <div className="header-profile-container">
                    <img
                        src={ProfileIcon}
                        alt="Profile"
                        className="header-profile-img"
                    />
                </div>
            </div>
        </div>
    );
}
