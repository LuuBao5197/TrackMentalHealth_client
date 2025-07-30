import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentBox from './CommentBox';
import './PostItem.css';
import { useSelector } from 'react-redux';
import EditPostModalForm from './EditPostModal';
import { Link } from 'react-router-dom';

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
  const [showEditModal, setShowEditModal] = useState(false);
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
  const handleEdit = (post) => {
    setShowEditModal(true);
    // Có thể mở modal, chuyển route, hoặc gọi callback truyền từ cha
    console.log("Sửa bài viết:", post);
    // Ví dụ: mở form chỉnh sửa bài
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await axios.delete(`http://localhost:9999/api/community/post/${postId}`);
      if (onUpdatePost) {
        await onUpdatePost(postId); // Cập nhật lại danh sách bài viết
      }
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };



  return (
    <div className="card mb-3">
      <div className="card-body">
        {post.isAnonymous == false ? (
          <div className="d-flex mb-2 align-items-center">
            <a href={post.avatarUser} target='blank'><img src={post.avatarUser} className="rounded-circle me-2" alt="avatar" width={50} /></a>
            <strong>{post?.username}</strong>
            {userID == post?.userID && (
              <div className="dropdown ms-auto">
                <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                  ⋮
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={() => handleEdit(post)}>
                      ✏️ Sửa bài viết
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => handleDelete(post.id)}>
                      🗑️ Xóa bài viết
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>) : (
          <div className="d-flex mb-2 align-items-center">
            <img src="/TrackMentalHealth/AnonymousUser.png" className="rounded-circle me-2" alt="anonymous" width={50} />
            <strong>Anonymous User</strong>
            {userID == post?.userID && (
              <div className="dropdown ms-auto">
                <button className="btn btn-sm btn-light" data-bs-toggle="dropdown">
                  ⋮
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={() => handleEdit(post)}>
                      ✏️ Sửa bài viết
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={() => handleDelete(post.id)}>
                      🗑️ Xóa bài viết
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>)
        }

        <p>{post.content}</p>
        {post.mediaList && (
          <div className="post-images mb-3">
            {(() => {
              const images = Array.isArray(post.mediaList)
                ? post.mediaList
                : [post.mediaList];

              if (images.length === 1) {
                return (
                  <a href={images[0].mediaUrl} target='blank'>
                    <img
                      src={images[0].mediaUrl}
                      alt="post"
                      className="img-fluid rounded mb-2"
                      style={{ objectFit: 'cover', width: '300px', height: 'auto' }}
                    />
                  </a>
                );
              }

              if (images.length === 2) {
                return (
                  <div className="row g-2">
                    {images.map((img, idx) => (
                      <div className="col-6" key={idx}>
                        <a href={img.mediaUrl} target='blank'>
                          <img
                            src={img.mediaUrl}
                            alt={`post-${idx}`}
                            className="img-fluid rounded w-100"
                            style={{ objectFit: 'cover', height: '200px' }}
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                );
              }

              if (images.length >= 3) {
                return (
                  <div className="row g-2">
                    <div className="col-12 text-center">
                      <a href={images[0].mediaUrl} target='blank'>
                        <img
                          src={images[0].mediaUrl}
                          alt="post-0"
                          className="img-fluid rounded w-50"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />

                      </a>
                    </div>
                    <div className="col-6">
                      <a href={images[1].mediaUrl} target='blank'>
                        <img
                          src={images[1].mediaUrl}
                          alt="post-1"
                          className="img-fluid rounded w-75"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />

                      </a>
                    </div>
                    <div className="col-6">
                      <a href={images[2].mediaUrl} target='blank'>

                        <img
                          src={images[2].mediaUrl}
                          alt="post-2"
                          className="img-fluid rounded w-75"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />
                      </a>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>
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
        {console.log(post)}
        {showComments && <CommentBox postId={post.id} commentLists={post.comments} />}
      </div>
      <EditPostModalForm
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        postData={post}
        onPostUpdated={onUpdatePost}
      />
    </div>

  );
}

export default PostItem; 
