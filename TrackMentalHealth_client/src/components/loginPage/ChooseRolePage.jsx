import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card, CardContent, Typography, Button, Grid, Box
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import CreateIcon from '@mui/icons-material/Create';

const roles = [
    { name: 'Psychologist', id: 2, icon: <PsychologyIcon fontSize="large" color="primary" /> },
    { name: 'Content Creator', id: 3, icon: <CreateIcon fontSize="large" sx={{ color: '#f57c00' }} /> },
    { name: 'Test Designer', id: 4, icon: <DesignServicesIcon fontSize="large" color="secondary" /> },
];

const ChooseRolePage = () => {
    const navigate = useNavigate();

    const handleSelectRole = (role) => {
        navigate(`/auth/roles-register?roleId=${role.id}`);
    };

    return (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Choose Your Role
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" mb={4}>
                Select the role that fits your expertise to continue registration.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
                {roles.map((role) => (
                    <Grid item key={role.id}>
                        <Card
                            sx={{
                                minWidth: 220,
                                minHeight: 220,
                                p: 2,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: 6,
                                },
                            }}
                            elevation={3}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box mb={1}>{role.icon}</Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {role.name}
                                </Typography>
                                <Button
                                    onClick={() => handleSelectRole(role)}
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 1, width: '100%' }}
                                >
                                    Select
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ChooseRolePage;
