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