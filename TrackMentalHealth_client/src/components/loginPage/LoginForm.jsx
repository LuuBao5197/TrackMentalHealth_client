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
    Stack,
    Alert,
    Button
} from '@mui/material';

import AuthLogin from '../../views/authentication/auth/AuthLogin';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ subtext, subtitle }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = React.useState('');

    const handleSuccessLogin = (token) => {
        try {
            const decoded = jwtDecode(token);
            localStorage.setItem('token', token);
            dispatch(setCredentials({ user: decoded, token }));

            if (decoded.role === "USER") {
                navigate("/user/social");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Token decode failed", err);
        }
    };

    const loginWithSocialToken = async (provider, idToken) => {
        try {
            const response = await axios.post(`http://localhost:9999/api/auth/oauth/${provider}`, null, {
                params: { idToken },
            });
            const { token } = response.data;
            handleSuccessLogin(token);
        } catch (err) {
            console.error(`Login with ${provider} failed:`, err);
            setErrorMessage(`Login with ${provider} failed`);
        }
    };


    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            remember: false
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                const res = await axios.post('http://localhost:9999/api/users/login', values);
                handleSuccessLogin(res.data.token);
            } catch (err) {
                setErrorMessage("Invalid email or password");
            }
        }
    });

    return (
        <AuthLogin
            formik={formik}
            errorMessage={errorMessage}
            subtext={
                <>
                    {subtext}
                    <Stack direction="column" spacing={2} alignItems="center" mt={1}>
                        <GoogleLogin
                            onSuccess={(credentialResponse) => {
                                const credential = credentialResponse.credential;
                                loginWithSocialToken('google', credential);
                            }}
                            onError={() => setErrorMessage('Google login failed')}
                            useOneTap
                        />    
                    </Stack>
                </>
            }
            subtitle={subtitle}
        />
    );
};


export default LoginForm;
