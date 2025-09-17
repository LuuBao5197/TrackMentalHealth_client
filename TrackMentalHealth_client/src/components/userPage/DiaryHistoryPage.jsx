import React, { useEffect, useState } from 'react';
import { getDiaries, updateDiary } from '../../api/diaryAPI';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/DiaryHistoryPage.css';

const DiaryHistoryPage = () => {
  const [diaries, setDiaries] = useState([]);
  const [editingDiary, setEditingDiary] = useState(null);
  const [updatedContent, setUpdatedContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 🔹 Current page
  const diariesPerPage = 14; // 🔹 Number of diaries per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDiaries();
        setDiaries(res.data);
      } catch (err) {
        console.error(err);
        alert('Unable to load diaries');
      }
    };
    fetchData();
  }, []);

  // 🔹 Pagination calculation
  const indexOfLastDiary = currentPage * diariesPerPage;
  const indexOfFirstDiary = indexOfLastDiary - diariesPerPage;
  const currentDiaries = diaries.slice(indexOfFirstDiary, indexOfLastDiary);
  const totalPages = Math.ceil(diaries.length / diariesPerPage);

  const handleEditClick = (diary) => {
    const diaryDate = new Date(diary.date);
    const today = new Date();

    const isSameDay =
      diaryDate.getFullYear() === today.getFullYear() &&
      diaryDate.getMonth() === today.getMonth() &&
      diaryDate.getDate() === today.getDate();

    if (!isSameDay) {
      alert('You can only edit diaries created today.');
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
      alert('❌ Update failed');
    }
  };

  return (
    <div className="container py-5 diary-history">
      <h2 className="text-center text-primary mb-4">📖 Diary History</h2>

      {currentDiaries.length === 0 ? (
        <p className="text-center text-muted">No diaries available.</p>
      ) : (
        <div className="row g-4">
          {currentDiaries.map((diary) => {
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

      {/* 🔹 Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                  «
                </button>
              </li>

              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                  »
                </button>
              </li>
            </ul>
          </nav>
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
              Save changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DiaryHistoryPage;
