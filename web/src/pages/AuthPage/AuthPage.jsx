import "./AuthPage.css";
import Illustration from "../../assets/images/landing-illustration.png";
import Logo from "../../assets/icons/BioKey_Logo.png";
import { Fingerprint, Headset, KeyRound } from "lucide-react";
import { useState } from "react";
import Login from "../../components/Login";
import SignUp from "../../components/SignUp";
export default function AuthPage() {
    const [isFingerPrint, setIsFingerPrint] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="authpage-container">
            <div className="authpage-header">
                <div className="authpage-header-logo">
                    <img className="logo" src={Logo} alt="BioKey Logo" />
                    <div className="logo-text">BioKey</div>
                </div>
                <Headset
                    color="var(--text-color2)"
                    style={{
                        opacity: 0.9,
                        cursor: "pointer",
                    }}
                    size={"2em"}
                />
            </div>

            <div className="authpage-content">
                <div className="authpage-left">
                    <div className={`authpage-left-card ${isSignUp ? 'signup' : 'login'}`}>
                        {
                            !isSignUp && (
                                <div className="authpage-left-card-toggle-btn">
                                    <button
                                        className={`auth-toggle-btn ${!isFingerPrint ? "active" : ""}`}
                                        onClick={() => setIsFingerPrint(false)}
                                    >
                                        <KeyRound
                                            size={"1.1em"}
                                            className={`toggle-icon ${!isFingerPrint ? "active-icon" : ""}`}
                                        />
                                        Credentials
                                    </button>
                                    <button
                                        className={`auth-toggle-btn ${isFingerPrint ? "active" : ""}`}
                                        onClick={() => setIsFingerPrint(true)}
                                    >
                                        <Fingerprint
                                            size={"1.1em"}
                                            className={`toggle-icon ${isFingerPrint ? "active-icon" : ""}`}
                                        />
                                        Fingerprint
                                    </button>
                                </div>
                            )
                        }

                        {isSignUp ? (
                            <SignUp toggleForm={() => setIsSignUp(false)} />
                        ) : (
                            <Login toggleForm={() => setIsSignUp(true)} />
                        )}
                    </div>
                </div>
                <div className="authpage-right">
                    <img className="illustration" src={Illustration} alt="Illustration" />
                </div>
            </div>
        </div>
    );
}
