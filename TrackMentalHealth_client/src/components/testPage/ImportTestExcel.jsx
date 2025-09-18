import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import { Button, Spinner, Alert } from 'reactstrap';
import { useSelector } from 'react-redux';

const ImportTestExcel = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [messages, setMessages] = useState([]); // Danh sách thông báo
    const [messageType, setMessageType] = useState(''); // 'success' | 'danger'
    const userId = useSelector((state) => state.auth.user.userId);
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
        formData.append('userId',userId);

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

   const handleDownloadTemplate = async () => { // 1. Chuyển hàm thành async
        try {
            // 2. Dùng fetch để lấy file từ public folder
            // Lưu ý: Đường dẫn bắt đầu bằng '/' để trỏ tới gốc của public folder
            const response = await fetch('/TrackMentalHealth/TestTemplate.xlsx');

            // Báo lỗi nếu không tìm thấy file (ví dụ: lỗi 404)
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            // 3. Chuyển đổi kết quả trả về thành một Blob
            const blob = await response.blob();

            // 4. Dùng saveAs để lưu Blob, file sẽ không bị hỏng
            saveAs(blob, 'ImportTemplate.xlsx');

        } catch (error) {
            console.error('Error downloading template:', error);
            // Hiển thị thông báo lỗi cho người dùng nếu cần
            setMessages(['❌ Could not download the template file. Please check the file path.']);
            setMessageType('danger');
        }
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
