import React from 'react';
import {
    Box,
    Typography,
    FormGroup,
    FormControlLabel,
    Button,
    Stack,
    Checkbox
} from '@mui/material';
import { Link } from 'react-router-dom';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
const AuthLogin = ({ title, subtitle, subtext, formik, errorMessage }) => (

    <form onSubmit={formik.handleSubmit}>
        <Box display="flex" justifyContent="center" mb={3}>
            <svg
                id="cat"
                width="200"
                height="200"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="100" cy="100" r="60" fill="#FDCB6E" stroke="#000" strokeWidth="2" />

                <polygon points="50,70 55,25 85,55" fill="#FDCB6E" stroke="#000" strokeWidth="2" />

                <polygon points="115,55 145,25 150,70" fill="#FDCB6E" stroke="#000" strokeWidth="2" />

                <circle className="eye" cx="80" cy="90" r="10" fill="#fff" />
                <circle className="pupil" cx="80" cy="90" r="5" fill="#000" />

                <circle className="eye" cx="120" cy="90" r="10" fill="#fff" />
                <circle className="pupil" cx="120" cy="90" r="5" fill="#000" />

                <path d="M90,120 Q100,130 110,120" stroke="#000" strokeWidth="2" fill="none" />

                <rect
                    className="left-hand"
                    x="45"
                    y="130"
                    width="20"
                    height="40"
                    rx="10"
                    ry="10"
                    fill="#FDCB6E"
                    stroke="#000"
                    strokeWidth="2"
                    transform-origin="55 130"
                />

                <rect
                    className="right-hand"
                    x="135"
                    y="130"
                    width="20"
                    height="40"
                    rx="10"
                    ry="10"
                    fill="#FDCB6E"
                    stroke="#000"
                    strokeWidth="2"
                    transform-origin="145 130"
                />

                <rect className="hand" x="50" y="70" width="100" height="30" fill="#000000FF" rx="10" ry="10" style={{ display: 'none' }} />
            </svg>
        </Box>
        {title && (
            <Typography fontWeight="700" variant="h2" mb={1}>
                {title}
            </Typography>
        )}

        {subtext}

        {errorMessage && (
            <Box mt={2}>
                <Typography color="error" variant="body1" textAlign="center">
                    {errorMessage}
                </Typography>
            </Box>
        )}

        <Stack>
            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="label"
                    htmlFor="email"
                    mb="5px"
                >
                    Email
                </Typography>
                <CustomTextField
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    variant="outlined"
                    fullWidth
                />
            </Box>
            <Box mt="25px">
                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="label"
                    htmlFor="password"
                    mb="5px"
                >
                    Password
                </Typography>
                <CustomTextField
                    id="password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onFocus={() => {
                        document.querySelector('.left-hand').setAttribute('y', '70');
                        document.querySelector('.right-hand').setAttribute('y', '70');
                        document.querySelector('.hand').style.display = 'block';
                    }}

                    onBlur={() => {
                        document.querySelector('.left-hand').setAttribute('y', '130');
                        document.querySelector('.right-hand').setAttribute('y', '130');
                        document.querySelector('.hand').style.display = 'none';
                    }}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    variant="outlined"
                    fullWidth
                />
            </Box>
            <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="remember"
                                checked={formik.values.remember}
                                onChange={formik.handleChange}
                            />
                        }
                        label="Remember this Device"
                    />
                </FormGroup>
                <Typography
                    component={Link}
                    to="/auth/forgot-password"
                    fontWeight="500"
                    sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                    }}
                >
                    Forgot Password?
                </Typography>
            </Stack>
        </Stack>

        <Box>
            <Button color="primary" variant="contained" size="large" fullWidth type="submit">
                Sign In
            </Button>
        </Box>

        {subtitle}
    </form>
);

export default AuthLogin;
