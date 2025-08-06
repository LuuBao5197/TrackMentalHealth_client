import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Alert,
    Link,
    Stack,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [emailForOtp, setEmailForOtp] = useState('');
    const [otp, setOtp] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpSentMessage, setOtpSentMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const validationSchema = Yup.object({
        fullName: Yup.string().required('Full name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
        confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match')
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
        onSubmit: async (values, { setFieldError }) => {
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
                if (
                    error.response &&
                    error.response.status === 400 &&
                    error.response.data?.error === 'Email already exists'
                ) {
                    setFieldError('email', 'Email already exists');
                } else {
                    console.error('Error sending OTP:', error);
                }
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
            setOtpVerified(true);
            setOtpDialogOpen(false);

            const registerData = new FormData();
            registerData.append('fullName', formik.values.fullName);
            registerData.append('email', formik.values.email);
            registerData.append('password', formik.values.password);
            registerData.append('confirmPassword', formik.values.confirmPassword);
            registerData.append('roleId', '5'); // USER role

            await axios.post('http://localhost:9999/api/users/register', registerData);
            alert('Registration successful!');
            navigate('/auth/login');
        } catch (error) {
            setOtpError('Invalid OTP. Please try again.');
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

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
                <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                    helperText={formik.touched.fullName && formik.errors.fullName}
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    name="password"
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
                    fullWidth
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    name="confirmPassword"
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
                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                </Button>
                <Typography align="center">
                    Not a User? <Link href="/TrackMentalHealth/auth/choose-role">Click here!</Link>
                </Typography>
            </Stack>

            <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
                <DialogTitle>Email Verification</DialogTitle>
                <DialogContent>
                    <Stack spacing={2}>
                        {otpSentMessage && <Alert severity="info">{otpSentMessage}</Alert>}
                        {otpError && <Alert severity="error">{otpError}</Alert>}
                        <TextField
                            fullWidth
                            label="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button
                            onClick={handleResendOtp}
                            disabled={resendCooldown > 0}
                            variant="outlined"
                        >
                            Resend OTP {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleVerifyOtp} variant="contained">Verify OTP</Button>
                    <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </form>
    );
};

export default RegisterForm;
