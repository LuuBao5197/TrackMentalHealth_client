import React, { useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const CreateLesson = () => {
  const [uploading, setUploading] = useState(false);

  // Giải mã token để lấy userId
  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Giả định token có chứa contentCreatorId hoặc một ID phù hợp
      userId = decoded.contentCreatorId;
    } catch (error) {
      console.error('❌ Token không hợp lệ:', error);
      // Xử lý lỗi token, ví dụ: chuyển hướng người dùng đến trang đăng nhập
    }
  }

  // State cho các bước của bài học
  const [steps, setSteps] = useState([
    // Khởi tạo một bước đầu tiên với mediaType và mediaUrl rỗng
    { title: '', content: '', mediaType: '', mediaUrl: '' },
  ]);

  // Formik để quản lý form chính của bài học
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: false,
      photo: '', // Ảnh đại diện của bài học
    },
    onSubmit: async (values) => {
      // Lấy thời gian hiện tại theo định dạng ISO 8601
      // Lưu ý: Tốt nhất là để backend tự động quản lý createdAt và updatedAt
      const now = new Date().toISOString(); 

      const lessonData = {
        title: values.title,
        description: values.description,
        photo: values.photo, // URL ảnh đại diện đã upload
        status: values.status.toString(), // Chuyển boolean sang string "true"/"false"
        createdBy: userId, // ID của người tạo từ token
        createdAt: now, // Thời gian tạo (từ frontend)
        updatedAt: now, // Thời gian cập nhật (từ frontend, có thể để backend xử lý)

        // Map các bước từ state để gửi lên server
        lessonSteps: steps.map((step, index) => ({
          stepNumber: index + 1, // Đảm bảo số thứ tự bước
          title: step.title,
          content: step.content,
          mediaType: step.mediaType, // Loại media đã tự động nhận diện
          mediaUrl: step.mediaUrl, // URL media đã upload
        })),
      };

      try {
        console.log("📦 Dữ liệu gửi lên:", lessonData);
        const response = await axios.post('http://localhost:9999/api/lesson/save', lessonData);
        console.log('✅ Tạo bài học thành công:', response.data);
        alert('✅ Tạo bài học thành công!');
        formik.resetForm(); // Reset form chính
        setSteps([{ title: '', content: '', mediaType: '', mediaUrl: '' }]); // Reset các bước
      } catch (error) {
        console.error('❌ Lỗi khi tạo bài học:', error.response?.data || error.message);
        alert('❌ Có lỗi xảy ra khi tạo bài học.');
      }
    },
  });

  // Hàm để cập nhật một trường của một bước cụ thể
  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index][field] = value;
    setSteps(updatedSteps);
  };

  // Hàm để thêm một bước học mới
  const addStep = () => {
    setSteps([...steps, { title: '', content: '', mediaType: '', mediaUrl: '' }]);
  };

  /**
   * Hàm xử lý upload file media lên server.
   *
   * @param {File} file - Tệp tin cần upload.
   * @param {number} [stepIndex=-1] - Chỉ số của bước nếu đang upload media cho một bước (-1 cho ảnh đại diện bài học).
   * @param {function} [onSuccessCallback=null] - Callback để gọi sau khi upload thành công cho ảnh đại diện bài học.
   */
  const handleUpload = async (file, stepIndex = -1, onSuccessCallback = null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true); // Bắt đầu trạng thái upload
    try {
      const res = await axios.post('http://localhost:9999/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.url; // Lấy URL từ phản hồi của server

      // Tự động nhận diện loại media dựa trên MIME type của file
      let detectedMediaType = '';
      if (file.type.startsWith('image/')) {
        detectedMediaType = 'photo';
      } else if (file.type.startsWith('video/')) {
        detectedMediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        detectedMediaType = 'audio';
      } else {
        // Thông báo nếu loại tệp không được hỗ trợ
        alert('Loại tệp không được hỗ trợ. Vui lòng chọn hình ảnh, video hoặc âm thanh.');
        setUploading(false);
        return;
      }

      if (stepIndex !== -1) {
        // Nếu đang upload cho một bước học cụ thể
        const updatedSteps = [...steps];
        updatedSteps[stepIndex].mediaUrl = url;
        updatedSteps[stepIndex].mediaType = detectedMediaType; // Cập nhật mediaType tự động
        setSteps(updatedSteps);
      } else if (onSuccessCallback) {
        // Nếu đang upload ảnh đại diện bài học
        onSuccessCallback(url);
      }

    } catch (err) {
      console.error('❌ Upload thất bại:', err.response?.data || err.message);
      alert('❌ Upload thất bại!');
    } finally {
      setUploading(false); // Kết thúc trạng thái upload
    }
  };


  return (
    <div className="container my-5" style={{ maxWidth: '850px' }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h2 className="mb-4 text-primary">📝 Tạo Bài Học Mới</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Tiêu đề bài học */}
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

            {/* Mô tả bài học */}
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

            {/* Ảnh đại diện bài học */}
            <div className="mb-3">
              <label htmlFor="lessonPhoto" className="form-label">Ảnh đại diện bài học</label>
              <input
                type="file"
                className="form-control"
                id="lessonPhoto"
                accept="image/*" // Chỉ chấp nhận ảnh
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Gọi handleUpload cho ảnh đại diện bài học (stepIndex = -1)
                    handleUpload(file, -1, (url) => formik.setFieldValue('photo', url));
                  }
                }}
              />
              {formik.values.photo && (
                <div className="mt-2 text-center">
                  <img
                    src={formik.values.photo}
                    alt="Ảnh đại diện"
                    style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            {/* Trạng thái bài học */}
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

            {/* Render danh sách các bước học */}
            {steps.map((step, index) => (
              <div key={index} className="border rounded p-3 mb-4 bg-light">
                <h5 className="mb-3">Bước {index + 1}</h5>

                {/* Tiêu đề bước */}
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

                {/* Nội dung bước */}
                <div className="mb-2">
                  <label htmlFor={`stepContent-${index}`} className="form-label">Nội dung bước</label>
                  <textarea
                    className="form-control"
                    id={`stepContent-${index}`}
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    rows="5"
                    placeholder="Nhập nội dung, có thể nhấn Enter để xuống dòng"
                  />
                </div>

                {/* Input Tệp Media cho Bước học (tự động nhận diện loại) */}
                <div className="row g-2">
                  <div className="col-md-12">
                    <label htmlFor={`stepMedia-${index}`} className="form-label">
                      Tệp media
                      {/* Hiển thị loại media đã tự động nhận diện */}
                      {step.mediaType && ` (${step.mediaType.toUpperCase()})`}
                      {!step.mediaType && ` (Chưa chọn)`}
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id={`stepMedia-${index}`}
                      accept="video/*,image/*,audio/*" // Chấp nhận tất cả các loại media
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Gọi handleUpload với chỉ số bước để cập nhật đúng step
                          handleUpload(file, index);
                        }
                      }}
                    />
                    {step.mediaUrl && (
                      <small className="text-muted d-block mt-1">
                        URL: {step.mediaUrl}
                      </small>
                    )}
                    {/* Hiển thị preview của media cho bước */}
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

            {/* Nút thêm bước */}
            <button
              type="button"
              className="btn btn-outline-secondary mb-4"
              onClick={addStep}
            >
              + Thêm bước học
            </button>

            {/* Nút tạo bài học */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={uploading}
            >
              {uploading ? '⏳ Đang upload...' : '🚀 Tạo bài học'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLesson;