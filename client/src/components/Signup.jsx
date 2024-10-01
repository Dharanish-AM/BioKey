import { Link } from "react-router-dom";

function Signup() {
  return (
    <div className="signup-card">
      <p className="heading">Signup</p>
      <form>
        <input className="auth-input" type="text" placeholder="Username" />
        <input className="auth-input" type="email" placeholder="Email" />
        <input className="auth-input" type="password" placeholder="Password" />
        <input
          className="auth-input"
          type="password"
          placeholder="Confirm Password"
        />
        <button className="auth-button" type="submit">
          Signup
        </button>
        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
