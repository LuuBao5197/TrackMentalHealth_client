import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {
    deleteAppointment,
    getAppointmentByUserId,
} from '../../../api/api';
import { createReviewByAppointmentId } from '../../../api/api'; // api review
import { showAlert } from '../../../utils/showAlert';
import { showConfirm } from '../../../utils/showConfirm';
import { toast, ToastContainer } from 'react-toastify';
import Rating from 'react-rating-stars-component';
import { Modal, Button, Form } from 'react-bootstrap';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';

function Appointments() {
    const { userId } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Review modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const nav = useNavigate();

   const fetchAppointments = async () => {
    try {
        const res = await getAppointmentByUserId(userId);
        // Nếu API trả về object có field data, thì lấy data
        const data = Array.isArray(res) ? res : res?.data || [];
        setAppointments(data);
    } catch (err) {
        showAlert("Không thể tải lịch hẹn.", "error");
        setAppointments([]); // fallback để tránh lỗi filter
    } finally {
        setLoading(false);
    }
};


    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAdd = () => {
        nav(`/user/appointment/create/${userId}`);
    };

    const handleEdit = (id) => {
        nav(`/user/appointment/edit/${id}`);
    };

    const handleDelete = async (id) => {
        const confirm = await showConfirm("Are you sure?");
        if (confirm) {
            try {
                await deleteAppointment(id);
                toast.success('Delete appointment successfully');
                fetchAppointments();
            } catch (err) {
                showAlert("Lỗi khi xóa lịch hẹn.", "error");
            }
        }
    };

    // Mở modal review
    const handleDone = (appointment) => {
        setSelectedAppointment(appointment);
        setRating(0);
        setComment('');
        setShowReviewModal(true);
    };

    // Submit review
    const submitReview = async () => {
        if (rating === 0) {
            showAlert("Please provide rating", "warning");
            return;
        }
        setSubmitting(true);
        try {
            await createReviewByAppointmentId(selectedAppointment.id, {
                rating,
                comment,
                psychologistCode: selectedAppointment.psychologist?.id,
                user: { id: getCurrentUserId() }
            });
            toast.success("Review submitted successfully!");

            // Cập nhật state appointment để nút Done biến mất
            setAppointments(prev =>
                prev.map(a =>
                    a.id === selectedAppointment.id
                        ? { ...a, review: { rating, comment } }
                        : a
                )
            );

            setShowReviewModal(false);
        } catch (err) {
            showAlert("Error submitting review", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const renderTable = (data, title) => (
        <>
            <h5 className="mt-4">{title}</h5>
            <table className="table table-bordered table-hover mt-2">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Full name</th>
                        <th>Time Start</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.user?.fullname || 'Ẩn danh'}</td>
                            <td>{new Date(item.timeStart).toLocaleString()}</td>
                            <td>{item.note || 'Không có'}</td>
                            <td>
                                <span className={`badge ${item.status === 'PENDING' ? 'bg-warning text-dark' :
                                    item.status === 'ACCEPTED' ? 'bg-success' :
                                        item.status === 'DECLINED' ? 'bg-danger' : 'bg-secondary'
                                    }`}>
                                    {item.status}
                                </span>
                            </td>
                            <td>
                                {item.status === 'PENDING' ? (
                                    !item ? (
                                        <span className="text-muted">No data</span>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-sm btn-outline-warning me-1"
                                                onClick={() => handleEdit(item.id)}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </>
                                    )
                                ) : item.status === 'ACCEPTED' && !item.review ? (
                                    <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() => handleDone(item)}
                                    >
                                        Done
                                    </button>
                                ) : (
                                    <span className="text-muted">Processed</span>
                                )}
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    return (
        <div className="container mt-4">
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
                        Appointment
                    </li>
                </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-success">My Appointments</h2>
                <button className="btn btn-outline-success" onClick={handleAdd}>
                    <FaPlus /> Add new appointment
                </button>
            </div>

            {loading ? (
                <div className="text-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {renderTable(appointments.filter(a => a.status === 'PENDING'), 'Pending Appointments')}
                    {renderTable(appointments.filter(a => a.status !== 'PENDING'), 'Processed Appointments')}
                    {appointments.length === 0 && (
                        <p className="alert alert-danger text-center mt-4">No appointments yet.</p>
                    )}
                </>
            )}

            {/* Review Modal */}
            <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Rate Psychologist</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Rating</Form.Label>
                        <Rating
                            count={5}
                            size={30}
                            value={rating}
                            onChange={setRating}
                            activeColor="#ffd700"
                        />
                    </Form.Group>
                    <Form.Group className="mt-3">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Leave a comment"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReviewModal(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={submitReview} disabled={submitting}>
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="top-right" autoClose={3000} pauseOnFocusLoss={false} />
        </div>
    );
}

export default Appointments;
