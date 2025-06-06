import React from 'react';
import { Typography } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';


const HomePage = () => {
  return (
    <PageContainer title="Home Page" description="this is Sample page">

      <DashboardCard title="Sample Page">
        <Typography>This is a home page</Typography>
      </DashboardCard>
    </PageContainer>
  );
};

export default HomePage;
