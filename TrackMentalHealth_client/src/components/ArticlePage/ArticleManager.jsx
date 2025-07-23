import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);

  // Hàm lấy tên tác giả từ ID
  const fetchUserNameById = async (id) => {
    try {
      const res = await axios.get(`http://localhost:9999/api/user/${id}`);
      return res.data.fullname || 'Không rõ';
    } catch (err) {
      console.error(`❌ Lỗi khi lấy tên người dùng với ID ${id}:`, err);
      return 'Không rõ';
    }
  };

  useEffect(() => {
    const fetchArticlesWithAuthors = async () => {
      try {
        const res = await axios.get('http://localhost:9999/api/article/');
        const rawArticles = res.data;

        const articlesWithNames = await Promise.all(
          rawArticles.map(async (article) => {
            const authorName = article.author
              ? await fetchUserNameById(article.author)
              : 'Không rõ';
            return { ...article, authorName };
          })
        );

        setArticles(articlesWithNames);
      } catch (error) {
        console.error('❌ Lỗi khi tải danh sách bài viết:', error);
      }
    };

    fetchArticlesWithAuthors();
  }, []);

  return (
    <section id="portfolio" className="portfolio section">
      <div className="container section-title" data-aos="fade-up">
        <h2>📚 Danh sách bài viết</h2>
        <p>Khám phá những bài viết hữu ích và kiến thức bổ ích</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div
          className="row g-4 isotope-container"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          {articles.length === 0 ? (
            <p>⏳ Đang tải dữ liệu hoặc không có bài viết nào.</p>
          ) : (
            articles.map((article) => {
              const imageUrl = article.photo?.startsWith('http')
                ? article.photo
                : article.photo
                  ? `http://localhost:9999/uploads/${article.photo}`
                  : 'assets/img/default-article.webp';

              return (
                <div
                  key={article.id}
                  className="col-lg-6 col-md-6 portfolio-item isotope-item filter-article"
                >
                  <div className="portfolio-card position-relative">
                    <div className="portfolio-image">
                      <img
                        src={imageUrl}
                        className="img-fluid"
                        alt={article.title}
                        loading="lazy"
                      />

                      <div className="portfolio-overlay">
                        <div className="portfolio-actions">
                          <Link
                            to={`/auth/article/${article.id}`}
                            className="details-link"
                          >
                            <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="portfolio-content">
                      <span className="category">
                        🖋 Tác giả: {article.authorName || 'Không rõ'}
                      </span>
                      <h3>
                        {article.title?.length > 50
                          ? article.title.substring(0, 50) + '...'
                          : article.title}
                      </h3>
                      <p>
                        {article.content?.length > 100
                          ? article.content.substring(0, 100) + '...'
                          : article.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default ArticleManager;
