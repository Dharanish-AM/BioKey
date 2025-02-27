import { useEffect, useState } from "react";
import { checkTokenIsValid, loginCreds } from "../services/authOperations";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthState, setUser } from "../redux/actions";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; 
import { loadUser } from "../services/userOperations";

export default function Login({ toggleForm }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [ip, setIp] = useState("");
    const [location, setLocation] = useState({ district: "Unknown", region: "Unknown", country: "Unknown" });
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchIpAndLocation = async () => {
            try {
                const ipResponse = await axios.get("https://api64.ipify.org?format=json");
                const ipAddress = ipResponse.data.ip;
                setIp(ipAddress);

                const locationResponse = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
                setLocation({
                    district: locationResponse.data.city || "Unknown",
                    region: locationResponse.data.region || "Unknown",
                    country: locationResponse.data.country_name || "Unknown"
                });
            } catch (error) {
                console.error("Error fetching IP or location:", error);
            }
        };
        fetchIpAndLocation();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const activityLog = {
            deviceName: navigator.userAgent,
            ip,
            location
        };

        try {
            const loginResponse = await loginCreds(formData.email, formData.password, activityLog);

            if (loginResponse?.success) {
                const token = loginResponse.token;
                await localStorage.setItem("authToken", token);

                const tokenValidationResponse = await checkTokenIsValid(token);

                if (tokenValidationResponse?.success) {
                    const user = await loadUser(tokenValidationResponse.user.userId);
                    if (user) {
                        dispatch(setUser(user));
                        dispatch(setAuthState(true, token));
                    }
                    toast.success("Logged in successfully");
                } else {
                    toast.error("Login failed! Token validation failed");
                }
            } else {
                toast.error(`Login failed! ${loginResponse.message || "Unknown error occurred"}`);
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("An error occurred during login. Please try again.");
        }
    };

    return (
        <form className="authpage-form" onSubmit={handleSubmit}>
            <div className="authpage-form-groups">
                <div className="auth-form-group">
                    <label className="auth-form-label">Email:</label>
                    <input
                        type="email"
                        className="auth-form-input"
                        id="email"
                        placeholder="Enter your email . . ."
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Password:</label>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            className="auth-form-input"
                            id="password"
                            placeholder="Enter your password . . ."
                            value={formData.password}
                            onChange={handleChange}
                            style={{ flex: 1, paddingRight: "40px" }}
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: "absolute",
                                top:"25%",
                                right:"3%",
                                cursor: "pointer",
                                color: "#555",
                            }}
                        >
                            {showPassword ? <EyeOff size={"1.5rem"} /> : <Eye size={"1.5rem"} />}
                        </span>
                    </div>
                </div>
                <div style={{ width: "100%", textAlign: "end" }}>
                    <span className="forgot-password">Forgot Password?</span>
                </div>
            </div>
            <button className="auth-form-btn" type="submit">
                Sign in
            </button>
            <div className="signup-navigate-text">
                Don&apos;t have an account?{" "}
                <span onClick={toggleForm} className="link-text">
                    Create One
                </span>
            </div>
        </form>
    );
}
