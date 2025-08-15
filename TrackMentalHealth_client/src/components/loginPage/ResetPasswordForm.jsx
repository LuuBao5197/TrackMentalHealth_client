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
    Stack,
    IconButton,
    InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const ResetPasswordForm = ({ email }) => {
    const navigate = useNavigate();
    const [error, setError] = React.useState('');
    const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);

    // Tách state show/ẩn riêng cho form và dialog
    const [showFormPassword, setShowFormPassword] = React.useState(false);
    const [showDialogPassword, setShowDialogPassword] = React.useState(false);

    const formik = useFormik({
        initialValues: { newPassword: '' },
        validationSchema: Yup.object({
            newPassword: Yup.string()
                .min(6, 'At least 6 characters')
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
        navigate('/auth/login');
    };

    return (
        <Box maxWidth={400} mx="auto" mt={4} p={3} borderRadius={2} boxShadow={3}>
            <Typography variant="h5" fontWeight="bold" mb={2}>
                Reset Password
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    {/* Input trong form */}
                    <TextField
                        fullWidth
                        type={showFormPassword ? 'text' : 'password'}
                        label="New Password"
                        name="newPassword"
                        {...formik.getFieldProps('newPassword')}
                        error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                        helperText={formik.touched.newPassword && formik.errors.newPassword}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowFormPassword(prev => !prev)}
                                        edge="end"
                                    >
                                        {showFormPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
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
                        Your password has been reset successfully. You can view it below:
                    </DialogContentText>
                    <TextField
                        fullWidth
                        type={showDialogPassword ? 'text' : 'password'}
                        label="New Password"
                        value={formik.values.newPassword}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowDialogPassword(prev => !prev)}
                                        edge="end"
                                    >
                                        {showDialogPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        sx={{ mt: 2 }}
                    />
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
