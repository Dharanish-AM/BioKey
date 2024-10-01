import { useLocation, useNavigate } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import { useEffect } from "react";
import axios from "axios";

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      console.log(token);
      const verifyToken = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3000/checktoken",
            {
              token: token,
            }
          );
          console.log(token);
          if (response.status === 200) {
            navigate("/home");
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          sessionStorage.removeItem("token");
        }
      };
      verifyToken();
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-container-left">
          {location.pathname === "/" || location.pathname === "/login" ? (
            <Login />
          ) : (
            <Signup />
          )}
        </div>
        <div className="auth-container-right"></div>
      </div>
    </div>
  );
}

export default Auth;
