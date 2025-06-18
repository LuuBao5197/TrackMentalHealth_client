import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox,
    Alert
} from '@mui/material';

import CustomTextField from '../../components/forms/theme-elements/CustomTextField';
import AuthLogin from '../../views/authentication/auth/AuthLogin';

const LoginForm = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = React.useState('');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            remember: true,
        },
        validationSchema: Yup.object({
            email: Yup.string().required('Required'),
            password: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.post('http://localhost:9999/api/users/login', {
                    email: values.email,
                    password: values.password,
                });

                const { token } = response.data;
                console.log('Login token:', token);

                const decoded = jwtDecode(token);
                console.log("Decoded token:", decoded);

                if (decoded.roleId.id === 1) {
                    navigate('/dashboard');
                } else {
                    setErrorMessage('Access denied: You are not an admin.');
                }
            } catch (error) {
                console.error(error);
                setErrorMessage('Login failed. Please check your credentials.');
            }
        }
    });

    return (
        // <form onSubmit={formik.handleSubmit}>
        //     <Stack>
        //         <Box>
        //             <Typography variant="subtitle1" fontWeight={600} htmlFor='email' mb="5px">Email</Typography>
        //             <CustomTextField
        //                 id="email"
        //                 name="email"
        //                 value={formik.values.email}
        //                 onChange={formik.handleChange}
        //                 onBlur={formik.handleBlur}
        //                 error={formik.touched.email && Boolean(formik.errors.email)}
        //                 helperText={formik.touched.email && formik.errors.email}
        //                 variant="outlined"
        //                 fullWidth
        //             />
        //         </Box>
        //         <Box mt="25px">
        //             <Typography variant="subtitle1" fontWeight={600} htmlFor='password' mb="5px">Password</Typography>
        //             <CustomTextField
        //                 id="password"
        //                 name="password"
        //                 type="password"
        //                 value={formik.values.password}
        //                 onChange={formik.handleChange}
        //                 onBlur={formik.handleBlur}
        //                 error={formik.touched.password && Boolean(formik.errors.password)}
        //                 helperText={formik.touched.password && formik.errors.password}
        //                 variant="outlined"
        //                 fullWidth
        //             />
        //         </Box>
        //         <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
        //             <FormGroup>
        //                 <FormControlLabel
        //                     control={
        //                         <Checkbox
        //                             checked={formik.values.remember}
        //                             onChange={formik.handleChange}
        //                             name="remember"
        //                         />
        //                     }
        //                     label="Remember this Device"
        //                 />
        //             </FormGroup>
        //             <Typography
        //                 component="button"
        //                 onClick={() => navigate('/forgot-password')}
        //                 fontWeight="500"
        //                 sx={{
        //                     textDecoration: 'none',
        //                     color: 'primary.main',
        //                     background: 'none',
        //                     border: 'none',
        //                     cursor: 'pointer',
        //                     padding: 0,
        //                     fontSize: 'inherit',
        //                     fontFamily: 'inherit'
        //                 }}
        //             >
        //                 Forgot Password ?
        //             </Typography>

        //         </Stack>
        //     </Stack>
        //     {errorMessage && (
        //         <Alert severity="error" sx={{ mb: 2 }}>
        //             {errorMessage}
        //         </Alert>
        //     )}
        //     <Box>
        //         <Button color="primary" variant="contained" size="large" fullWidth type="submit">
        //             Sign In
        //         </Button>
        //     </Box>
        // </form>
        <AuthLogin
            title="Welcome Back"
            subtext="Please login to continue"
            formik={formik}
        />
    );
};

export default LoginForm;
