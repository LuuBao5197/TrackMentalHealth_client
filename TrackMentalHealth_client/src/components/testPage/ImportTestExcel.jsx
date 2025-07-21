import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import { Button, Spinner, Alert } from 'reactstrap';

const ImportTestExcel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState([]); // Danh sách thông báo
    const [messageType, setMessageType] = useState(''); // 'success' | 'danger'

    const onDrop = useCallback((acceptedFiles) => {
        const excelFile = acceptedFiles.find(file =>
            file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        );
        if (excelFile) {
            setFile(excelFile);
            setMessages([]);
        } else {
            setMessages(['Only Excel files are allowed (.xlsx, .xls)']);
            setMessageType('danger');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        }
    });

    const handleUpload = async () => {
        if (!file) {
            setMessages(['Please select an Excel file to upload.']);
            setMessageType('danger');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const response = await axios.post('http://localhost:9999/api/test/import-test', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessages(['✅ Import successful!']);
            setMessageType('success');
            setFile(null);
        } catch (error) {
            console.error("error:", error);
            const errData = error.response?.data;

            if (Array.isArray(errData)) {
                setMessages(errData);
            } else if (typeof errData === 'string') {
                try {
                    const parsed = JSON.parse(errData);
                    if (Array.isArray(parsed)) {
                        setMessages(parsed);
                    } else {
                        setMessages([parsed.toString()]);
                    }
                } catch {
                    setMessages([errData]);
                }
            } else if (errData?.message) {
                setMessages([errData.message]);
            } else {
                setMessages(['❌ Import failed.']);
            }

            setMessageType('danger');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        // Giả định file mẫu có sẵn ở public/TrackMentalHealth/TestTemplate.xlsx
        const fileUrl = 'TrackMentalHealth/TestTemplate';
        saveAs(fileUrl, 'import-template.xlsx');
    };

    return (
        <div className="container mt-4">
            <h3>Import Test via Excel</h3>

            <div {...getRootProps()} className="border p-4 mb-3 text-center" style={{ background: '#f9f9f9', cursor: 'pointer' }}>
                <input {...getInputProps()} />
                {
                    isDragActive
                        ? <p>Drop the Excel file here...</p>
                        : <p>Drag & drop Excel file here, or click to select</p>
                }
                {file && <p><strong>Selected:</strong> {file.name}</p>}
            </div>

            {messages.length > 0 && (
                <Alert color={messageType}>
                    <ul className="mb-0">
                        {messages.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                </Alert>
            )}

            <div className="d-flex gap-2">
                <Button color="secondary" onClick={handleDownloadTemplate}>
                    📥 Download Template
                </Button>

                <Button color="primary" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <Spinner size="sm" /> : '📤 Upload Excel'}
                </Button>
            </div>
        </div>
    );
};

export default ImportTestExcel;
