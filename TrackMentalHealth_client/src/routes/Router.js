import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ForgotPasswordFlow from '../components/loginPage/ForgotPasswordFlow';
import PendingRegistrations from '../components/loginPage/PendingRegistrations';
import ProtectedRoute from './ProtectedRoute';
import { element } from 'prop-types';
import UserProfile from '../components/adminPage/UserProfile';
import UserList from '../components/adminPage/UserList';
import UserDetail from '../components/adminPage/UserDetail';
import LessonForm from '../components/LessonPage/LessonForm';

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
      { path: 'lesson-form', element: <LessonForm /> },
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
          { path: 'admin/users', element: <UserProfile /> },
          { path: 'admin/users/role/:roleId', element: <UserList /> },
          { path: 'admin/users/detail/:id', element: <UserDetail /> },
          { path: 'admin/users/pending-registrations', element: <PendingRegistrations /> },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },

  //USER
  {
    path: '/user',
    element: <UserLayout />,
    children: [
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