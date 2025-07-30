import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BsBookmarkHeart } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';

const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [usernames, setUsernames] = useState({});

  const userInfo = useSelector((state) => state.auth.user);
  const userId = userInfo?.userId || null;

  useEffect(() => {
    axios
      .get(`http://localhost:9999/api/article/${id}`)
      .then((res) => setArticle(res.data))
      .catch((err) =>
        console.error('❌ Error loading article details:', err)
      );
  }, [id]);

  useEffect(() => {
    axios
      .get(`http://localhost:9999/api/article/${id}/comments`)
      .then((res) => setComments(res.data))
      .catch((err) =>
        console.error('❌ Error loading comments:', err)
      );
  }, [id]);

  const fetchUserNameById = async (id) => {
    try {
      const res = await axios.get(`http://localhost:9999/api/user/${id}`);
      return res.data.username || 'Unknown';
    } catch (err) {
      console.error(`❌ Error fetching username for ID ${id}:`, err);
      return 'Unknown';
    }
  };

  useEffect(() => {
    if (comments.length === 0) return;

    const loadUsernames = async () => {
      const newUsernames = { ...usernames };

      for (const comment of comments) {
        const uid = comment.user?.id || comment.userId;
        if (uid && !newUsernames[uid]) {
          const name = await fetchUserNameById(uid);
          newUsernames[uid] = name;
        }
      }

      setUsernames(newUsernames);
    };

    loadUsernames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comments]);

  const handlePostComment = async () => {
    if (!commentContent.trim()) return;

    try {
      setPosting(true);
      await axios.post(`http://localhost:9999/api/article/${id}/comments`, {
        content: commentContent,
        userId: userId
      });
      setCommentContent('');
      const res = await axios.get(`http://localhost:9999/api/article/${id}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error('❌ Failed to post comment:', error.response?.data || error.message);
    } finally {
      setPosting(false);
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (!article) {
    return (
      <p className="text-center p-4" style={{ fontSize: '1.5em' }}>
        Loading article...
      </p>
    );
  }

  const imageUrl = article.photo?.startsWith('http')
    ? article.photo
    : article.photo
      ? `http://localhost:9999/uploads/${article.photo}`
      : 'assets/img/default-article.webp';

  return (
    <div className="container py-5" style={{ fontFamily: 'Georgia, serif', fontSize: '1.2em' }}>
      {/* Hero */}
      <section id="article-hero" className="mb-4">
        <div className="badge-wrapper mb-3">
          <div className="d-inline-flex align-items-center rounded-pill border border-primary px-3 py-1">
            <div className="icon-circle me-2 text-primary"><BsBookmarkHeart /></div>
            <span className="badge-text me-3 fw-bold" style={{ fontSize: '1.3em' }}>Article Information</span>
          </div>
        </div>
        <h1 className="display-6 fw-bold text-dark mb-3">{article.title}</h1>
        <img
          src={imageUrl}
          alt={article.title}
          className="img-fluid rounded shadow-sm mb-4"
          style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }}
        />
        <p style={{ whiteSpace: 'pre-line', fontSize: '1.3em', lineHeight: '1.8' }}>
          {article.content}
        </p>
      </section>

      {/* Comments */}
      <hr className="my-5" />
      <h3 className="text-primary mb-3">💬 Comments</h3>

      {/* Comment form */}
      <div className="mb-4">
        {userId ? (
          <>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Write your comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <button
              className="btn btn-primary mt-2"
              onClick={handlePostComment}
              disabled={posting}
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </>
        ) : (
          <p className="text-danger">
            🔒 <a href="/TrackMentalHealth/auth/login">Please log in to comment</a>
          </p>
        )}
      </div>

      {/* Comment list */}
      {comments.length > 0 ? (
        comments.map((comment) => {
          const uid = comment.user?.id || comment.userId;
          const username = usernames[uid] || 'Loading...';

          return (
            <div key={comment.id} className="border-bottom pb-2 mb-3">
              <strong className="d-block">{username}</strong>
              <p className="mb-1" style={{ whiteSpace: 'pre-line' }}>{comment.content}</p>
              <small className="text-muted">{getRelativeTime(comment.createdAt)}</small>
            </div>
          );
        })
      ) : (
        <p className="text-muted">No comments yet.</p>
      )}
    </div>
  );
};

export default ArticleDetail;
