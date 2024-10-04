import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });

      if (response.status === 200) {
        console.log("Login Success:", response.data);
        sessionStorage.setItem("token", response.data.token);
        navigate("/home", {
          state: {
            user: response.data.user,
          },
        });
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login.");
    }
  }

  return (
    <div className="login-card">
      <p className="heading">Login</p>
      <form onSubmit={handleLogin}>
        <input
          name="email"
          className="auth-input"
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-input-container">
          <input
            name="password"
            className="auth-input"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password-visibility"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <FontAwesomeIcon icon={isPasswordVisible ? faEyeSlash : faEye} />
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
        <p className="forgot-password">
          Forgot Password? <Link to="#">Click Here!</Link>
        </p>
        <button className="auth-button" type="submit">
          Login
        </button>
        <p>
          New User?{" "}
          <Link to={"/signup"}>
            <span>Click Here!</span>
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
