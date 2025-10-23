import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // your axios instance or API helper
import { sendRequest } from "../request";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        // Call your logout API if needed
        await sendRequest('post', '/api/auth/logout/');

        // Clear tokens from localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // Redirect to login page
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout failed:", error);
        // Still redirect to login even if API fails
        navigate("/login", { replace: true });
      }
    };

    doLogout();
  }, [navigate]);

  return <p className="text-center mt-10">Logging out...</p>;
};

export default Logout;