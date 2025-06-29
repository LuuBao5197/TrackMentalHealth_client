import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9999/api/article/')
      .then(response => setArticles(response.data))
      .catch(error => console.error('Lỗi khi tải danh sách bài viết:', error));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Danh sách bài viết</h1>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {articles.length === 0 ? (
          <p>Đang tải dữ liệu hoặc không có bài viết nào.</p>
        ) : (
          articles.map(article => (
            <div key={article.id} style={{
              width: '300px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#fff',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{article.title}</h3>
                <p style={{ fontSize: '14px', color: '#555' }}>
                  {article.content?.substring(0, 100)}...
                </p>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  Tác giả: {article.author} | Trạng thái: {article.status === "false" ? "Ẩn" : "Hiển thị"}
                </p>
                <p style={{ fontSize: '12px', color: '#aaa' }}>
                  Ngày tạo: {new Date(article.createdAt).toLocaleString()}
                </p>
                <Link to={`/auth/article/${article.id}`} style={{
                  marginTop: '10px',
                  display: 'inline-block',
                  color: '#007bff',
                  textDecoration: 'none'
                }}>
                  Xem thêm →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticleManager;
