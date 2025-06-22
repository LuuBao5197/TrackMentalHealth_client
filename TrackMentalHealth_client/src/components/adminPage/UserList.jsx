import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Avatar, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const UserList = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = useSelector((state) => state.auth.token) || localStorage.getItem('token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:9999/api/users/by-role/${roleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
                setError(null);
                console.log('Token:', token);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        if (token && roleId) {
            fetchUsers();
        }
    }, [roleId, token]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Grid container spacing={2}>
            {users.map((user) => (
                <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <Card
                        onClick={() => navigate(`/admin/users/detail/${user.id}`)}
                        sx={{ cursor: 'pointer' }}
                    >
                        <CardContent>
                            <Avatar
                                src={user.avatar}
                                alt={user.fullname}
                                sx={{ width: 64, height: 64, mb: 1 }}
                            />
                            <Typography variant="h6">{user.fullname}</Typography>
                            <Typography variant="body2">{user.email}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default UserList;
