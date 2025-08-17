import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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

    const validate = (values) => {
        const errors = {};
        if (!values.title) errors.title = 'Title is required';
        if (!values.description) errors.description = 'Description is required';
        if (!values.photo) errors.photo = 'Cover photo is required';
        if (!values.category) errors.category = 'Category is required';

        steps.forEach((step, index) => {
            if (!step.title || !step.content) {
                errors[`step-${index}`] = 'Each step must have a title and content';
            }
        });

        return errors;
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: false,
            photo: '',
            category: '', // ✅ Added category field
        },
        validate,
        onSubmit: async (values) => {
            const now = new Date().toISOString();

            if (!lessonDataFetched) {
                Swal.fire('❌ Error', 'Failed to fetch the original lesson data.', 'error');
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
                category: values.category, // ✅ Include category
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
                Swal.fire('✅ Success', 'Lesson has been updated!', 'success');
                navigate('/contentCreator/lesson');
            } catch (error) {
                console.error('❌ Error during update:', error.response?.data || error.message);
                Swal.fire('❌ Error', 'An error occurred while updating the lesson.', 'error');
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
                    category: fetchedLesson.category || '', // ✅ Set category from fetched data
                });

                setLessonDataFetched(fetchedLesson);
                setSteps(fetchedLesson.lessonSteps || []);
            } catch (err) {
                console.error('❌ Failed to load lesson data:', err.response?.data || err.message);
                Swal.fire('❌ Error', 'Failed to load lesson data. Please check the ID or your connection.', 'error');
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

    const removeStep = (index) => {
        if (steps.length <= 1) {
            Swal.fire('⚠️ Cannot Remove', 'At least one step is required.', 'warning');
            return;
        }
        const updatedSteps = steps.filter((_, i) => i !== index);
        setSteps(updatedSteps);
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
                Swal.fire('❌ Error', 'Unsupported file type. Please upload an image, video, or audio file.', 'error');
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
            Swal.fire('❌ Error', 'Upload failed!', 'error');
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
                        {/* Title */}
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Lesson Title</label>
                            <input
                                type="text"
                                className={`form-control ${formik.errors.title ? 'is-invalid' : ''}`}
                                id="title"
                                name="title"
                                onChange={formik.handleChange}
                                value={formik.values.title}
                            />
                            {formik.errors.title && <div className="invalid-feedback">{formik.errors.title}</div>}
                        </div>

                        {/* Description */}
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                className={`form-control ${formik.errors.description ? 'is-invalid' : ''}`}
                                id="description"
                                name="description"
                                rows="4"
                                onChange={formik.handleChange}
                                value={formik.values.description}
                            />
                            {formik.errors.description && <div className="invalid-feedback">{formik.errors.description}</div>}
                        </div>

                        {/* Category */}
                        <div className="mb-3">
                            <label htmlFor="category" className="form-label">Lesson Category</label>
                            <select
                                className={`form-select ${formik.errors.category ? 'is-invalid' : ''}`}
                                id="category"
                                name="category"
                                value={formik.values.category}
                                onChange={formik.handleChange}
                            >
                                <option value="">-- Select Category --</option>
                                <option value="Emotional Skills">Emotional Skills</option>
                                <option value="Stress Management">Stress Management</option>
                                <option value="Self-Awareness">Self-Awareness</option>
                                <option value="Motivation">Motivation</option>
                            </select>
                            {formik.errors.category && <div className="invalid-feedback">{formik.errors.category}</div>}
                        </div>

                        {/* Photo */}
                        <div className="mb-3">
                            <label htmlFor="lessonPhoto" className="form-label">Thumbnail Image <span className="text-danger">*</span></label>
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
                                className={`form-control ${formik.errors.photo ? 'is-invalid' : ''}`}
                                id="lessonPhoto"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        handleUpload(file, -1, (url) => formik.setFieldValue('photo', url));
                                    } else {
                                        formik.setFieldValue('photo', '');
                                    }
                                }}
                            />
                            {formik.errors.photo && <div className="invalid-feedback">{formik.errors.photo}</div>}
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
                                        className={`form-control ${!step.title && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                                        id={`stepTitle-${index}`}
                                        value={step.title}
                                        onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                                    />
                                </div>

                                <div className="mb-2">
                                    <label htmlFor={`stepContent-${index}`} className="form-label">Step Content</label>
                                    <textarea
                                        className={`form-control ${!step.content && formik.submitCount > 0 ? 'is-invalid' : ''}`}
                                        id={`stepContent-${index}`}
                                        value={step.content}
                                        onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                                        rows="5"
                                    />
                                </div>

                                <div className="mb-2">
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

                                    {step.mediaUrl && (
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

                                    <input
                                        type="file"
                                        className="form-control"
                                        id={`stepMedia-${index}`}
                                        accept="video/*,image/*,audio/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                handleUpload(file, index);
                                            } else {
                                                handleStepChange(index, 'mediaType', '');
                                                handleStepChange(index, 'mediaUrl', '');
                                            }
                                        }}
                                    />
                                    {step.mediaUrl && (
                                        <small className="text-muted d-block mt-1">
                                            URL: {step.mediaUrl}
                                        </small>
                                    )}
                                </div>

                                {steps.length > 1 && (
                                    <div className="text-end mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeStep(index)}
                                        >
                                            ❌ Remove this step
                                        </button>
                                    </div>
                                )}
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
                                {uploading ? '⏳ Uploading...' : '💾 Save Lesson'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLesson;