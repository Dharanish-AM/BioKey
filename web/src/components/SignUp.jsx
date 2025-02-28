/* eslint-disable react/prop-types */
import { useState } from "react";
import { registerUser } from "../services/authOperations";
import toast from "react-hot-toast";

export default function SignUp({ toggleForm }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        location: "",
        password: "",
        confirmPassword: "",
        pairFinger: "no"
    });

    const [errors, setErrors] = useState({});
    const [genderSelected, setGenderSelected] = useState(false);
    const [notificationToken, setNotificationToken] = useState(null);

    const handleChange = (event) => {
        const { id, value } = event.target;
        setFormData({ ...formData, [id]: value });

        if (id === "gender") {
            setGenderSelected(value !== "");
        }
    };

    const handleRadioChange = (event) => {
        setFormData({ ...formData, pairFinger: event.target.value });
    };

    const validateForm = () => {
        let newErrors = {};
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validateForm()) {
            console.log("Form submitted:", formData);
            const response = await registerUser(formData, notificationToken)
            if (response.success) {
                toast.success("User created successfully");
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    gender: "",
                    location: "",
                    password: "",
                    confirmPassword: "",
                    pairFinger: "no"
                })
                toggleForm();
            }
            else {
                toast.error(response.message);
            }

        }
    };

    return (
        <form className="authpage-form-signup" onSubmit={handleSubmit}>
            <div className="authpage-form-groups-signup">
                {["name", "email", "phone", "location", "password", "confirmPassword"].map((field) => (
                    <div key={field} className="auth-form-group">
                        <label className="auth-form-label">{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                        <input
                            type={field.includes("password") || field.includes("confirmPassword") ? "password" : "text"}
                            className="auth-form-input"
                            id={field}
                            placeholder={`Enter your ${field.replace("confirmPassword", "password again")}...`}
                            value={formData[field]}
                            onChange={handleChange}
                            required

                        />
                        {errors[field] && <small className="error-text">{errors[field]}</small>}
                    </div>
                ))}

                <div className="auth-form-group">
                    <label className="auth-form-label">Gender:</label>
                    <select
                        className="auth-form-input"
                        id="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        style={{ color: genderSelected ? "var(--text-color3)" : "#757575" }}
                        required
                    >
                        <option value="" style={{ color: "#757575" }}>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="other">Other</option>
                    </select>

                </div>

                <div className="auth-form-group radio-group">
                    <label className="auth-form-label">Pair Fingy:</label>
                    <div className="radio-options">
                        {["yes", "no"].map((option) => (
                            <label key={option}>
                                <input
                                    className="radio"
                                    type="radio"
                                    name="pairFinger"
                                    value={option}
                                    checked={formData.pairFinger === option}
                                    onChange={handleRadioChange}
                                    required
                                />{" "}
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </label>
                        ))}
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
