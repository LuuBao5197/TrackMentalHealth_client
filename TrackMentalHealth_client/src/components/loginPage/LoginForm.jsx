import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
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
    const dispatch = useDispatch();
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
                const {token} = response.data;
                console.log('Token from response:', token);

                // ✅ Lưu token vào localStorage
                localStorage.setItem('token', token);

                const decoded = jwtDecode(token);
                dispatch(setCredentials({ user: decoded, token }));
                console.log('Decoded token:', decoded);

                if (decoded.roles && decoded.roles.includes('ROLE_ADMIN')) {
                    navigate('/dashboard');
                } else if (decoded.roleId.id === 1) {
                    navigate('/user/homepage');
                }
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setErrorMessage('Invalid email or password');
                } else {
                    setErrorMessage('Login failed. Please try again later.');
                }
            }
        }
    });

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            const pupils = document.querySelectorAll('.pupil');
            pupils.forEach(pupil => {
                const rect = pupil.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const angle = Math.atan2(dy, dx);
                const radius = 3;
                pupil.setAttribute('cx', Number(pupil.dataset.ox) + radius * Math.cos(angle));
                pupil.setAttribute('cy', Number(pupil.dataset.oy) + radius * Math.sin(angle));
            });
        };

        const pupils = document.querySelectorAll('.pupil');
        pupils.forEach(pupil => {
            pupil.dataset.ox = pupil.getAttribute('cx');
            pupil.dataset.oy = pupil.getAttribute('cy');
        });

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);


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
            subtitle={
                <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">
                        New to Track Mental Health?
                    </Typography>
                    <Typography
                        component="a"
                        href="/TrackMentalHealth/auth/register"
                        fontWeight="500"
                        sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                        }}
                    >
                        Create an account
                    </Typography>
                </Stack>
            }
            formik={formik}
            errorMessage={errorMessage}
        />
    );
};

export default LoginForm;
