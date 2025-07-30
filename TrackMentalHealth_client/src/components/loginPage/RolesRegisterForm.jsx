import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Typography, Alert, Stack, InputAdornment, IconButton, CircularProgress,
    Paper, Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const RolesRegisterForm = () => {
    const roleNames = {
        2: 'Psychologist',
        3: 'Content Creator',
        4: 'Test Designer',
        5: 'User',
    };
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleId = parseInt(queryParams.get('roleId'));

    if (!roleId || isNaN(roleId)) {
        return <Alert severity="error">Missing or invalid role ID. Please go back and choose a role.</Alert>;
    }

    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState('');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [certificates, setCertificates] = useState([]);
    const [avatar, setAvatar] = useState(null);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const validationSchema = Yup.object({
        fullName: Yup.string().required('Full name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setEmailForOtp(values.email);
                await axios.post('http://localhost:9999/api/users/send-otp-register', null, {
                    params: { email: values.email }
                });
                setOtpDialogOpen(true);
                setOtpSentMessage('OTP has been sent to your email.');
                setResendCooldown(60);
            } catch (error) {
                console.error('Error sending OTP:', error);
                alert('Failed to send OTP. Try again later.');
            } finally {
                setLoading(false);
            }
        },
    });

    const handleVerifyOtp = async () => {
        try {
            await axios.post('http://localhost:9999/api/users/verify-otp-register', null, {
                params: { email: emailForOtp, otp }
            });

            const formData = new FormData();
            formData.append('fullName', formik.values.fullName);
            formData.append('email', formik.values.email);
            formData.append('password', formik.values.password);
            formData.append('confirmPassword', formik.values.confirmPassword);
            formData.append('roleId', roleId.toString());

            if (avatar) {
                formData.append('avatar', avatar);
            }
            certificates.forEach(file => formData.append('certificates', file));

            await axios.post('http://localhost:9999/api/users/register', formData);
            alert('Registration successful!');
            navigate('/auth/login');
        } catch (error) {
            setOtpError(error.response?.data?.message || 'OTP verification or registration failed.');
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        try {
            await axios.post('http://localhost:9999/api/users/send-otp-register', null, {
                params: { email: emailForOtp }
            });
            setOtpSentMessage('OTP resent successfully.');
            setResendCooldown(60);
        } catch (error) {
            setOtpSentMessage('Failed to resend OTP.');
        }
    };

    const handleCertificateChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert('You can only upload up to 5 certificates.');
        } else {
            setCertificates(files);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f9f9f9">
            <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
                <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
                    {roleNames[roleId] || 'Special Role'} Registration
                </Typography>
                <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
                    <Stack spacing={2}>
                        <TextField
                            label="Full Name"
                            name="fullName"
                            fullWidth
                            value={formik.values.fullName}
                            onChange={formik.handleChange}
                            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                            helperText={formik.touched.fullName && formik.errors.fullName}
                        />
                        <TextField
                            label="Email"
                            name="email"
                            fullWidth
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            name="password"
                            fullWidth
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm Password"
                            name="confirmPassword"
                            fullWidth
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box>
                            <Typography variant="body2" mb={0.5}>Upload Avatar (optional)</Typography>
                            <TextField type="file" inputProps={{ accept: 'image/*' }} onChange={(e) => setAvatar(e.target.files[0])} fullWidth />
                        </Box>
                        <Box>
                            <Typography variant="body2" mb={0.5}>Upload Certificates (1–5 files)</Typography>
                            <TextField type="file" inputProps={{ multiple: true, accept: '.pdf,.jpg,.png' }} onChange={handleCertificateChange} fullWidth />
                        </Box>
                        <Button type="submit" variant="contained" fullWidth disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                        </Button>
                    </Stack>
                </form>

                <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
                    <DialogTitle>Verify Email</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            {otpSentMessage && <Alert severity="info">{otpSentMessage}</Alert>}
                            {otpError && <Alert severity="error">{otpError}</Alert>}
                            <TextField
                                label="Enter OTP"
                                fullWidth
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            <Button onClick={handleResendOtp} disabled={resendCooldown > 0}>
                                Resend OTP {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                            </Button>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleVerifyOtp} variant="contained">Verify</Button>
                        <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Box>
    );
};

export default RolesRegisterForm;
