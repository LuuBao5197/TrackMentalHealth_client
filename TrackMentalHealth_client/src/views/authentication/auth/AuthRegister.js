import React from 'react';
import { Typography } from '@mui/material';
import RegisterForm from '../../../components/loginPage/RegisterForm';

const AuthRegister = ({ title, subtitle, subtext }) => {
  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}
      {subtext}
      <RegisterForm />
      {subtitle}
    </>
  );
};

export default AuthRegister;
