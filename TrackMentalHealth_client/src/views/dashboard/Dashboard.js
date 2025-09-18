import React from 'react';
import { Grid, Box } from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';

// components
import SalesOverview from './components/SalesOverview';
import YearlyBreakup from './components/YearlyBreakup';
import RecentTransactions from './components/RecentTransactions';
import ProductPerformance from './components/ProductPerformance';
import Blog from './components/Blog';
import MonthlyEarnings from './components/MonthlyEarnings';
import AdminStatisticsCard from './components/AdminStatisticsCard';


const Dashboard = () => {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard">
      <Box>
        <Grid item xs={12}>
        < AdminStatisticsCard /> {/* Thêm vào vị trí bạn muốn */}
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
