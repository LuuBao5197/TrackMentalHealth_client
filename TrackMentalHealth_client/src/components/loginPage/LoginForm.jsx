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
                if(decoded.role == "User"){
                    alert("Login success");
                    navigate("/user/social")
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
