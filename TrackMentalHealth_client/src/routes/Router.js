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
import LessonCreate from '../components/LessonPage/CreateForm';
import LessonDetails from '../components/LessonPage/LessonDetail';
import HomePageTest from '../components/LessonPage/AllForm';
import WriteDiaryPage from '../components/userPage/WriteDiaryPage.jsx';
import DiaryHistoryPage from '../components/userPage/DiaryHistoryPage.jsx';
import UpdateDiaryPage from '../components/userPage/UpdateDiaryPage.jsx';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const UserLayout = Loadable(lazy(() => import('../layouts/user/UserLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')));
const SamplePage = Loadable(lazy(() => import('../views/sample-page/SamplePage')));
const Icons = Loadable(lazy(() => import('../views/icons/Icons')));
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')));
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
const HomePage = Loadable(lazy(() => import('../views/user/Homepage')));
const TestPage = Loadable(lazy(() => import('../components/testPage/TestForm')));

const QuestionPage = Loadable(lazy(() => import('../components/testPage/TestQuestion')))
const OptionPage = Loadable(lazy(() => import('../components/testPage/TestOptionForm')))
const SocialPage = Loadable(lazy(() => import('../components/miniSocialPage/NewsFeed')))
const Router = [
  //🟢 Public: Không cần đăng nhập
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPasswordFlow /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
      { path: 'lesson-create', element: <LessonCreate /> },
      { path: 'homepagetest', element: <HomePageTest /> },
      { path: 'lesson/:id', element: <LessonDetails /> },
      { path: 'question/option/create', element: <OptionPage /> },
    ],
  },

  //🔐 Private: Cần đăng nhập
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      {
        element: <ProtectedRoute allowedRoles={['Admin']} />,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'sample-page', element: <SamplePage /> },
          { path: 'icons', element: <Icons /> },
          { path: 'ui/typography', element: <TypographyPage /> },
          { path: 'ui/shadow', element: <Shadow /> },
          { path: 'admin/users', element: <UserProfile /> },
          { path: 'admin/users/role/:roleId', element: <UserList /> },
          { path: 'admin/users/profile/:id', element: <UserDetail /> },
          { path: 'admin/users/pending-registrations', element: <PendingRegistrations /> },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
    ],
  },

  // 🧑 USER
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'homepage1', element: <HomePage /> },
      { path: 'register', element: <Register /> },


      {
        element: <ProtectedRoute allowedRoles={['User']} />,
        children: [
          { path: 'homepage', element: <HomePage /> },
          { path: 'write-diary', element: <WriteDiaryPage /> },
          { path: 'history', element: <DiaryHistoryPage /> },
          { path: 'edit-diary/:id', element: <UpdateDiaryPage /> },
        ],
      },
    ],
  },
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'homepage1', element: <HomePage /> },
      { path: 'register', element: <Register /> },
      { path: 'social', element: <SocialPage /> },
      {
        element: <ProtectedRoute allowedRoles={['User', 2]} />, // gộp role User và 2
        children: [
          { path: 'homepage', element: <HomePage /> },
          { path: 'write-diary', element: <WriteDiaryPage /> },
          { path: 'history', element: <DiaryHistoryPage /> },
          { path: 'edit-diary/:id', element: <UpdateDiaryPage /> },
        ],
      },
    ],
  },

  // test_designer
  {
    path: '/testDesigner',
    element: <FullLayout />,
    children: [
      { path: 'test/create', element: <TestPage /> },
      { path: 'test/edit/:id', element: <TestPage /> },
      { path: 'question/create', element: <QuestionPage /> },
      { path: 'question/edit/:id', element: <QuestionPage /> },
      { path: 'question/option/create', element: <OptionPage /> },
      { path: 'question/option/edit/:id', element: <OptionPage /> },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: 'social', element: <SocialPage /> },

    ],
  },
];

export default Router;
