// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import "./index.css";

// Providers & layout
import { AuthProvider } from "./lib/AuthContext";
import Layout from "./components/Layout";

// Pages
import ClientHome from "./pages/ClientHome";   // simple welcome page (see note below)
import Jobs from "./pages/Jobs";
import Job from "./pages/Job";
import Reports from "./pages/Reports";
import Upload from "./pages/Upload";
import Login from "./pages/Login";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<Login />} />

            {/* App routes */}
            <Route path="/client" element={<ClientHome />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:jobCode" element={<Job />} />
            <Route path="/reports" element={<Reports />} />

            {/* Default route (can be Upload or ClientHome; we keep Upload for now) */}
            <Route path="/" element={<Upload />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/client" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
