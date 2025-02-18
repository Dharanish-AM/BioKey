import "./AuthPage.css";
import Illustration from "../../assets/images/landing-illustration.png";
import Logo from "../../assets/icons/BioKey_Logo.png";
import { Fingerprint, KeyRound } from 'lucide-react';
import { useState } from "react";

export default function AuthPage() {
    const [isFingerPrint, setIsFingerPrint] = useState(false);

    return (
        <div className="authpage-container">
            <div className="authpage-header">
                <div className="authpage-header-logo">
                    <img className="logo" src={Logo} alt="BioKey Logo" />
                    <div className="logo-text">BioKey</div>
                </div>
            </div>
            <div className="authpage-content">
                <div className="authpage-left">
                    <div className="authpage-left-card">
                        <div className="authpage-left-card-toggle-btn">
                            <button
                                className={`auth-toggle-btn ${!isFingerPrint ? 'active' : ''}`}
                                onClick={() => setIsFingerPrint(false)}
                            >
                                <KeyRound
                                    size={"1.1em"}
                                    className={`toggle-icon ${!isFingerPrint ? 'active-icon' : ''}`}
                                />
                                Credentials
                            </button>
                            <button
                                className={`auth-toggle-btn ${isFingerPrint ? 'active' : ''}`}
                                onClick={() => setIsFingerPrint(true)}
                            >
                                <Fingerprint
                                    size={"1.1em"}
                                    className={`toggle-icon ${isFingerPrint ? 'active-icon' : ''}`}
                                />
                                Fingerprint
                            </button>
                        </div>
                        <form className="authpage-form">
                            <div className="authpage-form-groups">
                                <div className="auth-form-group">
                                    <label className="auth-form-label">Email:</label>
                                    <input
                                        type="email"
                                        className="auth-form-input"
                                        id="email"
                                        placeholder="Enter your email . . ."
                                    />
                                </div>
                                <div className="auth-form-group">
                                    <label className="auth-form-label">Password:</label>
                                    <input
                                        type="password"
                                        className="auth-form-input"
                                        id="password"
                                        placeholder="Enter your password . . ."
                                    />
                                </div>
                            </div>
                            <button className="auth-form-btn" type="submit">
                                Sign in
                            </button>
                        </form>
                        <div className="signup-navigate-text">
                            Don&apos;t have an account?{" "}
                            <span
                                style={{
                                    color: "#9366E2",
                                    cursor: "pointer",
                                    textDecorationLine: "underline",
                                }}
                            >
                                Create One
                            </span>
                        </div>
                    </div>
                </div>
                <div className="authpage-right">
                    <img className="illustration" src={Illustration} alt="Illustration" />
                </div>
            </div>
        </div>
    );
}
