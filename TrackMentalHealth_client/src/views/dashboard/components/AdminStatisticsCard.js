import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Grid, Paper, Typography, Box } from '@mui/material';
import DashboardCard from '../../../components/shared/DashboardCard';

const StatisticBox = ({ title, value }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="h6" color="textSecondary">
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
    </Typography>
  </Paper>
);

const AdminStatisticsCard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get('http://localhost:9999/api/admin/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin statistics:', error);
      }
    };
    getData();
  }, []);

  if (!stats) return <div>Loading statistics...</div>;

  return (
    <DashboardCard title="System Statistics">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Users" value={stats.totalUsers} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Content Creators" value={stats.totalContentCreators} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Test Designers" value={stats.totalTestDesigners} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Psychologists" value={stats.totalPsychologists} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Lessons" value={stats.totalLessons} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Articles" value={stats.totalArticles} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Exercises" value={stats.totalExercises} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatisticBox title="Comments" value={stats.totalComments} />
          </Grid>
        </Grid>
      </Box>
    </DashboardCard>
  );
};

export default AdminStatisticsCard;
