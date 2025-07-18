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
    const [lessonDataFetched, setLessonDataFetched] = useState(null); // Lưu dữ liệu bài học gốc đã fetch

    const token = localStorage.getItem('token');
    let userId = null; // ID của người dùng đang đăng nhập

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.contentCreatorId;
        } catch (error) {
            console.error('❌ Token không hợp lệ:', error);
        }
    }

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            status: false,
            photo: '',
            // Không cần createdAt, updatedAt ở đây vì sẽ lấy từ lessonDataFetched
        },
        onSubmit: async (values) => {
            const now = new Date().toISOString(); // Thời điểm hiện tại cho updatedAt

            // Đảm bảo lessonDataFetched đã có dữ liệu để lấy createdAt gốc
            if (!lessonDataFetched) {
                alert('❌ Lỗi: Không thể lấy dữ liệu bài học gốc để cập nhật.');
                return;
            }

            const lessonToSubmit = {
                id: lessonId, // Bắt buộc phải có ID để backend biết đây là thao tác cập nhật
                title: values.title,
                description: values.description,
                status: values.status.toString(),
                photo: values.photo, // URL ảnh đại diện (có thể là ảnh cũ nếu không đổi, hoặc ảnh mới)
                
                // Lấy createdAt gốc từ dữ liệu đã fetch
                createdAt: lessonDataFetched.createdAt, 
                // Cập nhật updatedAt thành thời điểm hiện tại
                updatedAt: now, 
                // Giữ nguyên người tạo ban đầu (quan trọng!)
                createdBy: lessonDataFetched.createdBy, // HOẶC userId nếu bạn muốn cập nhật người sửa cuối cùng

                lessonSteps: steps.map((step, index) => {
                    // Lấy ID bước gốc nếu có để backend cập nhật đúng bước,
                    // nếu là bước mới thêm thì ID sẽ là undefined (hoặc null tùy backend)
                    const originalStep = lessonDataFetched.lessonSteps?.find(s => s.stepNumber === (index + 1));
                    return {
                        id: originalStep ? originalStep.id : null, // Gửi ID của bước nếu có (cho cập nhật)
                        stepNumber: index + 1,
                        title: step.title,
                        content: step.content,
                        mediaType: step.mediaType,
                        mediaUrl: step.mediaUrl,
                    };
                }),
            };

            console.log('🔍 Dữ liệu gửi đi để cập nhật bài học:', lessonToSubmit);

            try {
                // Sử dụng axios.put nếu API của bạn được thiết kế cho PUT để cập nhật
                // Nếu backend của bạn API save có thể xử lý cả tạo và cập nhật dựa trên ID (như bạn đang dùng),
                // thì axios.post cũng được, nhưng PUT thường rõ ràng hơn cho thao tác update.
                await axios.post('http://localhost:9999/api/lesson/save', lessonToSubmit); 
                alert('✅ Bài học đã được cập nhật!');
            } catch (error) {
                console.error('❌ Lỗi khi cập nhật:', error.response?.data || error.message);
                alert('❌ Có lỗi xảy ra khi cập nhật bài học.');
            }
        },
    });

    useEffect(() => {
        const fetchLesson = async () => {
            if (!lessonId) {
                // Nếu không có ID bài học, có thể chuyển hướng hoặc hiển thị thông báo
                navigate('/lessons'); 
                return;
            }
            try {
                const res = await axios.get(`http://localhost:9999/api/lesson/${lessonId}`);
                const fetchedLesson = res.data;

                // Gán dữ liệu vào formik
                formik.setValues({
                    title: fetchedLesson.title || '',
                    description: fetchedLesson.description || '',
                    status: fetchedLesson.status === 'true' || fetchedLesson.status === true,
                    photo: fetchedLesson.photo || '',
                    // KHÔNG cần set createdAt, updatedAt vào formik values
                });

                setLessonDataFetched(fetchedLesson); // LƯU TOÀN BỘ DỮ LIỆU GỐC ĐỂ LẤY createdAt
                setSteps(fetchedLesson.lessonSteps || []); // Cập nhật steps state
            } catch (err) {
                console.error('❌ Không thể tải dữ liệu bài học:', err.response?.data || err.message);
                alert('❌ Không thể tải dữ liệu bài học. Vui lòng kiểm tra ID hoặc kết nối.');
                navigate('/lessons'); 
            }
        };

        fetchLesson();
    }, [lessonId, navigate]); // Thêm navigate vào dependency array

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
                alert('Loại tệp không được hỗ trợ. Vui lòng chọn hình ảnh, video hoặc âm thanh.');
                setUploading(false);
                return;
            }

            if (stepIndex !== -1) {
                const updatedSteps = [...steps];
                updatedSteps[stepIndex].mediaUrl = url;
                updatedSteps[stepIndex].mediaType = detectedMediaType;
                setSteps(updatedSteps);
            } else {
                onSuccess(url); // Cập nhật formik value cho ảnh đại diện
            }
        } catch (err) {
            console.error('❌ Upload thất bại:', err.response?.data || err.message);
            alert('❌ Upload thất bại!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container my-5" style={{ maxWidth: '850px' }}>
            <div className="card shadow">
                <div className="card-body p-4">
                    <h2 className="mb-4 text-primary">
                        ✏️ {lessonId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
                    </h2>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Tiêu đề bài học</label>
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
                            <label htmlFor="description" className="form-label">Mô tả</label>
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
                            <label className="form-label">Ảnh đại diện bài học</label>
                            {/* Hiển thị ảnh hiện tại từ DB nếu có và chưa có ảnh mới được chọn */}
                            {lessonDataFetched?.photo && !formik.values.photo && (
                                <div className="mb-2">
                                    <strong>Ảnh hiện tại:</strong>
                                    <div className="mt-1">
                                        <img
                                            src={lessonDataFetched.photo}
                                            alt="Ảnh hiện tại"
                                            style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Hiển thị ảnh mới đã upload */}
                            {formik.values.photo && (
                                <div className="mb-2">
                                    <strong>Ảnh mới:</strong>
                                    <div className="mt-1">
                                        <img
                                            src={formik.values.photo}
                                            alt="Ảnh mới"
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
                                Kích hoạt bài học
                            </label>
                        </div>

                        <hr />
                        <h4 className="text-secondary mb-3">📚 Các Bước Học</h4>

                        {steps.map((step, index) => (
                            <div key={index} className="border rounded p-3 mb-4 bg-light">
                                <h5 className="mb-3">Bước {index + 1}</h5>

                                <div className="mb-2">
                                    <label htmlFor={`stepTitle-${index}`} className="form-label">Tiêu đề bước</label>
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
                                    <label htmlFor={`stepContent-${index}`} className="form-label">Nội dung bước</label>
                                    <textarea
                                        className="form-control"
                                        id={`stepContent-${index}`}
                                        value={step.content}
                                        onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                                        rows="5"
                                    />
                                </div>

                                <div className="row g-2">
                                    <div className="col-md-12">
                                        <label htmlFor={`stepMedia-${index}`} className="form-label">
                                            Tệp media ({step.mediaType ? step.mediaType.toUpperCase() : 'Chưa chọn'})
                                        </label>
                                        {/* Hiển thị media hiện tại từ DB nếu có và chưa có media mới được chọn */}
                                        {lessonDataFetched?.lessonSteps?.[index]?.mediaUrl && !step.mediaUrl && (
                                            <div className="mb-2">
                                                <strong>Media hiện tại:</strong>
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
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-outline-secondary mb-4"
                            onClick={addStep}
                        >
                            + Thêm bước học
                        </button>

                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading}
                            >
                                {uploading ? 'Đang tải lên...' : '💾 Lưu bài học'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditLesson;