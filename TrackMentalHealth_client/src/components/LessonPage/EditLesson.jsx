import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const EditLesson = () => {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const [steps, setSteps] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [lessonDataFetched, setLessonDataFetched] = useState(null);

    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.contentCreatorId;
        } catch (error) {
            console.error('❌ Invalid token:', error);
        }
    }

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: false,
            photo: '',
        },
        onSubmit: async (values) => {
            const now = new Date().toISOString();

            if (!lessonDataFetched) {
                alert('❌ Error: Failed to fetch the original lesson data.');
                return;
            }

            const lessonToSubmit = {
                id: lessonId,
                title: values.title,
                description: values.description,
                status: values.status.toString(),
                photo: values.photo,
                createdAt: lessonDataFetched.createdAt,
                updatedAt: now,
                createdBy: lessonDataFetched.createdBy,
                lessonSteps: steps.map((step, index) => {
                    const originalStep = lessonDataFetched.lessonSteps?.find(s => s.stepNumber === (index + 1));
                    return {
                        id: originalStep ? originalStep.id : null,
                        stepNumber: index + 1,
                        title: step.title,
                        content: step.content,
                        mediaType: step.mediaType,
                        mediaUrl: step.mediaUrl,
                    };
                }),
            };

            console.log('🔍 Data sent for lesson update:', lessonToSubmit);

            try {
                await axios.post('http://localhost:9999/api/lesson/save', lessonToSubmit);
                alert('✅ Lesson has been updated!');
            } catch (error) {
                console.error('❌ Error during update:', error.response?.data || error.message);
                alert('❌ An error occurred while updating the lesson.');
            }
        },
    });

    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId) {
                navigate('/lessons');
                return;
            }
            try {
                const res = await axios.get(`http://localhost:9999/api/lesson/${lessonId}`);
                const fetchedLesson = res.data;

                formik.setValues({
                    title: fetchedLesson.title || '',
                    description: fetchedLesson.description || '',
                    status: fetchedLesson.status === 'true' || fetchedLesson.status === true,
                    photo: fetchedLesson.photo || '',
                });

                setLessonDataFetched(fetchedLesson);
                setSteps(fetchedLesson.lessonSteps || []);
            } catch (err) {
                console.error('❌ Failed to load lesson data:', err.response?.data || err.message);
                alert('❌ Failed to load lesson data. Please check the ID or your connection.');
                navigate('/lessons');
            }
        };

        fetchLesson();
    }, [lessonId, navigate]);

    const handleStepChange = (index, field, value) => {
        const updatedSteps = [...steps];
        updatedSteps[index][field] = value;
        setSteps(updatedSteps);
    };

    const addStep = () => {
        setSteps([...steps, { title: '', content: '', mediaType: '', mediaUrl: '' }]);
    };

    const handleUpload = async (file, stepIndex = -1, onSuccess) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await axios.post('http://localhost:9999/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res.data.url;

            let detectedMediaType = '';
            if (file.type.startsWith('image/')) {
                detectedMediaType = 'photo';
            } else if (file.type.startsWith('video/')) {
                detectedMediaType = 'video';
            } else if (file.type.startsWith('audio/')) {
                detectedMediaType = 'audio';
            } else {
                alert('Unsupported file type. Please upload an image, video, or audio file.');
                setUploading(false);
                return;
            }

            if (stepIndex !== -1) {
                const updatedSteps = [...steps];
                updatedSteps[stepIndex].mediaUrl = url;
                updatedSteps[stepIndex].mediaType = detectedMediaType;
                setSteps(updatedSteps);
            } else {
                onSuccess(url);
            }
        } catch (err) {
            console.error('❌ Upload failed:', err.response?.data || err.message);
            alert('❌ Upload failed!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '850px' }}>
            <div className="card shadow">
                <div className="card-body p-4">
                    <h2 className="mb-4 text-primary">
                        ✏️ {lessonId ? 'Edit Lesson' : 'Create New Lesson'}
                    </h2>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Lesson Title</label>
                            <input
                                type="text"
                                className="form-control"
                                id="title"
                                name="title"
                                onChange={formik.handleChange}
                                value={formik.values.title}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="4"
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Lesson Cover Image</label>
                            {lessonDataFetched?.photo && !formik.values.photo && (
                                <div className="mb-2">
                                    <strong>Current Image:</strong>
                                    <div className="mt-1">
                                        <img
                                            src={lessonDataFetched.photo}
                                            alt="Current"
                                            style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {formik.values.photo && (
                                <div className="mb-2">
                                    <strong>New Image:</strong>
                                    <div className="mt-1">
                                        <img
                                            src={formik.values.photo}
                                            alt="New"
                                            style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                className="form-control mt-2"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        handleUpload(file, -1, (url) => formik.setFieldValue('photo', url));
                                    }
                                }}
                            />
                        </div>

                        <div className="form-check mb-4">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="statusCheck"
                                name="status"
                                onChange={formik.handleChange}
                                checked={formik.values.status}
                            />
                            <label className="form-check-label" htmlFor="statusCheck">
                                Activate Lesson
                            </label>
                        </div>

                        <hr />
                        <h4 className="text-secondary mb-3">📚 Lesson Steps</h4>

                        {steps.map((step, index) => (
                            <div key={index} className="border rounded p-3 mb-4 bg-light">
                                <h5 className="mb-3">Step {index + 1}</h5>

                                <div className="mb-2">
                                    <label htmlFor={`stepTitle-${index}`} className="form-label">Step Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id={`stepTitle-${index}`}
                                        value={step.title}
                                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor={`stepContent-${index}`} className="form-label">Step Content</label>
                                    <textarea
                                        className="form-control"
                                        id={`stepContent-${index}`}
                                        value={step.content}
                                        onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                                        rows="5"
                                    />
                                </div>

                                <div className="col-md-12">
                                    <label htmlFor={`stepMedia-${index}`} className="form-label">
                                        Media File ({step.mediaType ? step.mediaType.toUpperCase() : 'Not selected'})
                                    </label>
                                    {lessonDataFetched?.lessonSteps?.[index]?.mediaUrl && !step.mediaUrl && (
                                        <div className="mb-2">
                                            <strong>Current Media:</strong>
                                            <div className="mt-1 text-center">
                                                {lessonDataFetched.lessonSteps[index].mediaType === 'video' && (
                                                    <video controls src={lessonDataFetched.lessonSteps[index].mediaUrl} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
                                                )}
                                                {lessonDataFetched.lessonSteps[index].mediaType === 'audio' && (
                                                    <audio controls src={lessonDataFetched.lessonSteps[index].mediaUrl} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                                )}
                                                {lessonDataFetched.lessonSteps[index].mediaType === 'photo' && (
                                                    <img src={lessonDataFetched.lessonSteps[index].mediaUrl} alt="Current Media" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain' }} />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        className="form-control"
                                        id={`stepMedia-${index}`}
                                        accept="video/*,image/*,audio/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                handleUpload(file, index);
                                            }
                                        }}
                                    />
                                    {step.mediaUrl && (
                                        <small className="text-muted d-block mt-1">
                                            URL: {step.mediaUrl}
                                        </small>
                                    )}
                                    {step.mediaUrl && !uploading && (
                                        <div className="mt-2 text-center">
                                            {step.mediaType === 'video' && (
                                                <video controls src={step.mediaUrl} style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }} />
                                            )}
                                            {step.mediaType === 'audio' && (
                                                <audio controls src={step.mediaUrl} style={{ maxWidth: '100%', borderRadius: '8px' }} />
                                            )}
                                            {step.mediaType === 'photo' && (
                                                <img src={step.mediaUrl} alt="Media Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain' }} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-outline-secondary mb-4"
                            onClick={addStep}
                        >
                            + Add Step
                        </button>

                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : '💾 Save Lesson'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLesson;
