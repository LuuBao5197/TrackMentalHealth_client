import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { getAppointmentById, getAppointmentByPsyId, updateAppointment, saveNotification } from '../../../api/api';
import { showAlert } from '../../../utils/showAlert';
import { showConfirm } from '../../../utils/showConfirm';
import { NotDTO } from '../../../utils/dto/NotDTO';
import { FaRedo } from 'react-icons/fa';
import { showToast } from '../../../utils/showToast';
import ReactStars from 'react-stars';

function AppointmentManagement() {
    const user = useSelector((state) => state.auth.user);
    const psychologistId = user.userId;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const itemsPerPage = 5;
    const nav = useNavigate();

    // Format thời gian
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

    // Fetch appointment
    const fetchAppointments = async () => {
        try {
            const res = await getAppointmentByPsyId(psychologistId);
            const data = Array.isArray(res) ? res : [];
            const sorted = [...data].sort(
                (a, b) => new Date(b.timeStart) - new Date(a.timeStart)
            );
            const pending = sorted.filter(a => a.status === "PENDING");
            const others = sorted.filter(a => a.status !== "PENDING");
            setAppointments([...pending, ...others]);
        } catch (err) {
            setError("Failed to load appointments.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Accept/Decline handlers
    const handleAccept = async (id) => {
        const confirmed = await showConfirm("Do you want to accept this appointment?");
        if (!confirmed) return;

        try {
            const appt = await getAppointmentById(id);
            appt.status = "ACCEPTED";
            await updateAppointment(appt.id, appt);

            const notificationToUser = NotDTO(appt.user.id, 'The expert has accepted your invitation.');
            await saveNotification(notificationToUser);

            showAlert("Appointment accepted!", 'success');
            fetchAppointments();
        } catch (err) {
            showAlert("Error accepting appointment!", "error");
            console.error(err);
        }
    };

    const handleDecline = async (id) => {
        const confirmed = await showConfirm("Are you sure you want to decline this appointment?");
        if (!confirmed) return;

        try {
            const appt = await getAppointmentById(id);
            appt.status = "DECLINED";
            await updateAppointment(appt.id, appt);

            const notificationToUser = NotDTO(appt.user.id, 'The expert has declined your invitation.');
            await saveNotification(notificationToUser);

            showAlert("Appointment declined.", 'error');
            fetchAppointments();
        } catch (err) {
            showAlert("Error declining appointment!", "error");
        }
    };

    // Status badge
    const renderStatusBadge = (status) => {
        let className = 'badge ';
        switch (status) {
            case 'ACCEPTED': className += 'bg-success'; break;
            case 'DECLINED': className += 'bg-danger'; break;
            case 'PENDING':
            default: className += 'bg-warning text-dark';
        }
        return <span className={className}>{status}</span>;
    };

    // Modal handlers
    const openReviewModal = (review) => {
        setSelectedReview(review);
        setShowReviewModal(true);
    };

    const closeReviewModal = () => {
        setSelectedReview(null);
        setShowReviewModal(false);
    };

    // Pagination logic
    const totalPages = Math.ceil(appointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = appointments.slice(startIndex, startIndex + itemsPerPage);

    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    return (
        <div className="container mt-4 mb-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li
                        className="breadcrumb-item"
                        style={{ cursor: "pointer", color: "#038238ff" }}
                        onClick={() => nav("/user/chat/list")}
                    >
                        Chat
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Appointment Management
                    </li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-success">My Appointments</h2>

                <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        fetchAppointments();
                        showToast("Appointments reset!", 'success');
                    }}
                >
                    <FaRedo className="me-1" /> Reset
                </button>
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
                                <th>Review</th>
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
                                        {item.review ? (
                                            <div className="d-flex align-items-center">
                                                {/* Hiển thị số sao tổng thể */}
                                                <ReactStars
                                                    count={5}                  // Luôn 5 sao
                                                    value={item.review.rating} // Số sao hiện tại
                                                    edit={false}
                                                    size={20}
                                                    activeColor="#ffd700"
                                                />
                                                {/* Nút mở modal chi tiết */}
                                                <button
                                                    className="btn btn-sm btn-outline-success ms-3"
                                                    onClick={() => openReviewModal(item.review)}
                                                >
                                                    View Detail
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-muted">No Review</span>
                                        )}
                                    </td>

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

            {/* Review Modal */}
            {showReviewModal && selectedReview && (
                <>
                    {/* Modal backdrop */}
                    <div className="modal-backdrop fade show"></div>

                    {/* Modal */}
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ overflowY: 'auto' }}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Review Details</h5>
                                    <button type="button" className="btn-close" onClick={closeReviewModal}></button>
                                </div>

                                <div className="modal-body">
                                    <div className="d-flex align-items-center mb-2">
                                        <strong className="me-2">Rating:</strong>
                                        <ReactStars
                                            count={5}
                                            value={selectedReview.rating}
                                            edit={false}
                                            size={24}
                                            activeColor="#ffd700"
                                        />
                                        <span className="ms-2">({selectedReview.rating}/5)</span>
                                    </div>

                                    <p><strong>Comment:</strong> {selectedReview.comment || 'No comment'}</p>
                                    <p><strong>Created At:</strong> {formatDateTime(selectedReview.createdAt)}</p>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeReviewModal}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}

export default AppointmentManagement;
