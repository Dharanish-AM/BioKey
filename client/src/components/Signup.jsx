import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Signup() {
  const [name, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    try {
      const response = await axios.post("http://localhost:3000/signup", {
        name,
        email,
        phone,
        password,
      });
      if (response.status === 200) {
        console.log("Signup Success:", response.data);
        navigate("/login");
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An error occurred during signup.");
    }
  }

  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <div className="signup-card">
            <p className="heading">Signup</p>

            <form onSubmit={handleSignup}>
              <input
                className="auth-input"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div className="password-input-container">
                <input
                  className="auth-input"
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <FontAwesomeIcon
                    icon={isPasswordVisible ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <div className="password-input-container">
                <input
                  className="auth-input"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {error && <p className="error-message">{error}</p>}
                <button
                  type="button"
                  className="toggle-password-visibility"
                  onClick={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                >
                  <FontAwesomeIcon
                    icon={isConfirmPasswordVisible ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              <button className="auth-button" type="submit">
                Signup
              </button>
              <p>
                Already have an account? <Link to="/">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
