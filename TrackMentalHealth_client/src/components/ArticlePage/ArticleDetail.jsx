import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BsBell } from 'react-icons/bs';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:9999/api/article/${id}`)
      .then(res => {
        setArticle(res.data);
      })
      .catch(err => console.error('Lỗi khi tải chi tiết bài viết:', err));
  }, [id]);

  if (!article) return <p className="text-center p-4">Đang tải chi tiết bài viết...</p>;

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="badge-wrapper mb-3">
                <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
                  <div className="icon-circle me-2 text-primary"><BsBell /></div>
                  <span className="badge-text me-3 fw-bold">Giới thiệu bài viết</span>
                </div>
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3">{article.title}</h1>
              <p className="lead text-muted">📚 Tác giả: {article.author}</p>
              <p className="text-muted">🕒 Ngày tạo: {new Date(article.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <h2 className="mb-4 border-bottom pb-2 text-primary">📖 Nội dung bài viết:</h2>
      <div className="mb-5">
        <p>{article.content}</p>
      </div>
    </div>
  );
};

export default ArticleDetail;
