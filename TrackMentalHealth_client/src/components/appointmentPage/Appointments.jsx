import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from "react-router-dom";
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { deleteAppointment, getAppointmentById, getAppointmentsByPsyId } from '../../api/api';
import { showAlert } from '../../utils/showAlert';
import { showConfirm } from '../../utils/showConfirm';

function Appointments() {
    const { userId } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const nav = useNavigate();


    const fetchAppointments = async () => {
        try {
            const res = await getAppointmentsByPsyId(userId);
            setAppointments(res);
        } catch (err) {
            setError("Không thể tải lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAdd = () => {
        nav(`/auth/appointment/create/${userId}`);
    };

    const handleEdit = (id) => {
       nav(`/auth/appointment/edit/${id}`);
    };

    const handleDelete = async (id) => {
        const confirm = await showConfirm("Are you sure you want to delete this appointment?");
        if (confirm) {
            deleteAppointment(id)
                .then(() => {
                    showAlert("Delete success", "success");
                    fetchAppointments(); // Gọi lại hàm fetch dữ liệu
                })
                .catch((error) => {
                    console.error("Lỗi khi xóa:", error);
                    showAlert("Đã xảy ra lỗi khi xóa", "error");
                });
        }
    };


    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-success">My Appointments</h2>
                <button className="btn btn-outline-success" onClick={handleAdd}>
                    <FaPlus /> Add new appointment
                </button>
            </div>

            {loading && (
                <div className="d-flex justify-content-center align-items-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && appointments.length > 0 ? (
                <table className="table table-hover table-bordered">
                    <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Full name</th>
                        <th>Time Start</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {appointments.map((item, index) => (
                        <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>{item.user?.fullname || 'Ẩn danh'}</td>
                            <td>{new Date(item.timeStart).toLocaleString()}</td>
                            <td>{item.note || 'Không có'}</td>
                            <td>{item.status}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEdit(item.id)}>
                                    <FaEdit /> Sửa
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>
                                    <FaTrash /> Xóa
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                !loading && <p className="alert text-center mt-4 alert-danger">No appointment yet.</p>
            )}

        </div>
    );
}

export default Appointments;
