import { useLocation } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";

function Auth() {
  const location = useLocation();

  return (
    <div className="auth-container">
      <div className="auth-content">
      <div className="auth-container-left">
      {location.pathname === "/" ? <Login /> : <Signup />}
      </div>
        <div className="auth-container-right">
         
        </div>
      </div>
    </div>
  );
}

export default Auth;
