import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import {
    TextField,
    Button,
    Alert,
    Box,
    Typography,
    Stack
} from '@mui/material';

const VerifyOtpForm = ({ email, onVerified }) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 phút = 300 giây

    // ⏱️ Đếm ngược
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${minutes}:${secs}`;
    };

    const formik = useFormik({
        initialValues: { otp: '' },
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/verify-otp', null, {
                    params: { email, otp: values.otp }
                });
                setMessage(res.data.message);
                setError('');
                onVerified();
            } catch (err) {
                setError(err.response?.data?.error || 'OTP verification failed');
                setMessage('');
            }
        }
    });

    return (
        <Box maxWidth={400} mx="auto" mt={4} p={3} borderRadius={2} boxShadow={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Verify OTP
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={1}>
                Time remaining: <strong>{formatTime(countdown)}</strong>
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="OTP Code"
                        name="otp"
                        {...formik.getFieldProps('otp')}
                        disabled={countdown === 0}
                    />
                    {message && <Alert severity="success">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={countdown === 0}
                    >
                        Verify OTP
                    </Button>
                </Stack>
            </form>

            {countdown === 0 && (
                <Typography mt={2} color="error" fontSize="0.875rem" textAlign="center">
                    OTP has expired. Please go back and resend a new one.
                </Typography>
            )}
        </Box>
    );
};

export default VerifyOtpForm;
