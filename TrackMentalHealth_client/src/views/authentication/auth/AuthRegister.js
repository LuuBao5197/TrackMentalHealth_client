import React, { useState } from 'react';
import { Box, Typography, Button, MenuItem, InputLabel, Select, FormControl } from '@mui/material';
import { Stack } from '@mui/system';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const AuthRegister = ({ title, subtitle, subtext }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      roleId: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      roleId: Yup.string().required('Please select role'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append('fullName', values.fullName);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('roleId', Number(values.roleId));

        if (avatarFile) formData.append('avatar', avatarFile);

        if (certificateFiles.length > 0) {
          Array.from(certificateFiles).forEach((file) =>
            formData.append('certificates', file)
          );
        }

        const response = await axios.post('http://localhost:9999/api/users/register', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        alert('Registration successful!');
      } catch (err) {
        alert('Registration failed. Please try again.');
        console.error('Registration error:', err.response?.data || err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const showCertificateInput =
    formik.values.roleId === '2' || formik.values.roleId === '4' || formik.values.roleId === '5';

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      <Box component="form" onSubmit={formik.handleSubmit} encType="multipart/form-data">
        <Stack mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb="5px">
            Name
          </Typography>
          <CustomTextField
            id="fullName"
            name="fullName"
            variant="outlined"
            fullWidth
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
          />

          <Typography variant="subtitle1" fontWeight={600} mb="5px" mt="25px">
            Email Address
          </Typography>
          <CustomTextField
            id="email"
            name="email"
            variant="outlined"
            fullWidth
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <Typography variant="subtitle1" fontWeight={600} mb="5px" mt="25px">
            Password
          </Typography>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="roleId-label">Role</InputLabel>
            <Select
              labelId="roleId-label"
              id="roleId"
              name="roleId"
              value={formik.values.roleId}
              onChange={(e) => formik.setFieldValue('roleId', Number(e.target.value))}
              error={formik.touched.roleId && Boolean(formik.errors.roleId)}
            >
              {/* <MenuItem value="1">Admin</MenuItem> */}
              <MenuItem value="2">Psychologist</MenuItem>
              <MenuItem value="3">User</MenuItem>
              <MenuItem value="4">Content Creator</MenuItem>
              <MenuItem value="5">Test Designer</MenuItem>
            </Select>
          </FormControl>

          <Box mt={2}>
            <Typography fontWeight={600} mb="5px">
              Avatar (optional)
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.currentTarget.files[0])}
            />
          </Box>

          {showCertificateInput && (
            <Box mt={2}>
              <Typography fontWeight={600} mb="5px">
                Certificates (1–5 files)
              </Typography>
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={(e) => setCertificateFiles(e.target.files)}
              />
            </Box>
          )}
        </Stack>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
        >
          Sign Up
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
