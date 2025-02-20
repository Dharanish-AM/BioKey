import "./AuthPage.css";
import Logo from "../../assets/icons/BioKey_Logo.png";
import { Fingerprint, Headset, KeyRound } from "lucide-react";
import { useState } from "react";
import CredentailsCard from "../../components/CredentailsCard";
import FingerprintCard from "../../components/FingerprintCard";

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
                    {isFingerPrint ? (
                        <FingerprintCard
                            isFingerPrint={isFingerPrint}
                            setIsFingerPrint={setIsFingerPrint}
                        />
                    ) : (
                        <CredentailsCard
                            isSignUp={isSignUp}
                            setIsSignUp={setIsSignUp}
                            isFingerPrint={isFingerPrint}
                            setIsFingerPrint={setIsFingerPrint}
                        />
                    )}
                </div>
                <div className="authpage-right"></div>
            </div>
        </div>
    );
}
