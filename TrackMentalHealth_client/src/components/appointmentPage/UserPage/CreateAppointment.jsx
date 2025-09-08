import React, { useEffect, useState } from 'react';
import { getPsychologists, saveAppointment, saveNotification } from '../../../api/api';
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from '../../../utils/getCurrentUserID';
import { toast } from 'react-toastify';
import { NotDTO } from '../../../utils/dto/NotDTO';
import { useSelector } from 'react-redux';
import { showToast } from '../../../utils/showToast';
import { showAlert } from '../../../utils/showAlert';
import { title } from 'process';

function CreateAppointment() {

    const user = useSelector((state) => state.auth.user);
    const currentUserId = getCurrentUserId();
    const [psychologists, setPsychologists] = useState([]);
    const [selectedPsyUserId, setSelectedPsyUserId] = useState(null);

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

        if (name === "psychologist") {
            const selectedPsy = psychologists.find(p => p.id === parseInt(value));
            setFormData(prev => ({ ...prev, psychologist: value }));  // lưu id psychologist
            setSelectedPsyUserId(selectedPsy?.usersID?.id || null);   // lưu userId
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

    console.log(payload);

    try {
        await saveAppointment(payload);

        // Format timeStart cho notification
        const formattedTime = new Date(formData.timeStart).toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Gửi notification
        showToast("Appointment created!", 'success');
        const notificationToPsy = NotDTO(
            selectedPsyUserId, 
            `You have a new appointment invitation with ${user.sub} at ${formattedTime}`
        );

        await Promise.all([
            saveNotification(notificationToPsy)
        ]);

        nav(`/user/appointment/${currentUserId}`);
    } catch (error) {
        if (error.response?.status === 409 || error.message?.toLowerCase().includes('conflict')) {
            showAlert('An appointment already exists', 'warning');
        } else {
            showAlert('An error occurred while creating the appointment', 'error');
        }
    }
};





    return (
        <div className="container mt-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li
                        className="breadcrumb-item"
                        style={{ cursor: "pointer", color: "#038238ff" }}
                        onClick={() => nav("/user/chat/list")}
                    >
                        Chat
                    </li>
                    <li className="breadcrumb-item "
                        style={{ cursor: "pointer", color: "#038238ff" }}
                        onClick={() => nav(`/user/appointment/${currentUserId}`)}
                    >
                        My Appointment
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Create new appointment
                    </li>
                </ol>
            </nav>
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
                        <option value="">
                            <span className='text-danger'>Select Psychologist</span></option>
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
