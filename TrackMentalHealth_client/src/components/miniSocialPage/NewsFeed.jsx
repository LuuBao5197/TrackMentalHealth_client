import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import PostItem from '../miniSocialPage/PostItem';
import PostModalForm from '../miniSocialPage/PostModalForm';
import { useSelector } from 'react-redux';
import { getUserInfo } from '../../api/userAPI';

function NewsFeed() {
  const [posts, setPosts] = useState([]);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const userInfo = useSelector(state => state.auth.user);
  const userID = userInfo?.userId;
  const [user, setUser] = useState({});

  useEffect(() => {
    if (userID) {
      getUserInfo(userID)
        .then(res => setUser(res.data))
        .catch(err => console.error(err));
    }
  }, [userID]);

  const updatePostById = async (postId) => {
    try {
      const res = await axios.get(`http://localhost:9999/api/community/post/${postId}`);
      const updatedPost = res.data;

      setPosts(prev =>
        prev.map(p => (p.id === postId ? updatedPost : p))
      );
    } catch (err) {
      console.error('Lỗi khi cập nhật bài viết:', err);
    }
  };
  const fetchPosts = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    console.log('Fetching page', pageRef.current);
    try {
      const res = await axios.get(`http://localhost:9999/api/community/post?page=${pageRef.current}&size=5`);
      console.log(res);
      const data = res.data.content;
      const totalPages = res.data.totalPages; // <- cần backend trả về

      if (pageRef.current + 1 >= totalPages) {
        setHasMore(false);
      }

      if (data.length > 0) {
        setPosts(prev => [...prev, ...data]);
        pageRef.current += 1;
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      loadingRef.current = false;
    }
  }, [hasMore]);


  const handleScroll = useCallback(() => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 300 && hasMore && !loadingRef.current) {
      fetchPosts();
    }
  }, [fetchPosts, hasMore]);

  useEffect(() => {
    fetchPosts(); // Lần đầu
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts, handleScroll]);


  const refreshPosts = () => {
    setPosts([]);
    setHasMore(true);
    pageRef.current = 0;
    return fetchPosts();
  };

  return (
    <div className="container py-4 card shadow-sm mb-4">
      <div className="d-flex align-items-center">
        <img
          src={user.avatar}
          alt="avatar"
          width="60"
          height="60"
          className="rounded-circle me-2"
        />
        <button
          className="form-control text-start"
          onClick={() => setShowModal(true)}
          style={{ flex: 1 }}
        >
          Bạn đang nghĩ gì thế?
        </button>
      </div>

      <PostModalForm
        show={showModal}
        handleClose={() => setShowModal(false)}
        onPostCreated={refreshPosts}
        userID={userID}
      />

      {posts.map(post => <PostItem key={post.id} post={post} onUpdatePost={updatePostById} />)}

      {loadingRef.current && (
        <div className="text-center py-3"><div className="spinner-border text-primary" role="status" /></div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="text-center text-muted mb-4">🎉 Bạn đã xem hết tất cả bài viết</div>
      )}
    </div>
  );
}

export default NewsFeed;
