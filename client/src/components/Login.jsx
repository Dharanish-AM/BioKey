import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="login-card">
      <p className="heading">Login</p>
      <form>
        <input className="auth-input" type="text" placeholder="Username" />
        <input className="auth-input" type="password" placeholder="Password" />
        <p className="forgot-password">
          Forgot Password? <Link>Click Here!</Link>
        </p>
        <button className="auth-button" type="submit">
          Login
        </button> 
        <p>
          New User? <Link to="/signup">Signup</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
