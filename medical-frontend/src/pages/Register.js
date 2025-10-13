// src/pages/Register.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./AuthForm.css"; // ✅ import styles

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [email, setEmail] = useState("");
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // reset old errors
    let payload = {
      username, password, email, password2
    }
    try {
      let res = await register(payload);
      console.log(res);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      if (error.response) {
        // Django/DRF usually sends a JSON object with field errors
        const data = error.response.data;
        let messages = [];
  
        // Collect messages from each field
        for (const [field, msg] of Object.entries(data)) {
          if (Array.isArray(msg)) {
            messages.push(`${field}: ${msg.join(", ")}`);
          } else {
            messages.push(`${field}: ${msg}`);
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
        <h2 className="auth-title">Register</h2>
        <input
          type="text"
          className="auth-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
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
        <input
          type="password"
          className="auth-input"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <button type="submit" className="auth-button">
          Register
        </button>
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
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

export default Register;
