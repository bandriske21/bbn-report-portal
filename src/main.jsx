import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import './index.css';

import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Jobs from './pages/Jobs';
import Job from './pages/Job';

function Layout({ children }) {
  return (
    <div>
      <header className="bg-bbnNavy text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">BBN Consulting — Report Portal</h1>
        <nav className="space-x-4">
          <Link to="/jobs" className="hover:underline">Jobs</Link>
          <Link to="/" className="hover:underline">Upload</Link>
          <Link to="/reports" className="hover:underline">All Reports</Link>
        </nav>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Layout><Upload /></Layout> },
  { path: "/reports", element: <Layout><Reports /></Layout> },
  { path: "/jobs", element: <Layout><Jobs /></Layout> },
  { path: "/jobs/:jobCode", element: <Layout><Job /></Layout> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
