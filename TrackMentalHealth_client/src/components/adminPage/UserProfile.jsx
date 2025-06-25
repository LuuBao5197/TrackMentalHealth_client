import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const roles = [
    { id: 1, name: 'USER' },
    { id: 2, name: 'ADMIN' },
    { id: 3, name: 'CONTENT_CREATOR' },
    { id: 4, name: 'TEST_DESIGNER' },
    { id: 5, name: 'PSYCHOLOGIST' },
];

const UserProfile = () => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={3}>
            {roles.map((role) => (
                <Grid item xs={12} sm={6} md={4} key={role.id}>
                    <Card
                        onClick={() => navigate(`/admin/users/role/${role.id}`)}
                        sx={{ cursor: 'pointer', transition: '0.3s', '&:hover': { boxShadow: 6 } }}
                    >
                        <CardContent>
                            <Typography variant="h5" textAlign="center">
                                {role.name}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default UserProfile;
