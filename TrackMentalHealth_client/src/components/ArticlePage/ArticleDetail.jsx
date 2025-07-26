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

  if (!article) return <p className="text-center p-4 fs-5">Đang tải chi tiết bài viết...</p>;

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Hero Section */}
      <section id="hero" className="hero-section mb-5">
        <div className="container">
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
        </div>
      </section>

      {/* Article Sections */}
      <h2 className="mb-4 border-bottom pb-2 text-primary fs-3">📖 Các phần trong bài viết:</h2>
      {article.sections && article.sections.length > 0 ? (
        article.sections
          .sort((a, b) => a.sectionNumber - b.sectionNumber) // 🔁 Sắp xếp tăng dần theo sectionNumber
          .map((section) => (
            <div key={section.id} className="mb-5">
              <h4 className="fw-semibold text-secondary mb-2 fs-4">
                Phần {section.sectionNumber}
              </h4>
              <p className="fs-5">{section.title}</p>
              
              {section.mediaType === 'video' ? (
                <video
                  controls
                  className="w-100 rounded shadow-sm"
                  src={section.mediaUrl}
                />
              ) : section.mediaType === 'image' ? (
                <img
                  src={section.mediaUrl}
                  alt={section.title}
                  className="img-fluid rounded shadow-sm mx-auto d-block"
                />
              ) : null}

              <p className="fs-5" style={{ whiteSpace: 'pre-line' }}>
                {section.content || `Nội dung phần ${section.sectionNumber} (cập nhật?)`}
              </p>
            </div>
          ))
      ) : (
        <div className="mb-5">
          <p className="fs-5" style={{ whiteSpace: 'pre-line' }}>
            {article.content || 'Chưa có nội dung bài viết.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;