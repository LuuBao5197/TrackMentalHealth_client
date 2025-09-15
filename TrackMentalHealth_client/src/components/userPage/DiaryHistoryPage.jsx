import React, { useEffect, useState } from 'react';
import { getDiaries, updateDiary } from '../../api/diaryAPI';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/DiaryHistoryPage.css'; // 👉 Custom CSS for diary history

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
        alert('Unable to load diaries.');
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
      alert('You can only edit diaries from today.');
      return;
    }

    setEditingDiary(diary);
    setUpdatedContent(diary.content);
  };

  const handleSave = async () => {
    try {
      await updateDiary(editingDiary.id, { ...editingDiary, content: updatedContent });
      alert('✅ Update successful!');
      setDiaries(diaries.map(d => d.id === editingDiary.id ? { ...d, content: updatedContent } : d));
      setEditingDiary(null);
    } catch (err) {
      console.error(err);
      alert('❌ Update failed.');
    }
  };

  return (
    <div className="container py-5 diary-history">
      <h2 className="text-center text-primary mb-4">📖 Diary History</h2>

      {diaries.length === 0 ? (
        <p className="text-center text-muted">No diaries yet.</p>
      ) : (
        <div className="row g-4">
          {diaries.map((diary) => {
            const diaryDate = new Date(diary.date);
            const today = new Date();

            const isSameDay =
              diaryDate.getFullYear() === today.getFullYear() &&
              diaryDate.getMonth() === today.getMonth() &&
              diaryDate.getDate() === today.getDate();

            return (
              <div className="col-md-6" key={diary.id}>
                <div className="diary-card shadow-sm p-3 rounded position-relative">
                  <small className="text-muted">
                    {diaryDate.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </small>
                  {isSameDay && (
                    <button
                      className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 mt-2 me-2"
                      onClick={() => handleEditClick(diary)}
                    >
                      ✏️
                    </button>
                  )}
                  <p className="mt-2 mb-0 diary-content">
                    {diary.content.length > 120
                      ? `${diary.content.substring(0, 120)}...`
                      : diary.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingDiary && (
        <Modal show onHide={() => setEditingDiary(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>📝 Edit Diary</Modal.Title>
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
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DiaryHistoryPage;
