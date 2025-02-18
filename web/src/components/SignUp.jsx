/* eslint-disable react/prop-types */
import { useState } from "react";


export default function SignUp({ toggleForm }) {
    const [genderSelected, setGenderSelected] = useState(false);

    const handleGenderChange = (event) => {
        setGenderSelected(event.target.value !== "");
    };
    return (
        <form className="authpage-form">
            <div className="authpage-form-groups-signup">
                <div className="auth-form-group">
                    <label className="auth-form-label">Name:</label>
                    <input type="text" className="auth-form-input" id="name" placeholder="Enter your name . . ." />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Email:</label>
                    <input type="email" className="auth-form-input" id="email" placeholder="Enter your email . . ." />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Phone:</label>
                    <input type="tel" className="auth-form-input" id="phone" placeholder="Enter your phone number . . ." />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Gender:</label>
                    <select
                        className="auth-form-input"
                        id="gender"
                        onChange={handleGenderChange}
                        style={{ color: genderSelected ? "var(--text-color3)" : "#757575" }}
                    >
                        <option value="" style={{ color: "#757575" }}>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Location:</label>
                    <input type="text" className="auth-form-input" id="location" placeholder="Enter your location . . ." />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Password:</label>
                    <input type="password" className="auth-form-input" id="password" placeholder="Enter your password . . ." />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Confirm Password:</label>
                    <input type="password" className="auth-form-input" id="confirmPassword" placeholder="Confirm your password . . ." />
                </div>
                <div className="auth-form-group radio-group">
                    <label className="auth-form-label">Pair Fingerprint:</label>
                    <div className="radio-options">
                        <label>
                            <input className="radio" type="radio" name="pairFinger" value="yes" /> Yes
                        </label>
                        <label>
                            <input className="radio" type="radio" name="pairFinger" value="no" /> No
                        </label>
                    </div>
                </div>

            </div>
            <button className="auth-form-btn" type="submit">Sign up</button>
            <div className="signup-navigate-text">
                Already have an account?{" "}
                <span onClick={toggleForm} className="link-text">
                    Sign in
                </span>
            </div>
        </form>
    );
}
