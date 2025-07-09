import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Avatar,
    Paper,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useSelector } from 'react-redux';

const validationSchema = Yup.object({
    fullname: Yup.string().required('Full name is required'),
    address: Yup.string().required('Address is required'),
    dob: Yup.string().required('Date of birth is required'),
    gender: Yup.string().oneOf(['Male', 'Female'], 'Invalid gender').required('Gender is required'),
});

const EditProfile = () => {
    const user = useSelector((state) => state.auth.user);
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialValues, setInitialValues] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            alert("⚠️ Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.");
            return;
        }

        axios.get(`http://localhost:9999/api/users/profile/${user.userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                setInitialValues({
                    fullname: res.data.fullname || '',
                    address: res.data.address || '',
                    dob: res.data.dob || '',
                    gender: res.data.gender || '',
                    email: res.data.email || '',
                    role: res.data.role || '',
                });
                setPreview(res.data.avatar || null);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Load profile failed:", err);
                setLoading(false);
            });
    }, [user.userId, token]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: initialValues || {
            fullname: '',
            address: '',
            dob: '',
            gender: '',
            email: '',
            role: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            if (!token) {
                alert("⚠️ Không tìm thấy token. Vui lòng đăng nhập lại.");
                return;
            }

            const data = new FormData();
            data.append('fullname', values.fullname);
            data.append('address', values.address);
            data.append('dob', values.dob);
            data.append('gender', values.gender);
            if (avatar) {
                data.append('avatar', avatar);
            }

            try {
                const res = await axios.post('http://localhost:9999/api/users/edit-profile', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    }
                });
                alert(res.data.message || 'Profile updated!');
            } catch (err) {
                console.error("Update failed:", err.response?.data || err.message);
                alert("Update failed!");
            }
        }
    });

    const handleFileChange = (e) => {
        const file = e.currentTarget.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    if (loading || !initialValues) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 5 }} />;

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 5 }}>
            <Typography variant="h5" gutterBottom>Edit Profile</Typography>

            <Box component="form" onSubmit={formik.handleSubmit} encType="multipart/form-data">
                <Box display="flex" justifyContent="center" mb={3}>
                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                        <Avatar
                            src={preview}
                            sx={{
                                width: 100,
                                height: 100,
                                boxShadow: 3,
                                transition: '0.3s',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                        />
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileChange}
                        />
                    </label>
                </Box>

                <TextField
                    label="Full Name"
                    name="fullname"
                    value={formik.values.fullname}
                    onChange={formik.handleChange}
                    error={formik.touched.fullname && Boolean(formik.errors.fullname)}
                    helperText={formik.touched.fullname && formik.errors.fullname}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="Address"
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    error={formik.touched.address && Boolean(formik.errors.address)}
                    helperText={formik.touched.address && formik.errors.address}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    error={formik.touched.dob && Boolean(formik.errors.dob)}
                    helperText={formik.touched.dob && formik.errors.dob}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="Gender"
                    name="gender"
                    select
                    value={formik.values.gender}
                    onChange={formik.handleChange}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={formik.touched.gender && formik.errors.gender}
                    fullWidth
                    margin="normal"
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                </TextField>

                <TextField
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        readOnly: true,
                        sx: {
                            opacity: 0.6,
                            pointerEvents: 'none',
                        }
                    }}
                />

                <TextField
                    label="Role"
                    name="role"
                    value={formik.values.role}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        readOnly: true,
                        sx: {
                            opacity: 0.6,
                            pointerEvents: 'none',
                        }
                    }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Save Changes
                </Button>
            </Box>
        </Paper>
    );
};

export default EditProfile;
