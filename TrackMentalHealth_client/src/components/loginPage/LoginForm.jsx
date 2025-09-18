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
                navigate("/user/homepage");
            } else if (decoded.role === "ADMIN") {
                navigate("/dashboard");
            } else if (decoded.role === "PSYCHOLOGIST") {
                navigate("/user/homepage");
            } else if (decoded.role === "TEST_DESIGNER") {
                navigate("/testDesigner/test/");
            } else if (decoded.role === "CONTENT_CREATOR") {
                navigate("/contentCreator/create-lesson");
            }
        } catch (err) {
            console.error("Token decode failed", err);
        }
    };

    const loginWithSocialToken = async (provider, credential) => {
        try {
            // Decode credential (JWT)
            const decoded = jwtDecode(credential);
            console.log("Decoded Google token:", decoded);

            // Gửi credential lên backend để xác thực
            const res = await axios.post(
                `http://localhost:9999/api/auth/oauth/${provider}`,
                null,
                { params: { idToken: credential } }
            );

            // Lưu token backend trả về
            handleSuccessLogin(res.data.token);
        } catch (err) {
            console.error(`Login with ${provider} failed:`, err.response?.data || err.message);
            alert(err.response?.data || "Login failed");
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
                if (err.response) {
                    console.error("Backend error:", err.response.data);
                    const msg = err.response.data.error || err.response.data.message || "Login failed";
                    setErrorMessage(msg); // ✅ chỉ lưu string
                } else {
                    console.error("Unexpected error:", err);
                    setErrorMessage("Something went wrong");
                }
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
                                loginWithSocialToken("google", credential);
                            }}
                            onError={() => setErrorMessage("Google login failed")}
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
