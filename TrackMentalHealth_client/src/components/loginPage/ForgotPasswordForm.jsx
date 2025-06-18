import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Alert } from '@mui/material';

const ForgotPasswordForm = ({ onOtpSent }) => {
    const [message, setMessage] = React.useState('');
    const [error, setError] = React.useState('');

    const formik = useFormik({
        initialValues: { email: '' },
        validationSchema: Yup.object({ email: Yup.string().email().required('Required') }),
        onSubmit: async (values) => {
            try {
                const res = await axios.post(
                    'http://localhost:9999/api/users/forgot-password',
                    null,
                    { params: { email: values.email } }
                );
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
        <form onSubmit={formik.handleSubmit}>
            <TextField fullWidth label="Email" name="email" {...formik.getFieldProps('email')} />
            {formik.touched.email && formik.errors.email && <div>{formik.errors.email}</div>}
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>Send OTP</Button>
        </form>
    );
};

export default ForgotPasswordForm;
