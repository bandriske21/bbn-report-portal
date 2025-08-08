// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./lib/AuthContext";

import ClientHome from "./pages/ClientHome"; // simple page like “Welcome”
import Jobs from "./pages/Jobs";
import Job from "./pages/Job";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";
import Login from "./pages/Login";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/client" element={<ClientHome />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobCode" element={<Job />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Upload />} />
            {/* Fallback to client home */}
            <Route path="*" element={<Navigate to="/client" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
