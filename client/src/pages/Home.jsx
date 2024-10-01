import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Get current time in seconds

        if (decodedToken.exp < currentTime) {
          sessionStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        sessionStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <h1>Welcome to Home Page</h1>
    </div>
  );
}

export default Home;
