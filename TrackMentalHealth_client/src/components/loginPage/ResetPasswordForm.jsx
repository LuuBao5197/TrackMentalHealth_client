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
    DialogTitle,
    Box,
    Typography,
    Stack
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
            newPassword: Yup.string().min(6, 'At least 6 characters').required('New password is required'),
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
        navigate('/auth/login');
    };

    return (
        <Box maxWidth={400} mx="auto" mt={4} p={3} borderRadius={2} boxShadow={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Reset Password
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        type="password"
                        label="New Password"
                        name="newPassword"
                        {...formik.getFieldProps('newPassword')}
                        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" variant="contained" fullWidth>
                        Reset Password
                    </Button>
                </Stack>
            </form>

            <Dialog open={successDialogOpen} onClose={handleDialogClose}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your password has been reset successfully. Click OK to go back to login.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ResetPasswordForm;
