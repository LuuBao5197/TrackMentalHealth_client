import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Stack,
    IconButton,
    InputAdornment,
    useTheme,
    Paper,
    Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import ForgotPasswordDialog from '../../../components/loginPage/ForgotPasswordDialog';

const AuthLogin = ({ title, subtitle, subtext, formik, errorMessage }) => {
    const [showForgotDialog, setShowForgotDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const theme = useTheme();

    return (
        <Paper
            elevation={3}
            sx={{
                p: 4,
                borderRadius: 4,
                maxWidth: 420,
                margin: '0 auto',
                backgroundColor: '#fefefe',
                boxShadow: '0 0 15px rgba(0,0,0,0.05)',
            }}
        >
            <form onSubmit={formik.handleSubmit}>
                {title && (
                    <Typography
                        fontWeight={700}
                        variant="h4"
                        textAlign="center"
                        color="primary"
                        mb={1}
                    >
                        {title}
                    </Typography>
                )}

                {subtext && (
                    <Typography
                        variant="subtitle2"
                        textAlign="center"
                        color="text.secondary"
                        mb={3}
                    >
                        {subtext}
                    </Typography>
                )}

                {errorMessage && (
                    <Box mb={2}>
                        <Typography
                            color="error"
                            variant="body2"
                            textAlign="center"
                            sx={{ backgroundColor: '#fdecea', py: 1, borderRadius: 1 }}
                        >
                            {errorMessage}
                        </Typography>
                    </Box>
                )}

                <Stack spacing={3}>
                    <CustomTextField
                        id="email"
                        name="email"
                        label="Email"
                        fullWidth
                        variant="outlined"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                    />

                    <CustomTextField
                        id="password"
                        name="password"
                        label="Password"
                        fullWidth
                        variant="outlined"
                        type={showPassword ? 'text' : 'password'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onFocus={() => {
                            document.querySelector('.left-hand')?.setAttribute('y', '70');
                            document.querySelector('.right-hand')?.setAttribute('y', '70');
                            document.querySelector('.hand')?.style.setProperty('display', 'block');
                        }}
                        onBlur={() => {
                            document.querySelector('.left-hand')?.setAttribute('y', '130');
                            document.querySelector('.right-hand')?.setAttribute('y', '130');
                            document.querySelector('.hand')?.style.setProperty('display', 'none');
                        }}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                            component="span"
                            fontSize={14}
                            sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => setShowForgotDialog(true)}
                        >
                            Forgot Password?
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        size="large"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            py: 1.5,
                        }}
                    >
                        Sign In
                    </Button>
                </Stack>

                {subtitle && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="body2" textAlign="center" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </>
                )}

                <ForgotPasswordDialog open={showForgotDialog} onClose={() => setShowForgotDialog(false)} />
            </form>
        </Paper>
    );
};

export default AuthLogin;
