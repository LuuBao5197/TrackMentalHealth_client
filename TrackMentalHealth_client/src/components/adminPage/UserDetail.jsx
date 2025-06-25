import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Avatar, Box, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); 

        axios.get(`http://localhost:9999/api/users/profile/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
            .then((res) => setUser(res.data))
            .catch((err) => console.error(err));
    }, [id]);

    if (!user) return <CircularProgress />;

    return (
        <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Box display="flex" alignItems="center" flexDirection="column">
                <Avatar src={user.avatar} sx={{ width: 100, height: 100, mb: 2 }} />
                <Typography variant="h5">{user.fullname}</Typography>
                <Typography variant="body1">Email: {user.email}</Typography>
                <Typography variant="body1">Username: {user.username}</Typography>
                <Typography variant="body1">Role: {user.role}</Typography>
                <Typography variant="body1">Gender: {user.gender}</Typography>
                <Typography variant="body1">DOB: {user.dob}</Typography>
                <Typography variant="body1">Address: {user.address}</Typography>
            </Box>
        </Paper>
    );
};

export default UserDetail;
