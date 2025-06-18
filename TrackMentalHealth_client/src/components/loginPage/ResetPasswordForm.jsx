import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { TextField, Button, Alert } from '@mui/material';

const ResetPasswordForm = ({ email }) => {
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: { newPassword: '' },
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/reset-password', null, {
                    params: { email, newPassword: values.newPassword }
                });
                setMessage(res.data.message);
                setError('');
            } catch (err) {
                setError(err.response?.data?.error || 'Password reset failed');
                setMessage('');
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <TextField fullWidth type="password" label="New Password" name="newPassword" {...formik.getFieldProps('newPassword')} />
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Reset Password</Button>
        </form>
    );
};

export default ResetPasswordForm;
