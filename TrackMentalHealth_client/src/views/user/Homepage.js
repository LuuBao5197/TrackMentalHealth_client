import React from 'react';
import { Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import AllForm from '../../components/LessonPage/AllForm';
import HeroPage from '@components/userPage/HeroPage';
const HomePage = () => {
  return (
    <PageContainer title="Home Page" description="this is Sample page">
      <HeroPage />
      <AllForm/>
    </PageContainer>
  );
};

export default HomePage;
