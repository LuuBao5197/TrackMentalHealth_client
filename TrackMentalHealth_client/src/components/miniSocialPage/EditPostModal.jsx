import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import getCroppedImg from '../../utils/handleImage/cropImage';
import { showAlert } from '../../utils/showAlert';
import axios from 'axios';

const filters = [
  { name: 'None', value: 'none' },
  { name: 'Grayscale', value: 'grayscale(1)' },
  { name: 'Sepia', value: 'sepia(1)' },
  { name: 'Brightness', value: 'brightness(1.5)' },
  { name: 'Contrast', value: 'contrast(1.5)' },
];

function EditPostModalForm({ show, onClose, postData, onPostUpdated }) {
  const [content, setContent] = useState('');
  const [oldImages, setOldImages] = useState([]); // URL ảnh cũ
  const [deletedOldImages, setDeletedOldImages] = useState([]);

  const [rawImages, setRawImages] = useState([]); // blob url của ảnh mới
  const [croppedImages, setCroppedImages] = useState([]); // data url preview
  const [currentIndex, setCurrentIndex] = useState(0);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [filter, setFilter] = useState('none');
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (postData) {
      setContent(postData.content || '');
      setOldImages(postData.mediaList || []);
      setIsAnonymous(postData.isAnonymous || false);
    }
  }, [postData]);

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
      if (file.size > 2 * 1024 * 1024) {
        setError('Ảnh phải nhỏ hơn 2MB.');
        return;
      }
      validFiles.push(URL.createObjectURL(file));
    }

    const totalImages = oldImages.length - deletedOldImages.length + rawImages.length + validFiles.length;
    if (totalImages > 3) {
      setError('Tổng cộng chỉ được tối đa 3 ảnh.');
      return;
    }

    setError('');
    setRawImages(prev => [...prev, ...validFiles]);
    setCurrentIndex(oldImages.length - deletedOldImages.length + rawImages.length); // sang ảnh mới
  };

  const handleCrop = async () => {
    try {
      const cropped = await getCroppedImg(rawImages[currentIndex - (oldImages.length - deletedOldImages.length)], croppedAreaPixels, filter);
      const updated = [...croppedImages];
      updated[currentIndex - (oldImages.length - deletedOldImages.length)] = cropped;
      setCroppedImages(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const removeImage = (index) => {
    if (index < oldImages.length - deletedOldImages.length) {
      const removedUrl = oldImages[index];
      setDeletedOldImages([...deletedOldImages, removedUrl]);
    } else {
      const idx = index - (oldImages.length - deletedOldImages.length);
      const newRaw = [...rawImages];
      const newCrop = [...croppedImages];
      newRaw.splice(idx, 1);
      newCrop.splice(idx, 1);
      setRawImages(newRaw);
      setCroppedImages(newCrop);
    }

    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleUpdate = async () => {
    const totalImages = oldImages.length - deletedOldImages.length + croppedImages.length;
    if (!content && totalImages === 0) {
      setError('Vui lòng nhập nội dung hoặc chọn ít nhất 1 ảnh.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('isAnonymous', isAnonymous);
      formData.append('userId', postData.userID); // cần truyền userId
      // Note: postId đang nằm trong URL => không cần append

      // 1. Gửi danh sách URL ảnh cũ còn giữ lại (oldUrlsToKeep)
      const urlsToKeep = oldImages
        .filter(img => !deletedOldImages.includes(img))
        .map(media => media.mediaUrl);

      urlsToKeep.forEach(url => {
        formData.append('oldUrlsToKeep', url);
      });

      // 2. Gửi ảnh mới đã crop
      for (let i = 0; i < croppedImages.length; i++) {
        const response = await fetch(croppedImages[i]);
        const blob = await response.blob();
        const file = new File([blob], `new_image_${i}.jpg`, { type: blob.type });
        formData.append('images', file); // key = "images" theo API
      }

      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ':', pair[1]);
      // }
      // return;

      await axios.put(
        `http://localhost:9999/api/community/post/${postData.id}`, // ✅ đúng format API
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      showAlert('Cập nhật bài viết thành công');
      onClose();
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showAlert('Cập nhật thất bại', 'error');
    }
  };


  const allCurrentImages = [...oldImages.filter(img => !deletedOldImages.includes(img)), ...rawImages];

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa bài viết</Modal.Title>
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
            label="Ẩn danh"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Chọn ảnh mới</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleImageChange} />
        </Form.Group>
        {oldImages.filter(img => !deletedOldImages.includes(img)).length > 0 && (
          <div className="mb-3">
            <strong>Ảnh cũ</strong>
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {oldImages
                .filter(img => !deletedOldImages.includes(img))
                .map((url, index) => (
                  <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={url.mediaUrl}
                      alt={`old-${index}`}
                      className="rounded border"
                      style={{ width: 120, height: 90, objectFit: 'cover' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setDeletedOldImages(prev => [...prev, url]);
                        // cập nhật currentIndex nếu cần
                        setCurrentIndex(prev => Math.max(0, prev - 1));
                      }}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}


        {allCurrentImages.length > 0 && (
          <>
            <div className="mb-2">
              <strong>Đang chỉnh ảnh {currentIndex + 1} / {allCurrentImages.length}</strong>
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-3"
                onClick={() => removeImage(currentIndex)}
              >
                Xoá ảnh này
              </Button>
            </div>

            {currentIndex >= oldImages.length - deletedOldImages.length && (
              <div className="crop-container mb-3">
                <Cropper
                  image={rawImages[currentIndex - (oldImages.length - deletedOldImages.length)]}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
                  cropShape="rect"
                  showGrid
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { height: 300, position: 'relative' },
                    mediaStyle: { filter },
                  }}
                />
                <div className="d-flex gap-2 mt-2 align-items-center">
                  <Form.Range min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
                  <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {filters.map((f) => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </Form.Select>
                  <Button variant="success" size="sm" onClick={handleCrop}>Áp dụng</Button>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between mt-5">
              <Button
                variant="outline-secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(currentIndex - 1)}
              >
                ← Trước
              </Button>
              <Button
                variant="outline-secondary"
                disabled={currentIndex === allCurrentImages.length - 1}
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                Tiếp →
              </Button>
            </div>
          </>
        )}

        {croppedImages.length > 0 && (
          <div className="preview-container text-center mt-4">
            <strong>Ảnh mới đã xử lý</strong>
            <div className="d-flex gap-2 mt-2 flex-wrap justify-content-center">
              {croppedImages.map((img, idx) => (
                <img key={idx} src={img} alt={`preview-${idx}`} className="rounded" style={{ maxHeight: 100, maxWidth: 150 }} />
              ))}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center gap-2">
        <Button variant="secondary" onClick={onClose}>Huỷ</Button>
        <Button variant="primary" onClick={handleUpdate}>Cập nhật</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditPostModalForm;
