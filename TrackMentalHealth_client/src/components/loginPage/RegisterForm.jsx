import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    MenuItem,
    InputLabel,
    Select,
    FormControl,
} from '@mui/material';
import { Stack } from '@mui/system';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import CustomTextField from '../../components/forms/theme-elements/CustomTextField';

const RegisterForm = () => {
    const navigate = useNavigate();
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
                // 1. Gọi API kiểm tra email
                const emailCheck = await axios.get(`http://localhost:9999/api/users/check-email`, {
                    params: { email: values.email },
                });

                if (emailCheck.data.exists) {
                    alert('Email is already registered!');
                    setSubmitting(false);
                    return;
                }

                // 2. Nếu email hợp lệ, tạo FormData
                const formData = new FormData();
                formData.append('fullName', values.fullName);
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('roleId', Number(values.roleId));

                if (avatarFile) formData.append('avatar', avatarFile);
                const roleIdNum = Number(values.roleId);
                const requiresCertificate = [3, 4, 5].includes(roleIdNum);

                if (requiresCertificate) {
                    if (!certificateFiles || certificateFiles.length < 1 || certificateFiles.length > 5) {
                        setCertificateError('You must upload between 1 and 5 certificates for this role.');
                        setSubmitting(false);
                        return;
                    } else {
                        setCertificateError('');
                        Array.from(certificateFiles).forEach((file) =>
                            formData.append('certificates', file)
                        );
                    }
                }

                // 3. Gửi form đăng ký
                const response = await axios.post('http://localhost:9999/api/users/register', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                alert('Registration successful!');
                navigate('/auth/login');
            } catch (err) {
                alert('Registration failed. Please try again.');
                console.error('Registration error:', err.response?.data || err);
            } finally {
                setSubmitting(false);
            }
        },

    });

    const showCertificateInput =
        formik.values.roleId === 3 ||
        formik.values.roleId === 4 ||
        formik.values.roleId === 5;

    const [certificateError, setCertificateError] = useState('');

    return (
        <Box component="form" onSubmit={formik.handleSubmit} encType="multipart/form-data">
            <Stack mb={3}>
                <Typography variant="subtitle1" fontWeight={600} mb="5px">
                    Name
                </Typography>
                <CustomTextField
                    id="fullName"
                    name="fullName"
                    label="Full Name"
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
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={async (e) => {
                        formik.handleBlur(e); // giữ tính năng validation của Yup
                        const email = e.target.value;

                        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return; // bỏ qua nếu không hợp lệ

                        try {
                            const res = await axios.get('http://localhost:9999/api/users/check-email', {
                                params: { email },
                            });

                            if (res.data.exists) {
                                formik.setFieldError('email', 'Email is already taken');
                            }
                        } catch (err) {
                            console.error('Check email failed', err);
                        }
                    }}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <Typography variant="subtitle1" fontWeight={600} mb="5px" mt="25px">
                    Password
                </Typography>
                <CustomTextField
                    id="password"
                    name="password"
                    label="Password"
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
                        label="Role"
                        value={formik.values.roleId}
                        onChange={(e) => formik.setFieldValue('roleId', Number(e.target.value))}
                        error={formik.touched.roleId && Boolean(formik.errors.roleId)}
                    >
                        <MenuItem value="1">User</MenuItem>
                        <MenuItem value="3">Content Creator</MenuItem>
                        <MenuItem value="4">Test Designer</MenuItem>
                        <MenuItem value="5">Psychologist</MenuItem>
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
                        {certificateError && (
                            <Typography color="error" fontSize="0.875rem" mt="5px">
                                {certificateError}
                            </Typography>
                        )}
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
    );
};

export default RegisterForm;
