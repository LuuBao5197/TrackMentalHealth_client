import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { BsBell } from 'react-icons/bs';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [posting, setPosting] = useState(false);

  // 🔐 Lấy userId từ JWT
  const token = localStorage.getItem('token');
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (e) {
      console.error('❌ Token không hợp lệ:', e);
    }
  }

  // 📥 Load chi tiết bài viết
  useEffect(() => {
    axios.get(`http://localhost:9999/api/article/${id}`)
      .then(res => setArticle(res.data))
      .catch(err => console.error('Lỗi khi tải chi tiết bài viết:', err));
  }, [id]);

  // 💬 Load comment
  useEffect(() => {
    axios.get(`http://localhost:9999/api/article/${id}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error('❌ Lỗi khi tải comment:', err));
  }, [id]);

  // 📝 Gửi comment
  const handlePostComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setPosting(true);
      await axios.post(`http://localhost:9999/api/article/${id}/comments`, {
        content: commentContent,
        userId: userId
      });
      setCommentContent('');
      // Load lại comment sau khi gửi
      const res = await axios.get(`http://localhost:9999/api/article/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('❌ Lỗi khi gửi comment:', error.response?.data || error.message);
    } finally {
      setPosting(false);
    }
  };

  if (!article) return <p className="text-center p-4 fs-5">Đang tải chi tiết bài viết...</p>;

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <div className="badge-wrapper mb-3">
              <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
                <div className="icon-circle me-2 text-primary fs-5"><BsBell /></div>
                <span className="badge-text me-3 fw-bold fs-6">Giới thiệu bài viết</span>
              </div>
            </div>
            <h1 className="display-4 fw-bold text-dark mb-3">{article.title}</h1>
            <p className="lead text-muted fs-5">📚 Tác giả: {article.author}</p>
            <p className="lead text-muted fs-5">🕒 Ngày tạo: {new Date(article.createdAt).toLocaleString()}</p>
            <p className="lead text-muted fs-5">🧠 Những điều bạn cần biết về bài viết này.</p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <h2 className="mb-4 border-bottom pb-2 text-primary fs-3">📖 Các phần trong bài viết:</h2>
      {article.sections && article.sections.length > 0 ? (
        article.sections
          .sort((a, b) => a.sectionNumber - b.sectionNumber)
          .map((section) => (
            <div key={section.id} className="mb-5">
              <h4 className="fw-semibold text-secondary mb-2 fs-4">
                Phần {section.sectionNumber}
              </h4>
              <p className="fs-5">{section.title}</p>

              {section.mediaType === 'video' ? (
                <video controls className="w-100 rounded shadow-sm" src={section.mediaUrl} />
              ) : section.mediaType === 'image' ? (
                <img src={section.mediaUrl} alt={section.title} className="img-fluid rounded shadow-sm" />
              ) : null}

              <p className="fs-5" style={{ whiteSpace: 'pre-line' }}>
                {section.content || `Nội dung phần ${section.sectionNumber} (cập nhật?)`}
              </p>
            </div>
          ))
      ) : (
        <p className="fs-5">{article.content || 'Chưa có nội dung bài viết.'}</p>
      )}

      {/* 💬 Comment Section */}
      <hr className="my-4" />
      <h3 className="text-primary mb-3">💬 Bình luận</h3>

      {/* Danh sách comment */}
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="border-bottom pb-2 mb-3">
            <strong className="d-block">{comment.user?.fullName || 'Người dùng'}</strong>
            <p className="mb-1">{comment.content}</p>
            <small className="text-muted">{new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        ))
      ) : (
        <p className="text-muted">Chưa có bình luận nào.</p>
      )}

      {/* Nhập comment mới */}
      <div className="mt-4">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Nhập bình luận của bạn..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handlePostComment}
          disabled={!userId || posting}
        >
          {posting ? 'Đang gửi...' : 'Gửi bình luận'}
        </button>
        {!userId && <p className="text-danger mt-2">Bạn cần đăng nhập để bình luận.</p>}
      </div>
    </div>
  );
};

export default ArticleDetail;
