import React, { useEffect, useState } from 'react';
import { getAppointmentById, getPsychologists, updateAppointment } from '../../../api/api';
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from '../../../utils/showAlert';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';
import { toast, ToastContainer } from 'react-toastify';

function UpdateAppointment() {

    const currentUserId = getCurrentUserId();
    const { appointmentid } = useParams();
    const [appointment, setAppointment] = useState({});
    const [psychologists, setPsychologists] = useState([]);
    const [formData, setFormData] = useState({
        timeStart: '',
        status: '',
        note: '',
        psychologist: ''
    });

    const nav = useNavigate();

    const fetchAppointment = async (id) => {
        try {
            const res = await getAppointmentById(id);
            setAppointment(res);
            setFormData({
                timeStart: res.timeStart,
                status: res.status,
                note: res.note,
                psychologist: res.psychologist?.id || ''
            });
        } catch (err) {
            console.error(err);
        }
    }

    const fetchPsychologists = async () => {
        try {
            const data = await getPsychologists();
            setPsychologists(data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchAppointment(appointmentid);
        fetchPsychologists();
    }, [appointmentid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                id: appointmentid, // hoặc res.id nếu cần
                timeStart: formData.timeStart,
                status: formData.status,
                note: formData.note,
                user: { id: currentUserId },
                psychologist: { id: parseInt(formData.psychologist) }
            };

            console.log("Payload gửi lên:", data);
            await updateAppointment(appointmentid, data);
            toast('Update appointment successfully');
            nav('/user/appointment/' + currentUserId);
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra khi cập nhật lịch hẹn.");
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Update Appointment</h2>
            <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-light">
                <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                        type="datetime-local"
                        name="timeStart"
                        value={formData.timeStart}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Note</label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        className="form-control"
                        rows="3"
                        placeholder="Enter your note here..."
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Psychologist</label>
                    <select
                        name="psychologist"
                        value={formData.psychologist}
                        onChange={handleChange}
                        className="form-select"
                        required
                        disabled={true}
                    >
                        <option value="">-- Select Psychologist --</option>
                        {psychologists.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.usersID.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Update Appointment
                </button>
            </form>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />

        </div>
    );
}

export default UpdateAppointment;
