import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './index.css';

import Layout from './components/Layout';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import Jobs from './pages/Jobs';
import Job from './pages/Job';

const router = createHashRouter([
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
