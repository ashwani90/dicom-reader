// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import CaseList from "./pages/CaseList";
import CaseDetail from "./pages/CaseDetail";
import CaseForm from "./pages/CaseForm";
import Logout from "./pages/Logout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />

          {/* Wrap protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="/cases" element={<ProtectedRoute>
                <Navbar />
                <CaseList />
              </ProtectedRoute>} />
          <Route path="/cases/new" element={<ProtectedRoute>
                <Navbar />
                <CaseForm />
              </ProtectedRoute>} />
          <Route path="/cases/:id" element={<ProtectedRoute>
                <Navbar />
                <CaseDetail />
              </ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
