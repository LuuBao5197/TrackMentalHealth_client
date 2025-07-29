import React, { useEffect, useState } from 'react';
import { getPsychologists, saveAppointment, saveNotification } from '../../../api/api';
import { useNavigate } from "react-router-dom";
import { showAlert } from '../../../utils/showAlert';
import { getCurrentUserId } from '../../../utils/getCurrentUserID';
import { toast } from 'react-toastify';
import { NotDTO } from '../../../utils/dto/NotDTO';
import { useSelector } from 'react-redux';

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

        try {
            await saveAppointment(payload);
            showAlert('Create appointment successfully', 'success');

            // Gửi notification
            const notificationToUser = NotDTO(currentUserId, 'New appointment created successfully');
            const notificationToPsy = NotDTO(selectedPsyUserId, `You have a new appointment invitation with ${user.sub} at ${formData.timeStart} `);

            await Promise.all([
                saveNotification(notificationToUser),
                saveNotification(notificationToPsy)
            ]);

            nav(`/user/appointment/${currentUserId}`);
        } catch (error) {
            console.error(error);
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
