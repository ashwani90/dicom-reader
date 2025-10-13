// src/pages/Login.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AuthForm.css"; // ✅ import styles

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Django/DRF usually sends a JSON object with field errors
        const data = error.response.data;
        let messages = [];
  
        // Collect messages from each field
        for (const [field, msg] of Object.entries(data)) {
          if (Array.isArray(msg)) {
            messages.push(`${msg.join(", ")}`);
          } else {
            messages.push(`${msg}`);
          }
        }
  
        setErrorMsg(messages.join(" | "));
      } else if (error.request) {
        setErrorMsg("No response from server. Please try again.");
      } else {
        setErrorMsg("Unexpected error: " + error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Login</h2>
        <input
          type="text"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" className="auth-button">
          Login
        </button>
        <p className="auth-link">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
        {errorMsg && (
          <div className="error auth-link" style={{ color: "red", marginTop: "10px" }}>
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}

export default Login;
