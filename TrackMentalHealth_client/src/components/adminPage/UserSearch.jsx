import React, { useState } from 'react';
import { TextField, Button, List, ListItem, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserSearch = () => {
    const [keyword, setKeyword] = useState(''); 
    const [results, setResults] = useState([]);
    const navigate = useNavigate();

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:9999/api/users/search`, {
                params: { keyword },
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <TextField
                label="Search by email/fullname/username"
                variant="outlined"
                fullWidth
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
            />
            <Button onClick={handleSearch} variant="contained" color="primary" sx={{ mt: 2 }}>
                Search
            </Button>

            {results.length > 0 && (
                <List>
                    {results.map((user) => (
                        <ListItem
                            key={user.id}
                            button
                            onClick={() => navigate(`/user/${user.id}`)}
                        >
                            <Typography>{user.fullname} - {user.email}</Typography>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default UserSearch;
