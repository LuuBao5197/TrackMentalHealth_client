import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from './ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const UserLayout = Loadable(lazy(()=>import('../layouts/user/UserLayout')));
/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')))
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')))
const Icons = Loadable(lazy(() => import('../views/icons/Icons')))
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')))
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')))
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const HomePage = Loadable(lazy(() => import('../views/user/Homepage')));
const Router = [
  // 🟢 Public: Không cần đăng nhập
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },

  // 🔐 Private: Cần đăng nhập
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      {
        element: <ProtectedRoute />, // dùng Outlet cho nhóm cần login
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'sample-page', element: <SamplePage /> },
          { path: 'icons', element: <Icons /> },
          { path: 'ui/typography', element: <TypographyPage /> },
          { path: 'ui/shadow', element: <Shadow /> },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },

  {
    path: '/user',
    element: <UserLayout />,
    children: [
      {
        element: <ProtectedRoute />, // bảo vệ UserLayout
        children: [
          { path: 'homepage', element: <HomePage /> },
        ]
      }
    ],
  }
];
export default Router;