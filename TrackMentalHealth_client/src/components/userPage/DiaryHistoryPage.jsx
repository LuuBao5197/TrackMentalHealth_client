import React, { useEffect, useState } from 'react';
import { getDiaries, updateDiary } from '../../api/diaryAPI';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const DiaryHistoryPage = () => {
  const [diaries, setDiaries] = useState([]);
  const [editingDiary, setEditingDiary] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDiaries();
        setDiaries(res.data);
      } catch (err) {
        console.error(err);
        alert('Không thể tải nhật ký');
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (diary) => {
    const diaryDate = new Date(diary.date);
    const today = new Date();

    const isSameDay =
      diaryDate.getFullYear() === today.getFullYear() &&
      diaryDate.getMonth() === today.getMonth() &&
      diaryDate.getDate() === today.getDate();

    if (!isSameDay) {
      alert('Chỉ được phép chỉnh sửa nhật ký trong ngày hôm nay.');
      return;
    }

    setEditingDiary(diary);
    setUpdatedContent(diary.content);
  };


  const handleSave = async () => {
    try {
      await updateDiary(editingDiary.id, { ...editingDiary, content: updatedContent });
      alert('Cập nhật thành công');

      // Cập nhật lại danh sách sau khi sửa
      setDiaries(diaries.map(d => d.id === editingDiary.id ? { ...d, content: updatedContent } : d));

      // Đóng modal
      setEditingDiary(null);
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Lịch sử nhật ký</h2>
      {diaries.length === 0 ? (
        <p>Chưa có nhật ký nào.</p>
      ) : (
        <ul className="list-group">
          {diaries.map((diary) => {
            const diaryDate = new Date(diary.date);
            const today = new Date();

            const isSameDay =
              diaryDate.getFullYear() === today.getFullYear() &&
              diaryDate.getMonth() === today.getMonth() &&
              diaryDate.getDate() === today.getDate();

            return (
              <li className="list-group-item" key={diary.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>{diary.date}</span>
                  {isSameDay && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleEditClick(diary)}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
                <p className="mt-2 mb-0">{diary.content.substring(0, 100)}...</p>
              </li>
            );
          })}

        </ul>
      )}

      {/* Modal chỉnh sửa */}
      {editingDiary && (
        <Modal show onHide={() => setEditingDiary(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Chỉnh sửa nhật ký</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea
              className="form-control"
              rows="6"
              value={updatedContent}
              onChange={(e) => setUpdatedContent(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingDiary(null)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DiaryHistoryPage;
