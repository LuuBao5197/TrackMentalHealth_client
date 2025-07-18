import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ForgotPasswordFlow from '../components/loginPage/ForgotPasswordFlow';
import PendingRegistrations from '../components/loginPage/PendingRegistrations';
import ProtectedRoute from './ProtectedRoute';
import UserProfile from '../components/adminPage/UserProfile';
import UserList from '../components/adminPage/UserList';
import UserDetail from '../components/adminPage/UserDetail';
import WriteDiaryPage from '../components/userPage/WriteDiaryPage.jsx';
import DiaryHistoryPage from '../components/userPage/DiaryHistoryPage.jsx';
import MoodHistoryPage from '../components/userPage/MoodHistoryPage.jsx';
import EditProfile from '../components/adminPage/EditProfile.jsx';
import ChatList from '../components/chatPage/ChatList.jsx';
import CreateLesson from '../components/LessonPage/CreateLesson.jsx';
import LessonDetail from '../components/LessonPage/LessonDetail';
import ArticleDetail from '../components/ArticlePage/ArticleDetail.jsx';
import CreateArticle from '../components/ArticlePage/CreateArticle.jsx';
import CreateExercise from '../components/ExercisePage/CreateExercise.jsx';
import ExerciseDetail from '../components/ExercisePage/ExerciseDetail.jsx';
import ChatWithAI from '../components/chatPage/ChatWithAI.jsx';
import EditLesson from '../components/LessonPage/EditLesson.jsx';
import { element } from 'prop-types';
import ChatWithUser from '../components/chatPage/ChatWithUser.jsx';
import EditExercise from '../components/ExercisePage/EditExercise.jsx';
import EditArticle from '../components/ArticlePage/EditArticle.jsx';

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
const ImportTestPage = Loadable(lazy(()=> import('../components/testPage/ImportTestExcel.jsx')))
const QuestionPage = Loadable(lazy(() => import('../components/testPage/TestQuestion')))
const OptionPage = Loadable(lazy(() => import('../components/testPage/TestOptionForm')))
const TestListPage = Loadable(lazy(()=> import('../components/testPage/TestList.jsx') ))
const SocialPage = Loadable(lazy(() => import('../components/miniSocialPage/NewsFeed')))
const Router = [

  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPasswordFlow /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
      { path: 'create-lesson', element: <CreateLesson /> },
      { path: 'create-exercise', element: <CreateExercise /> },
      { path: 'create-article', element: <CreateArticle /> },
      { path: 'lesson/:id', element: <LessonDetail /> },
      { path: 'exercise/:id', element: <ExerciseDetail /> },
      { path: 'article/:id', element: <ArticleDetail /> },
      { path: 'lesson/edit/:lessonId', element: <EditLesson /> },
      { path: 'exercise/edit/:exerciseId', element: <EditExercise /> },
      { path: 'article/edit/:articleId', element: <EditArticle /> },
      { path: 'question/option/create', element: <OptionPage /> },
      { path: "chat", element: <ChatList /> },
      { path: "chatlist", element: <ChatList /> },      
      { path: "chatai", element: <ChatWithAI /> },
      { path: "chat/:id", element: <ChatWithUser /> },
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
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
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
          { path: "admin/users/edit-profile/:userId", element: <EditProfile /> },
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
      { path: 'social', element: <SocialPage /> },
      {
        element: <ProtectedRoute allowedRoles={['USER']} />,
        children: [
          { path: 'homepage', element: <HomePage /> },
          { path: 'write-diary', element: <WriteDiaryPage /> },
          { path: 'history', element: <DiaryHistoryPage /> },
          { path: 'history-mood', element: <MoodHistoryPage /> },
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
          {path: "mood-history", element: <MoodHistoryPage />},
        ],
      },
    ],
  },

  // test_designer
  {
    path: '/testDesigner',
    element: <FullLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['TEST_DESIGNER']} />,
        children: [
          { path: 'test/create', element: <TestPage /> },
          { path: 'test/edit/:id', element: <TestPage /> },
          { path: 'question/create', element: <QuestionPage /> },
          { path: 'question/edit/:id', element: <QuestionPage /> },
          { path: 'question/option/create', element: <OptionPage /> },
          { path: 'question/option/edit/:id', element: <OptionPage /> },
          { path: 'test/importfile', element: <ImportTestPage/>},
          { path: 'test/', element: <TestListPage/>}

        ],
      },

    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: 'social', element: <SocialPage /> },
      { path: 'user/edit-profile/:userId', element: <EditProfile /> },
    ],
  },
];

export default Router;
