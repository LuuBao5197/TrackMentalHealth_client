import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { showAlert } from '../showAlert';

function GroupModal({ show, onClose, onSubmit, initialData = {} }) {
    const [formData, setFormData] = useState({
        name: '',
        des: '',
        maxMember: '',
        avt: ''
    });
    useEffect(() => {
        const safeData = initialData || {};
        setFormData({
            name: safeData.name || '',
            des: safeData.des || '',
            maxMember: safeData.maxMember || '',
            avt: safeData.avt || '',
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

        if (formData.maxMember <= 1) {
            return showAlert("Max members is must be greater than 1", "warning");
        }

        const payload = {
            ...formData,
            maxMember: parseInt(formData.maxMember, 10),
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
                                    const imageUrl = URL.createObjectURL(file);
                                    setFormData({ ...formData, avt: imageUrl });
                                }
                            }}
                        />
                        {formData.avt && (
                            <img
                                src={formData.avt}
                                alt="Avatar Preview"
                                style={{ width: "100px", height: "100px", marginTop: "10px", objectFit: "cover", borderRadius: "50%" }}
                            />
                        )}
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit}>
                    {initialData?.id ? "Update" : "Create"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default GroupModal;
