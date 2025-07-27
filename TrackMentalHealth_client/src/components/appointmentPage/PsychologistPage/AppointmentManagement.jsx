import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import {
    getAppointmentById,
    getAppointmentsByPsyId,
    updateAppointment
} from '../../../api/api';
import { showAlert } from '../../../utils/showAlert';
import { showConfirm } from '../../../utils/showConfirm';

function AppointmentManagement() {
    const psychologistId = localStorage.getItem("currentUserId");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const nav = useNavigate();

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const fetchAppointments = async () => {
        try {
            const res = await getAppointmentsByPsyId(psychologistId);
            const sorted = res.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));

            const pending = sorted.filter(a => a.status === 'PENDING');
            const others = sorted.filter(a => a.status !== 'PENDING');
            setAppointments([...pending, ...others]);
        } catch (err) {
            setError("Failed to load appointments.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAccept = async (id) => {
        const confirmed = await showConfirm("Do you want to accept this appointment?");
        if (!confirmed) return;

        try {
            const appt = await getAppointmentById(id);
            appt.status = "ACCEPTED";
            await updateAppointment(appt.id, appt);
            showAlert("Appointment accepted!");
            fetchAppointments();
        } catch (err) {
            showAlert("Error accepting appointment!", "error");
        }
    };

    const handleDecline = async (id) => {
        const confirmed = await showConfirm("Are you sure you want to decline this appointment?");
        if (!confirmed) return;

        try {
            const appt = await getAppointmentById(id);
            appt.status = "DECLINED";
            await updateAppointment(appt.id, appt);
            showAlert("Appointment declined.");
            fetchAppointments();
        } catch (err) {
            showAlert("Error declining appointment!", "error");
        }
    };

    const renderStatusBadge = (status) => {
        let className = 'badge ';
        switch (status) {
            case 'ACCEPTED':
                className += 'bg-success';
                break;
            case 'DECLINED':
                className += 'bg-danger';
                break;
            case 'PENDING':
            default:
                className += 'bg-warning text-dark';
        }
        return <span className={className}>{status}</span>;
    };

    // Pagination logic
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = appointments.slice(startIndex, startIndex + itemsPerPage);

    const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-success">My Appointments</h2>
            </div>

            {loading && (
                <div className="d-flex justify-content-center align-items-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && appointments.length > 0 ? (
                <>
                    <table className="table table-hover table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Full Name</th>
                                <th>Time</th>
                                <th>Note</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>{item.user?.fullname || 'Anonymous'}</td>
                                    <td>{formatDateTime(item.timeStart)}</td>
                                    <td>{item.note || 'None'}</td>
                                    <td>{renderStatusBadge(item.status)}</td>
                                    <td>
                                        {item.status === "PENDING" ? (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-success me-2"
                                                    onClick={() => handleAccept(item.id)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDecline(item.id)}
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-muted fst-italic">Processed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <button
                            className="btn btn-outline-secondary"
                            disabled={currentPage === 1}
                            onClick={goToPrevPage}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            className="btn btn-outline-secondary"
                            disabled={currentPage === totalPages}
                            onClick={goToNextPage}
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                !loading && (
                    <p className="alert text-center mt-4 alert-danger">No appointments found.</p>
                )
            )}
        </div>
    );
}

export default AppointmentManagement;
