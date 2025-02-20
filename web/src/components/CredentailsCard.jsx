/* eslint-disable react/prop-types */
import { Fingerprint, KeyRound } from "lucide-react";
import Login from "../components/Login"
import SignUp from "../components/SignUp";

export default function CredentailsCard({ isSignUp, setIsSignUp, isFingerPrint, setIsFingerPrint }) {
    return (
        <div className={`authpage-left-card ${isSignUp ? "signup" : "login"}`}>
            {!isSignUp && (
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
            )}

            {isSignUp ? (
                <SignUp toggleForm={() => setIsSignUp(false)} />
            ) : (
                <Login toggleForm={() => setIsSignUp(true)} />
            )}
        </div>
    );
}
