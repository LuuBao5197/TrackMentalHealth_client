import React, { useEffect, useState } from 'react';
import {
    Grid, Card, CardContent, Typography, Avatar, CircularProgress, Alert, TextField, Box
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const UserList = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('');

    const token = useSelector((state) => state.auth.token) || localStorage.getItem('token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:9999/api/users/by-role/${roleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(res.data);
                setFilteredUsers(res.data); // Ban đầu hiển thị tất cả
                setError(null);
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

    // Debounced live search
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (!keyword) {
                setFilteredUsers(users);
            } else {
                const lower = keyword.toLowerCase();
                const filtered = users.filter(
                    (u) =>
                        u.fullname?.toLowerCase().includes(lower) ||
                        u.email?.toLowerCase().includes(lower)
                );
                setFilteredUsers(filtered);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounce);
    }, [keyword, users]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <TextField
                label="Search by name or email"
                variant="outlined"
                fullWidth
                sx={{ mb: 3 }}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />

            <Grid container spacing={2}>
                {filteredUsers.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                        <Card
                            onClick={() => navigate(`/admin/users/profile/${user.id}`)}
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
        </Box>
    );
};

export default UserList;
