import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Root from './routes/root.tsx';
import QaBot from './routes/qabot/qabot.tsx';
import TsBot from './routes/tsbot/tsbot.tsx';
import ErrorPage from './components/error-page.tsx';
import Layout from './components/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Root />
      </Layout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/qabot',
    element: (
      <Layout>
        <QaBot />
      </Layout>
    ),
  },
  {
    path: '/tsbot',
    element: (
      <Layout>
        <TsBot />
      </Layout>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
