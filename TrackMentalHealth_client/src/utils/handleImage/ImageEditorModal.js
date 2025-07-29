import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Form } from 'react-bootstrap';
import getCroppedImg from './utils/cropImage'; // bạn sẽ tạo hàm này bên dưới

function ImageEditorModal({ show, imageSrc, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [filter, setFilter] = useState('none');

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, filter);
    onSave(croppedBlob); // gọi lại cha với blob đã chỉnh
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa ảnh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ position: 'relative', height: 400 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="rect"
            style={{ containerStyle: { filter } }}
          />
        </div>
        <Form.Select
          className="mt-3"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="none">Không lọc màu</option>
          <option value="grayscale(1)">Grayscale</option>
          <option value="sepia(1)">Sepia</option>
          <option value="brightness(1.3)">Sáng hơn</option>
          <option value="contrast(1.5)">Tăng tương phản</option>
        </Form.Select>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>Lưu ảnh</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ImageEditorModal;
