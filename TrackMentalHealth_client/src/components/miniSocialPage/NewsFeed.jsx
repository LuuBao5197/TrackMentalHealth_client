import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PostItem from '../miniSocialPage/PostItem';
import PostModalForm from '../miniSocialPage/PostModalForm';
import { useSelector } from 'react-redux';
import { getUserInfo } from '../../api/userAPI';

function NewsFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userRole = useSelector((state) => state.auth.user?.role);
  const userInfo = useSelector((state) => state.auth.user);
  const userID = userInfo.userId;
  const [user, setUser] = useState({});
  useEffect(() => {
    fetchData(userID);
  }, [])
  const fetchData = async (userID) => {
    try {
      const res = await getUserInfo(userID);
      console.log(res.data);
      setUser(res.data);
    } catch (error) {
      console.log(error);
    }
  }
  console.log("userRole: ", userRole);
  const fetchPosts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:9999/api/community/post?page=${page}&size=5`);
      const data = res.data;

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  // Detect scroll to bottom
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom) {
        fetchPosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts]);

  // Reset bài viết khi đăng bài mới
  const refreshPosts = async () => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    await new Promise((r) => setTimeout(r, 200)); // delay 1 chút cho reset xong
    fetchPosts();
  };

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-3 mb-4">
        <div className="d-flex align-items-center">
          <img 
          src={user.avatar} 
          className="rounded-circle me-2" 
          alt="avatar" 
          width="60"
          height="60" 
          />
          <button className="form-control text-start" onClick={() => setShowModal(true)}>
            Bạn đang nghĩ gì thế?
          </button>
        </div>
      </div>

      <PostModalForm show={showModal} handleClose={() => setShowModal(false)} onPostCreated={refreshPosts} />

      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}

      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {!hasMore && (
        <div className="text-center text-muted mb-4">
          🎉 Bạn đã xem hết tất cả bài viết
        </div>
      )}
    </div>
  );
}

export default NewsFeed;
