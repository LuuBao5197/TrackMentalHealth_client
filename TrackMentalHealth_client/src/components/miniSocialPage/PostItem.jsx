import React, { useState } from 'react';
import CommentBox from './CommentBox';

function PostItem({ post }) {
  const [likes, setLikes] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLikes(likes + 1);
    // TODO: gọi API để tăng like nếu cần
  };

  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex mb-2 align-items-center">
          <img src="https://via.placeholder.com/40" className="rounded-circle me-2" alt="avatar" />
          <strong>Người dùng #{post.user?.id}</strong>
        </div>
        <p>{post.content}</p>
        {post.media_url && (
          <img src={post.media_url} alt="media" className="img-fluid rounded mb-2" />
        )}

        <div className="d-flex gap-3">
          <button className="btn btn-outline-primary btn-sm" onClick={handleLike}>
            ❤️ Thích ({likes})
          </button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowComments(!showComments)}>
            💬 Bình luận
          </button>
        </div>

        {showComments && <CommentBox postId={post.id} />}
      </div>
    </div>
  );
}

export default PostItem;
