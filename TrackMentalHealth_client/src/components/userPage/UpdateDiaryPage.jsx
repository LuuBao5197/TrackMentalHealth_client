// 📁 src/components/diary/UpdateDiaryPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateDiary, getDiaries } from '../../api/diaryAPI';

const UpdateDiaryPage = () => {
  const { id } = useParams();
  const [diary, setDiary] = useState(null);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await getDiaries();
        const found = res.data.find(d => d.id === parseInt(id));
        if (found) {
          setDiary(found);
          setContent(found.content);
        }
      } catch (err) {
        console.error(err);
        alert('Không thể tải nhật ký để chỉnh sửa');
      }
    };
    fetchDiary();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDiary(id, { ...diary, content });
      alert('Cập nhật thành công!');
      navigate('/history');
    } catch (err) {
      console.error(err);
      alert('Cập nhật thất bại');
    }
  };

  if (!diary) return <p>Đang tải...</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Cập nhật nhật ký</h2>
      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="8"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-success">Cập nhật</button>
      </form>
    </div>
  );
};

export default UpdateDiaryPage;
