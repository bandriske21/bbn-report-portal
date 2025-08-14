<<<<<<< HEAD
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
=======
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './lib/AuthContext';
import ClientHome from './pages/ClientHome';
import Jobs from './pages/Jobs';
import Job from './pages/Job';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Login from './pages/Login';
import './index.css';

const router = createHashRouter([
  { path: '/', element: <Layout><Upload /></Layout> },
  { path: '/client', element: <Layout><ClientHome /></Layout> },
  { path: '/jobs', element: <Layout><Jobs /></Layout> },
  { path: '/jobs/:jobCode', element: <Layout><Job /></Layout> },
  { path: '/reports', element: <Layout><Reports /></Layout> },
  { path: '/login', element: <Layout><Login /></Layout> },
  { path: '*', element: <Layout><p>Page not found.</p></Layout> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
>>>>>>> c0be2d7 (Initial commit: routing, auth, upload, jobs fixes)
