import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
    Button,
    TextField,
    Typography,
    InputLabel,
    MenuItem,
    Select,
    FormControl,
    Box,
} from '@mui/material';

const RegisterForm = () => {
    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            fullName: '',
            roleId: '',
            avatar: null,
            certificates: [],
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().min(6).required('Required'),
            fullName: Yup.string().required('Required'),
            roleId: Yup.number().required('Required'),
        }),
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const formData = new FormData();
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('fullName', values.fullName);
                formData.append('roleId', values.roleId);

                if (values.avatar) {
                    formData.append('avatar', values.avatar);
                }

                if (values.certificates && values.certificates.length > 0) {
                    Array.from(values.certificates).forEach((file, index) => {
                        formData.append('certificates', file);
                    });
                }

                const res = await axios.post('http://localhost:9999/api/users/register', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                alert(res.data.message);
                resetForm();
            } catch (err) {
                alert(err.response?.data?.error || 'Register failed');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} encType="multipart/form-data">
            <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && !!formik.errors.email}
                helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
                fullWidth
                type="password"
                margin="normal"
                label="Password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={formik.touched.password && !!formik.errors.password}
                helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                name="fullName"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                error={formik.touched.fullName && !!formik.errors.fullName}
                helperText={formik.touched.fullName && formik.errors.fullName}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                    name="roleId"
                    value={formik.values.roleId}
                    onChange={formik.handleChange}
                >
                    {/* <MenuItem value={1}>Admin</MenuItem> */}
                    <MenuItem value={2}>Psychologist</MenuItem>
                    <MenuItem value={3}>User</MenuItem>
                    <MenuItem value={4}>Content Creator</MenuItem>
                    <MenuItem value={5}>Test Designer</MenuItem>
                </Select>
            </FormControl>

            <Box my={2}>
                <InputLabel>Avatar (optional)</InputLabel>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => formik.setFieldValue('avatar', e.target.files[0])}
                />
            </Box>

            {(formik.values.roleId === 2 ||
                formik.values.roleId === 4 ||
                formik.values.roleId === 5) && (
                    <Box my={2}>
                        <InputLabel>Certificates (1–5 files)</InputLabel>
                        <input
                            type="file"
                            accept=".pdf,image/*"
                            multiple
                            onChange={(e) =>
                                formik.setFieldValue('certificates', e.target.files)
                            }
                        />
                    </Box>
                )}

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
                fullWidth
                sx={{ mt: 2 }}
            >
                Register
            </Button>
        </form>
    );
};

export default RegisterForm;
