import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import {
    deleteAppointment,
    getAppointmentByUserId
} from '../../../api/api';
import { showAlert } from '../../../utils/showAlert';
import { showConfirm } from '../../../utils/showConfirm';
import { toast, ToastContainer } from 'react-toastify';

function Appointments() {
    const { userId } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const nav = useNavigate();

    // Pagination states
    const itemsPerPage = 5;
    const [pendingPage, setPendingPage] = useState(1);
    const [handledPage, setHandledPage] = useState(1);

    const fetchAppointments = async () => {
        try {
            const res = await getAppointmentByUserId(userId);
            setAppointments(res);
        } catch (err) {
            showAlert("Không thể tải lịch hẹn.", "error");
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

    const pending = appointments.filter(a => a.status === 'PENDING');
    const handled = appointments.filter(a => a.status !== 'PENDING');

    const paginate = (data, currentPage) => {
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    };

    const renderPagination = (data, currentPage, setPage) => {
        const totalPages = Math.ceil(data.length / itemsPerPage);
        if (totalPages <= 1) return null;

        return (
            <nav className="mt-2">
                <ul className="pagination justify-content-center">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setPage(i + 1)}>
                                {i + 1}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

    const renderTable = (data, title, currentPage, setPage) => (
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
                    {paginate(data, currentPage).map((item, index) => (
                        <tr key={item.id}>
                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
                                ) : (
                                    <span className="text-muted">Processed</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {renderPagination(data, currentPage, setPage)}
        </>
    );

    return (
        <div className="container mt-4">
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
                    {pending.length > 0 && renderTable(pending, 'Pending Appointments', pendingPage, setPendingPage)}
                    {handled.length > 0 && renderTable(handled, 'Processed Appointments', handledPage, setHandledPage)}
                    {pending.length === 0 && handled.length === 0 && (
                        <p className="alert alert-danger text-center mt-4">No appointments yet.</p>
                    )}
                </>
            )}


            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />

        </div>


    );
}

export default Appointments;
