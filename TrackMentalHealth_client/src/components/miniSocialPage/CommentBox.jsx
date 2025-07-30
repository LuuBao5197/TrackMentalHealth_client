import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './CommentBox.css';
import { showAlert } from '../../utils/showAlert';


function CommentBox({ postId, commentLists }) {
  const [comments, setComments] = useState(commentLists || []);
  const [text, setText] = useState('');
  const userInfo = useSelector(state => state.auth.user);
  const userID = userInfo?.userId;

  useEffect(() => {
    axios.get(`http://localhost:9999/api/community/post/${postId}/comments`)
      .then(res => setComments(res.data))
      .catch(console.error);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      post: { id: postId },
      user: { id: userID },
      content: text
    };

    try {
      const res = await axios.post(`http://localhost:9999/api/community/post/comment/`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setComments(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error('Error gửi bình luận:', err.response?.data || err.message);
      alert('Gửi bình luận thất bại');
    }
  };

  const handleRemove = async (commentId) => {
    try {
      console.log(commentId);
      await axios.delete(`http://localhost:9999/api/community/post/comment/${commentId}`);
      showAlert("Xoa binh luan thanh cong")
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      showAlert('Xóa bình luận thất bại:'+err, "error");
    }
  };

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Viết bình luận..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Gửi</button>
        </div>
      </form>

      <div className="comment-list">
        {comments.map((c, idx) => (
          <div key={idx} className="d-flex align-items-start mb-2 comment-item">
            {/* {console.log(c)} */}
            <img
              src={c.user?.avatar || '/default-avatar.png'}
              alt="avatar"
              className="rounded-circle me-2"
              style={{ width: '45px', height: '45px', objectFit: 'cover' }}
            />
            <div className="bg-light rounded p-2 flex-grow-1 position-relative">
              <strong className="d-block">{c.user?.username || 'Ẩn danh'}</strong>
              <span>{c.content}</span>
              {c.user?.id === userID && (
                <button
                  onClick={() => handleRemove(c.id)}
                  className="btn btn-sm btn-link text-danger position-absolute end-0 top-0"
                  title="Xóa bình luận"
                >
                  ❌
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentBox;
