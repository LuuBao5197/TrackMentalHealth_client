import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { showAlert } from '../showAlert';

function GroupModal({ show, onClose, onSubmit, initialData = {} }) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        des: '',
        maxMember: '',
        avtPreview: '',
        file: null
    });

    // Load dữ liệu ban đầu (chế độ edit)
    useEffect(() => {
        const safeData = initialData || {};
        setFormData({
            name: safeData.name || '',
            des: safeData.des || '',
            maxMember: safeData.maxMember || '',
            avtPreview: safeData.avt || '', // hiển thị avt cũ nếu có
            file: null                       // khi edit không auto chọn file
        });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name) {
            return showAlert("Group name is required", "warning");
        }

        if (!initialData?.id && formData.maxMember <= 1) {
            return showAlert("Max members must be greater than 1", "warning");
        }

        const payload = {
            name: formData.name,
            des: formData.des,
            maxMember: parseInt(formData.maxMember, 10),
            file: formData.file // gửi file thật cho cha để upload
        };

        onSubmit(payload);
    };

    return (
        <Modal show={show} onHide={onClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{initialData?.id ? "Edit Group" : "Add New Group"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter group name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            name="des"
                            value={formData.des}
                            onChange={handleChange}
                            placeholder="Enter description"
                        />
                    </Form.Group>

                    {!initialData?.id && (
                        <Form.Group className="mb-3">
                            <Form.Label>Max Members</Form.Label>
                            <Form.Control
                                name="maxMember"
                                type="number"
                                min="1"
                                value={formData.maxMember}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3">
                        <Form.Label>Avatar</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setFormData(prev => ({
                                        ...prev,
                                        file,
                                        avtPreview: URL.createObjectURL(file)
                                    }));
                                }
                            }}
                        />
                        {formData.avtPreview && (
                            <img
                                src={formData.avtPreview}
                                alt="Avatar Preview"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    marginTop: "10px",
                                    objectFit: "cover",
                                    borderRadius: "50%"
                                }}
                            />
                        )}
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                        </>
                    ) : (
                        initialData?.id ? "Update" : "Create"
                    )}
                </Button>

            </Modal.Footer>
        </Modal>
    );
}

export default GroupModal;
