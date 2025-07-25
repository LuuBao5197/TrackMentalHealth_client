import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Typography, Alert, Stack, Box
} from '@mui/material';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordDialog = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [successReset, setSuccessReset] = useState(false);
    const [countdown, setCountdown] = useState(300);
    React.useEffect(() => {
        if (step === 2) {
            setCountdown(300);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [step]);

    const handleClose = () => {
        setStep(1);
        setEmail('');
        setMessage('');
        setError('');
        setSuccessReset(false);
        onClose();
    };

    const sendOtpForm = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required')
        }),
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/forgot-password', null, {
                    params: { email: values.email }
                });
                setMessage(res.data.message);
                setEmail(values.email);
                setError('');
                setStep(2);
            } catch (err) {
                setError(err.response?.data?.error || 'Error sending OTP');
                setMessage('');
            }
        }
    });

    const verifyOtpForm = useFormik({
        initialValues: { otp: '' },
        validationSchema: Yup.object({
            otp: Yup.string().required('OTP is required')
        }),
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/verify-otp', null, {
                    params: { email, otp: values.otp }
                });
                setMessage(res.data.message);
                setError('');
                setStep(3);
            } catch (err) {
                setError(err.response?.data?.error || 'OTP verification failed');
                setMessage('');
            }
        }
    });

    const resetPasswordForm = useFormik({
        initialValues: { newPassword: '' },
        validationSchema: Yup.object({
            newPassword: Yup.string().min(6, 'At least 6 characters').required('Required')
        }),
        onSubmit: async (values) => {
            try {
                await axios.post('http://localhost:9999/api/users/reset-password', null, {
                    params: { email, newPassword: values.newPassword }
                });
                setError('');
                setMessage('');
                setSuccessReset(true);
            } catch (err) {
                setError(err.response?.data?.error || 'Password reset failed');
            }
        }
    });

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {step === 1 && 'Forgot Password'}
                {step === 2 && 'Verify OTP'}
                {step === 3 && 'Reset Password'}
            </DialogTitle>
            <DialogContent>
                <Box mt={1}>
                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {step === 1 && (
                        <form onSubmit={sendOtpForm.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    {...sendOtpForm.getFieldProps('email')}
                                    error={sendOtpForm.touched.email && Boolean(sendOtpForm.errors.email)}
                                    helperText={sendOtpForm.touched.email && sendOtpForm.errors.email}
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Send OTP
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={verifyOtpForm.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    label="OTP Code"
                                    fullWidth
                                    {...verifyOtpForm.getFieldProps('otp')}
                                    error={verifyOtpForm.touched.otp && Boolean(verifyOtpForm.errors.otp)}
                                    helperText={verifyOtpForm.touched.otp && verifyOtpForm.errors.otp}
                                />
                                <Typography align="center" color={countdown <= 0 ? 'error' : 'textSecondary'}>
                                    Time remaining: {`${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`}
                                </Typography>
                                <Button type="submit" variant="contained" fullWidth disabled={countdown <= 0}>
                                    Verify OTP
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 3 && !successReset && (
                        <form onSubmit={resetPasswordForm.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField
                                    type="password"
                                    label="New Password"
                                    fullWidth
                                    {...resetPasswordForm.getFieldProps('newPassword')}
                                    error={resetPasswordForm.touched.newPassword && Boolean(resetPasswordForm.errors.newPassword)}
                                    helperText={resetPasswordForm.touched.newPassword && resetPasswordForm.errors.newPassword}
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Reset Password
                                </Button>
                            </Stack>
                        </form>
                    )}

                    {step === 3 && successReset && (
                        <Box textAlign="center">
                            <Typography variant="h6" color="success.main" mb={2}>
                                Your password has been reset successfully!
                            </Typography>
                            <Button variant="contained" onClick={() => {
                                handleClose();
                                navigate('/auth/login');
                            }}>
                                Go to Login
                            </Button>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            {step !== 3 && (
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ForgotPasswordDialog;
