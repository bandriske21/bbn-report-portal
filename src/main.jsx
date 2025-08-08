import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./lib/AuthContext";

// your existing pages/components
import Layout from "./components/Layout";
import Upload from "./pages/Upload";
import Reports from "./pages/Reports";
import Jobs from "./pages/Jobs";
import Job from "./pages/Job";
import Login from "./pages/Login";          // <-- we’ll add this next
import ClientHome from "./pages/ClientHome"; // optional: a client landing, can just show Jobs

const router = createHashRouter([
  { path: "/login", element: <Layout><Login /></Layout> },
  { path: "/client", element: <Layout><ClientHome /></Layout> }, // shows Jobs for clients
  { path: "/", element: <Layout><Upload /></Layout> },            // BBN staff (guarded)
  { path: "/jobs", element: <Layout><Jobs /></Layout> },
  { path: "/jobs/:jobCode", element: <Layout><Job /></Layout> },
  { path: "/reports", element: <Layout><Reports /></Layout> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
