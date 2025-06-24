import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import axios from "axios";
import {
    Table,
    TableHead,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Typography,
    Button,
    CircularProgress,
} from "@mui/material";

const PendingRegistrations = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = useSelector(state => state.auth.token) || localStorage.getItem('token');

    const roleMap = {
        1: "User",
        2: "Admin",
        3: "Content CreatorC",
        4: "Test Designer",
        5: "Psychologist",
    };

    const fetchPendingUsers = async () => {
        try {
            const response = await axios.get("http://localhost:9999/api/users/pending-registrations");
            setPendingUsers(response.data);
        } catch (error) {
            console.error("Error fetching pending users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (pendingId) => {
        try {
            await axios.post(
                `http://localhost:9999/api/users/approve/${pendingId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPendingUsers((prev) => prev.filter((user) => user.pendingId !== pendingId));
            alert("User approved successfully!");
        } catch (error) {
            console.error("Approve failed:", error);
            alert("Failed to approve user.");
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Paper sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom textAlign="center">
                Pending User Registrations
            </Typography>
            {pendingUsers.length === 0 ? (
                <Typography>No pending registrations.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Full Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Submitted At</TableCell>
                                <TableCell>Avatar</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingUsers.map((user) => (
                                <TableRow key={user.pendingId}>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{roleMap[user.roleId] || "Unknown"}</TableCell>
                                    <TableCell>{new Date(user.submittedAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="avatar" width={50} height={50} style={{ borderRadius: "50%" }} />
                                        ) : (
                                            "No avatar"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleApprove(user.pendingId)}
                                        >
                                            Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default PendingRegistrations;
