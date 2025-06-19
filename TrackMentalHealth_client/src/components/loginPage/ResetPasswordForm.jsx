import React from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import {
    TextField,
    Button,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
const ResetPasswordForm = ({ email }) => {
    const navigate = useNavigate();
    const [error, setError] = React.useState('');
    const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);



    const formik = useFormik({
        initialValues: { newPassword: '' },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('New password is required'),
        }),
        onSubmit: async (values) => {
            try {
                await axios.post('http://localhost:9999/api/users/reset-password', null, {
                    params: { email, newPassword: values.newPassword }
                });
                setError('');
                setSuccessDialogOpen(true);
            } catch (err) {
                setError(err.response?.data?.error || 'Password reset failed');
            }
        }
    });

    const handleDialogClose = () => {
        setSuccessDialogOpen(false);
        navigate('/auth/login'); // Chuyển về trang đăng nhập sau khi đóng dialog
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="newPassword"
                    {...formik.getFieldProps('newPassword')}
                    error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    Reset Password
                </Button>
            </form>

            <Dialog open={successDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Password Reset Successful</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your password has been reset successfully . Click OK to return to login.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ResetPasswordForm;
