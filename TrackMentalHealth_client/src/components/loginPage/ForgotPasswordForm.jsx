import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Alert, Box, Typography, Stack } from '@mui/material';

const ForgotPasswordForm = ({ onOtpSent }) => {
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({ email: Yup.string().email('Invalid email').required('Required') }),
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/forgot-password', null, {
                    params: { email: values.email }
                });
                setMessage(res.data.message);
                setError('');
                onOtpSent(values.email);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Error sending OTP');
                setMessage('');
            }
        }
    });

    return (
        <Box maxWidth={400} mx="auto" mt={4} p={3} borderRadius={2} boxShadow={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Forgot Password
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />
                    {message && <Alert severity="success">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" fullWidth>
                        Send OTP
                    </Button>
                </Stack>
            </form>
        </Box>
    );
};

export default ForgotPasswordForm;
