import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:9999/api/community/post/${postId}/comments`)
      .then(res => setComments(res.data))
      .catch(console.error);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) return alert("Bạn chưa đăng nhập");

    try {
      const payload = {
        postId,
        userId: user.id,
        content: text
      };
      await axios.post(`http://localhost:9999/api/community/post/${postId}/comment`, payload);
      setComments([...comments, { user: { id: user.id }, content: text }]);
      setText('');
    } catch (err) {
      alert('Gửi bình luận thất bại');
    }
  };

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-2">
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

      {comments.map((c, idx) => (
        <div key={idx} className="mb-1">
          <strong>User #{c.user?.id}:</strong> {c.content}
        </div>
      ))}
    </div>
  );
}

export default CommentBox;
