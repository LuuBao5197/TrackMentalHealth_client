import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ForgotPasswordFlow from '../components/loginPage/ForgotPasswordFlow';
import PendingRegistrations from '../components/loginPage/PendingRegistrations';
import ProtectedRoute from './ProtectedRoute';
import { element } from 'prop-types';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const UserLayout = Loadable(lazy(() => import('../layouts/user/UserLayout')));
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
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPasswordFlow /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
      { path: 'homepage', element: <HomePage /> },
    ],
  },

  
  // 🔐 Private: Cần đăng nhập
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'sample-page', element: <SamplePage /> },
          { path: 'icons', element: <Icons /> },
          { path: 'ui/typography', element: <TypographyPage /> },
          { path: 'ui/shadow', element: <Shadow /> },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },

  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'homepage1', element: <HomePage /> },
      { path: 'register', element: <Register /> },
      {
        element: <ProtectedRoute allowedRoles={[2]} />,
        children: [
          { path: 'homepage', element: <HomePage /> },
        ],
      },
    ],
  },
];
export default Router;