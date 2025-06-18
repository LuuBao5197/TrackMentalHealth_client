import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { TextField, Button, Alert } from '@mui/material';

const VerifyOtpForm = ({ email, onVerified }) => {
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

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
        <form onSubmit={formik.handleSubmit}>
            <TextField fullWidth label="OTP" name="otp" {...formik.getFieldProps('otp')} />
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Verify OTP</Button>
        </form>
    );
};

export default VerifyOtpForm;
