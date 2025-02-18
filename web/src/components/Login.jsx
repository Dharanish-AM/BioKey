/* eslint-disable react/prop-types */
export default function Login({ toggleForm }) {
    return (
        <form className="authpage-form">
            <div className="authpage-form-groups">
                <div className="auth-form-group">
                    <label className="auth-form-label">Email:</label>
                    <input
                        type="email"
                        className="auth-form-input"
                        id="email"
                        placeholder="Enter your email . . ."
                    />
                </div>
                <div className="auth-form-group">
                    <label className="auth-form-label">Password:</label>
                    <input
                        type="password"
                        className="auth-form-input"
                        id="password"
                        placeholder="Enter your password . . ."
                    />
                </div>
                <div style={{
                    width:"100%",
                    alignItems:"end",
                    textAlign:"end"
                }} >
                   <span className="forgot-password">Forgot Password ?</span>
                </div>
            </div>
            <button className="auth-form-btn" type="submit">
                Sign in
            </button>
            <div className="signup-navigate-text">
                Don&apos;t have an account?{" "}
                <span
                    onClick={toggleForm}
                    className="link-text"

                >
                    Create One
                </span>
            </div>
        </form>
    );
}
