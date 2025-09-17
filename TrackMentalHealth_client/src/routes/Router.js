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
import ChatList from '../components/chatPage/ChatPage.jsx';
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
import ChatGroup from '../components/chatPage/ChatGroup.jsx';
import Appointments from '../components/appointmentPage/UserPage/Appointments.jsx';
import UpdateAppointment from '../components/appointmentPage/UserPage/UpdateAppointment.jsx';
import CreateAppointment from '../components/appointmentPage/UserPage/CreateAppointment.jsx';

import EditExercise from '../components/ExercisePage/EditExercise.jsx';
import EditArticle from '../components/ArticlePage/EditArticle.jsx';

import TestListForUser from '../components/testPage/TestListForUser.jsx';
import Unauthorized from '../views/authentication/Unauthorize.jsx';
import AppointmentManagement from '../components/appointmentPage/PsychologistPage/AppointmentManagement.jsx';
import ChooseRolePage from '../components/loginPage/ChooseRolePage.jsx';
import RolesRegisterForm from '../components/loginPage/RolesRegisterForm.jsx';
import LessonManager from '../components/LessonPage/LessonManager.jsx';
import ArticleManager from '../components/ArticlePage/ArticleManager.jsx';
import ExerciseManager from '../components/ExercisePage/ExerciseManager.jsx';
import LessonListForCreator from '../components/LessonPage/LessonListForCreator.jsx';
import ArticleListForCreator from '../components/ArticlePage/ArticleListForCreator.jsx';
import ExerciseListForCreator from '../components/ExercisePage/ExerciseListForCreator.jsx';
import CreateQuestionForm from '../components/QuizPage/CreateQuestionForm.jsx';
import QuizForm from '../components/QuizPage/QuizForm.jsx';
import VideoCall from '../components/chatPage/chatvideo/VideoCall.jsx';
import QuizResultForm from '../components/QuizPage/CreateResultForQuiz.jsx';
import DoQuizForm from '../components/QuizPage/DoQuizForm.jsx';
import QuizListForUser from '../components/QuizPage/QuizListForUser.jsx';
import LessonApprovalForAdmin from '../components/LessonPage/LessonApprovalForAdmin.jsx';
import ArticleApprovalForAdmin from '../components/ArticlePage/ArticleApprovalForAdmin.jsx';
import ExerciseApprovalForAdmin from '../components/ExercisePage/ExerciseApprovalForAdmin.jsx';
import QuizAttemptList from '../components/QuizPage/QuizAttemptList.jsx';
import QuizAttemptDetail from '../components/QuizPage/QuizAttemptDetail.jsx';
import PublicCall from '../components/chatPage/chatvideo/PublicCall.jsx';
import VideoCallZego from '../components/chatPage/chatvideo/VideoCallZego.jsx';
import TestHistory from '../components/testPage/TestHistory.jsx';
import TestAttemptDetail from '../components/testPage/TestAttemptDetail.jsx';
import ExerciseHistoryList from '../components/ExercisePage/ExerciseHistoryList.jsx';
import GamePage from '../components/gameHtml/gamePage.jsx';


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
const HomePage = Loadable(lazy(() => import('../components/userPage/HomePage.jsx')));
const AboutUs = Loadable(lazy(() => import('../components/userPage/AboutSection.jsx')));
const ImportTestPage = Loadable(lazy(() => import('../components/testPage/ImportTestExcel.jsx')))
const OptionPage = Loadable(lazy(() => import('../components/testPage/TestOptionForm')))
const TestListPage = Loadable(lazy(() => import('../components/testPage/TestList.jsx')))
const TestResultForm = Loadable(lazy(() => import('../components/testPage/TestResultForm.jsx')))
const DoTestForm = Loadable(lazy(() => import('../components/testPage/DoTestForm.jsx')))
const SocialPage = Loadable(lazy(() => import('../components/miniSocialPage/NewsFeed')))

const Router = [

  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: 'roles-register', element: <RolesRegisterForm /> },
      { path: 'choose-role', element: <ChooseRolePage /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPasswordFlow /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" replace /> },
      { path: 'unauthorized', element: <Unauthorized /> },
      { path: 'question/option/create', element: <OptionPage /> },
    ],
  },

  //🔐 Private: Cần đăng nhập
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { index: true, element: <Navigate to="/user/homepage" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          { path: 'lesson', element: <LessonApprovalForAdmin /> },
          { path: 'article', element: <ArticleApprovalForAdmin /> },
          { path: 'exercise', element: <ExerciseApprovalForAdmin /> },
          { path: 'lesson/:id', element: <LessonDetail /> },
          { path: 'exercise/:id', element: <ExerciseDetail /> },
          { path: 'article/:id', element: <ArticleDetail /> },

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
      { path: 'homepage', element: <HomePage /> },
      { path: 'social', element: <SocialPage /> },
      { path: 'aboutUs', element: <AboutUs /> },
      { path: 'tests', element: <TestListForUser /> },
      { path: 'quizs', element: <QuizListForUser /> },
      { path: 'lesson', element: <LessonManager /> },
      { path: 'artical', element: <ArticleManager /> },
      { path: 'exercise', element: <ExerciseManager /> },
      { path: 'lesson/:id', element: <LessonDetail /> },
      { path: 'exercise/:id', element: <ExerciseDetail /> },
      { path: 'article/:id', element: <ArticleDetail /> },
      {path: 'game', element: <GamePage />},
      // USER ONLY
      {
        element: <ProtectedRoute allowedRoles={['USER']} />,
        children: [
          { path: 'write-diary', element: <WriteDiaryPage /> },
          { path: 'history', element: <DiaryHistoryPage /> },
          { path: 'mood-history', element: <MoodHistoryPage /> },
          { path: 'doTest/:testId', element: <DoTestForm /> },
          { path: 'doQuiz/:quizId', element: <DoQuizForm /> },
          { path: 'quiz/history', element: <QuizAttemptList /> },
          { path: 'exercise/history', element: <ExerciseHistoryList /> },
          { path: 'quiz/quiz-attempt/:attemptId', element: <QuizAttemptDetail /> },
          { path: 'test/history', element: <TestHistory /> },
          { path: 'test-attempt-detail/:id', element: <TestAttemptDetail /> },


          
          // Appointment for USER
          { path: 'appointment/:userId', element: <Appointments /> },
          { path: 'appointment/edit/:appointmentid', element: <UpdateAppointment /> },
          { path: 'appointment/create/:userId', element: <CreateAppointment /> },

        ],
      },

      // PSYCHO ONLY
      {
        element: <ProtectedRoute allowedRoles={['PSYCHOLOGIST']} />,
        children: [
          { path: 'appointment/psychologist', element: <AppointmentManagement /> },
        ],
      },

      // CHAT for USER and PSYCHO
      {
        element: <ProtectedRoute allowedRoles={['USER', 'PSYCHOLOGIST']} />,
        children: [
          { path: 'chat/list', element: <ChatList /> },
          { path: 'chat/ai', element: <ChatWithAI /> },
          { path: 'chat/:sessionId', element: <ChatWithUser /> },
          { path: 'chat/group/:groupId', element: <ChatGroup /> },
          { path: 'chat/public-call', element: <PublicCall /> },
          {
            path: 'chat/video-call/:sessionId',
            element: <VideoCallZego />
          },
        ],
      },
    ],
  }
  ,
  // test_designer
  {
    path: '/testDesigner',
    element: <FullLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['TEST_DESIGNER']} />,
        children: [
          { path: 'test/', element: <TestListPage /> },
          { path: 'test/create', element: <OptionPage /> },
          { path: 'test/edit/:id', element: <OptionPage /> },
          { path: 'test/importfile', element: <ImportTestPage /> },
          { path: 'test/testResult/create', element: <TestResultForm /> },
          { path: 'test/doTest', element: <DoTestForm /> },
          { path: 'question/create', element: <CreateQuestionForm /> },
          { path: 'quiz/create', element: <QuizForm /> },
          { path: 'quiz/quizResult/create', element: <QuizResultForm /> },

        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },

    ],
  },
  {
    path: '/contentCreator',
    element: <FullLayout />,
    children: [
      {
        element: <ProtectedRoute allowedRoles={['CONTENT_CREATOR']} />,
        children: [
          { path: 'exercise/edit/:exerciseId', element: <EditExercise /> },
          { path: 'article/edit/:articleId', element: <EditArticle /> },
          { path: 'create-lesson', element: <CreateLesson /> },
          { path: 'create-exercise', element: <CreateExercise /> },
          { path: 'create-article', element: <CreateArticle /> },
          { path: 'lesson/:id', element: <LessonDetail /> },
          { path: 'exercise/:id', element: <ExerciseDetail /> },
          { path: 'article/:id', element: <ArticleDetail /> },
          { path: 'lesson/edit/:lessonId', element: <EditLesson /> },
          { path: 'exercise/edit/:exerciseId', element: <EditExercise /> },
          { path: 'article/edit/:articleId', element: <EditArticle /> },
          { path: 'lesson', element: <LessonListForCreator /> },
          { path: 'article', element: <ArticleListForCreator /> },
          { path: 'exercise', element: <ExerciseListForCreator /> },
        ],
      },
      { path: '*', element: <Navigate to="/auth/404" replace /> },

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
  { path: '*', element: <Navigate to="/auth/404" replace /> },
];

export default Router;