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

const AuthLogin = ({ title, subtitle, subtext, formik }) => (
    <form onSubmit={formik.handleSubmit}>
        {title && (
            <Typography fontWeight="700" variant="h2" mb={1}>
                {title}
            </Typography>
        )}

        {subtext}

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
                    onBlur={formik.handleBlur}
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
