import React, { useEffect, useState } from 'react';
import { getPsychologists, saveAppointment, saveNotification } from '../../../api/api';
import { useNavigate } from "react-router-dom";
import { showAlert } from '../../../utils/showAlert';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';
import { toast } from 'react-toastify';
import { createNotificationDTO } from '../../../utils/dto/createNotificationDTO';

function CreateAppointment() {

    const currentUserId = getCurrentUserId();
    const [psychologists, setPsychologists] = useState([]);
    const nav = useNavigate();

    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);
    };


    const [formData, setFormData] = useState({
        timeStart: getCurrentDateTimeLocal(),
        status: 'PENDING',
        note: '',
        user: '',
        psychologist: '',
    });


    useEffect(() => {
        const fetchPsychologists = async () => {
            try {
                const res = await getPsychologists();
                setPsychologists(res);
                console.log(res);
            } catch (err) {
                console.error(err);
            }
        }

        fetchPsychologists();
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
        timeStart: formData.timeStart,
        status: formData.status,
        note: formData.note,
        user: { id: currentUserId },
        psychologist: { id: parseInt(formData.psychologist) }
    };

    console.log("📦 Payload gửi lên:", payload);

    try {
        // 1. Gửi yêu cầu tạo cuộc hẹn
        await saveAppointment(payload);
        showAlert('Create appointment successfully', 'success');

        // 2. Gửi thông báo sau khi tạo lịch thành công
        const notificationDTO = createNotificationDTO(currentUserId);

        try {
            await saveNotification(notificationDTO);
            toast.success("Notification saved!");
        } catch (notiErr) {
            console.error("❌ Lỗi khi lưu notification:", notiErr);
            toast.error("Failed to save notification!");
        }

        // 3. Điều hướng về trang lịch hẹn
        nav(`/auth/appointment/${currentUserId}`);
    } catch (error) {
        if (error.response?.status === 409) {
            showAlert("Appointment is already created. Please try again later.", 'warning');
        } else {
            console.error("❌ Lỗi khi tạo lịch hẹn:", error);
            alert("Có lỗi xảy ra khi tạo lịch hẹn.");
        }
    }
};


    return (
        <div className="container mt-5">
            <h2 className="mb-4">Create Appointment</h2>
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
                        disabled={true}
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
                    >
                        <option value="">-- Select Psychologist --</option>
                        {psychologists.map(p => (
                            <option value={p.id}>
                                {p.usersID.fullname}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Create Appointment
                </button>
            </form>
        </div>
    );
}

export default CreateAppointment;
