import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import getCroppedImg from '../../utils/handleImage/cropImage';
import './PostModalForm.css';
import axios from 'axios';
import { showAlert } from '../../utils/showAlert';
const filters = [
  { name: 'None', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(1)' },
  { name: 'Sepia', value: 'sepia(1)' },
  { name: 'Brightness', value: 'brightness(1.5)' },
  { name: 'Contrast', value: 'contrast(1.5)' },
];
// const handleClose = () => {
//   resetForm();``
//   onClose();
// };
function PostModalForm({ show, handleClose, onPostCreated, userID }) {
  const [content, setContent] = useState('');
  const [rawImages, setRawImages] = useState([]); // blob urls
  const [croppedImages, setCroppedImages] = useState([]); // preview urls
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [filter, setFilter] = useState('none');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    for (let file of files) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Chỉ chấp nhận ảnh JPG, JPEG, PNG.');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        setError('Ảnh phải nhỏ hơn 4MB.');
        return;
      }
      validFiles.push(URL.createObjectURL(file));
    }

    if (validFiles.length + rawImages.length > 3) {
      setError('Tối đa 3 ảnh!');
      return;
    }

    setError('');
    setRawImages([...rawImages, ...validFiles]);
    setCurrentIndex(rawImages.length); // chuyển sang ảnh mới
  };

  const handleCrop = async () => {
    try {
      const cropped = await getCroppedImg(rawImages[currentIndex], croppedAreaPixels, filter);
      const updated = [...croppedImages];
      updated[currentIndex] = cropped;
      setCroppedImages(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePost = async () => {
    if (!content && croppedImages.length === 0) {
      setError('Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isAnonymous', isAnonymous);
      formData.append('userId', userID); // số nguyên

      for (let i = 0; i < croppedImages.length; i++) {
        const response = await fetch(croppedImages[i]);
        const blob = await response.blob();
        const file = new File([blob], `image_${i}.jpg`, { type: blob.type });
        formData.append('images', file);
      }

      const res = await axios.post('http://localhost:9999/api/community/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      showAlert("Status đã được đăng thành công");
      resetForm();
      handleClose();
      onPostCreated;

    } catch (err) {
      console.log(err)
      showAlert(`Created fail because ${err.response.data.error}`, "error");
      setError('Đăng bài thất bại. Vui lòng thử lại.');
    }
  };

  const resetForm = () => {
    setContent('');
    setRawImages([]);
    setCroppedImages([]);
    setCurrentIndex(0);
    setZoom(1);
    setFilter('none');
    setError('');
    setIsAnonymous(false);
  };

  const removeImage = (index) => {
    const newRaw = [...rawImages];
    const newCrop = [...croppedImages];
    newRaw.splice(index, 1);
    newCrop.splice(index, 1);
    setRawImages(newRaw);
    setCroppedImages(newCrop);
    setCurrentIndex(Math.max(0, index - 1));
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Đăng bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Nội dung</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Đăng bài ẩn danh"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Chọn ảnh (tối đa 3)</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
        </Form.Group>

        {rawImages.length > 0 && (
          <>
            <div className="mb-2">
              <strong>Đang chỉnh ảnh {currentIndex + 1} / {rawImages.length}</strong>
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-3"
                onClick={() => removeImage(currentIndex)}
              >
                Xoá ảnh này
              </Button>
            </div>
            <div className="crop-container mb-3">
              <Cropper
                image={rawImages[currentIndex]}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: {
                    height: 300,
                    position: 'relative',
                  },
                  mediaStyle: {
                    filter,
                  },
                }}
              />
              <div className="d-flex gap-2 mt-2 align-items-center">
                <Form.Range
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  {filters.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="success" size="sm" onClick={handleCrop}>
                  Áp dụng
                </Button>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <Button
                  variant="outline-secondary"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  ← Trước
                </Button>
                <Button
                  variant="outline-secondary"
                  disabled={currentIndex === rawImages.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  Tiếp →
                </Button>
              </div>
            </div>
          </>
        )}

        {croppedImages.length > 0 && (
          <div className="preview-container text-center mb-3">
            <strong>Ảnh đã xử lý</strong>
            <div className="d-flex gap-2 mt-2 flex-wrap justify-content-center">
              {croppedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`preview-${idx}`}
                  className="rounded"
                  style={{ maxHeight: 100, maxWidth: 150 }}
                />
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center gap-2">
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handlePost} disabled={croppedImages.length === 0 && !content}>
          Đăng bài
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PostModalForm;
