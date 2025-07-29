import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentBox from './CommentBox';
import './PostItem.css';
import { useSelector } from 'react-redux';

const reactionTypes = [
  { icon: '👍', label: 'Like', value: 'like' },
  { icon: '❤️', label: 'Love', value: 'love' },
  { icon: '😆', label: 'Haha', value: 'haha' },
  { icon: '😮', label: 'Wow', value: 'wow' },
  { icon: '😢', label: 'Sad', value: 'sad' },
  { icon: '😡', label: 'Angry', value: 'angry' }
];

function PostItem({ post, onUpdatePost }) {
  const userInfo = useSelector((state) => state.auth.user);
  const userID = userInfo?.userId;
  const [userReaction, setUserReaction] = useState(null); //
  const defaultReactionState = {
    like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0
  };
  // console.log(post);

  const [reactions, setReactions] = useState(post.reactions || defaultReactionState);

  useEffect(() => {
    setUserReaction(post.reactions.find(p => p.user.id == userID) || null);
    setReactions(post.reactions || null);
  }, [post, userReaction]);

  const [showPopover, setShowPopover] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const handleReaction = async (type) => {
    if (!userID) return;
    setShowPopover(false);

    try {
      if (userReaction) {
        if (userReaction.emojiType === type) {
          // 🧹 Huỷ cảm xúc
          await axios.delete(`http://localhost:9999/api/community/reaction/${userReaction.id}`);
        } else {
          // 🔁 Đã có reaction, nhưng khác → update
          await axios.put(`http://localhost:9999/api/community/reaction/${userReaction.id}`, {
            id: userReaction.id,
            post: { id: post.id },
            user: { id: userID },
            emojiType: type
          });
        }
      } else {
        // 🆕 Thêm mới reaction
        await axios.post(`http://localhost:9999/api/community/post/${post.id}/reaction`, {
          post: { id: post.id },
          user: { id: userID },
          emojiType: type
        });
      }

      if (onUpdatePost) {
        await onUpdatePost(post.id); // cập nhật lại post
      }
    } catch (error) {
      console.error('Lỗi khi xử lý cảm xúc:', error);
    }
  };

  const getReactionSummary = () => {
    const counts = {
      like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0
    };
    post.reactions?.forEach(r => {
      if (counts.hasOwnProperty(r.emojiType)) {
        counts[r.emojiType]++;
      }
    });
    return counts;
  };


  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex mb-2 align-items-center">
          {console.log(post)}
          <img src={post.avatarUser} className="rounded-circle me-2" alt="avatar" width={50} />
          <strong>{post?.username}</strong>
        </div>

        <p>{post.content}</p>
        {post.media_url && (
          <img src={post.media_url} alt="media" className="img-fluid rounded mb-2" />
        )}

        {/* Reaction Summary */}
        <div className="mt-2 d-flex align-items-center gap-2">
          {Object.entries(getReactionSummary())
            .filter(([_, count]) => count > 0)
            .map(([type, count]) => {
              const reaction = reactionTypes.find(r => r.value === type);
              return (
                <span key={type} className="badge bg-light text-dark border d-flex align-items-center gap-1 px-2 py-1">
                  <span style={{ fontSize: '1.2rem' }}>{reaction.icon}</span>
                  <span>{count}</span>
                </span>
              );
            })}
        </div>


        <div className="d-flex gap-3 align-items-center">
          <div
            className="reaction-wrapper position-relative"
            onMouseEnter={() => setShowPopover(true)}
          >
            <button
              className={`btn btn-sm ${userReaction ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleReaction(userReaction.emojiType || 'like')}
            >
              {userReaction
                ? `${reactionTypes.find(r => r.value === userReaction.emojiType)?.icon} ${reactionTypes.find(r => r.value === userReaction.emojiType)?.label}`
                : '👍 Thích'}
            </button>

            {showPopover && (
              <div className="reaction-popover position-absolute bg-white border p-2 rounded shadow">
                {reactionTypes.map(reaction => (
                  <span
                    key={reaction.value}
                    className="reaction-icon"
                    title={reaction.label}
                    onClick={() => handleReaction(reaction.value)}
                  >
                    {reaction.icon}
                  </span>
                ))}
              </div>
            )}
          </div>

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
