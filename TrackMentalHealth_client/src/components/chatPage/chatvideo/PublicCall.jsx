import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../../utils/getCurrentUserID";
import { joinRoom, destroyRoom } from "../../../services/ZegoService";

export default function PublicCall() {
  const { id: paramRoomID } = useParams();
  const roomID =
    paramRoomID || String(Math.floor(100000 + Math.random() * 900000));

  const ref = useRef(null);
  const navigate = useNavigate();
  const userID = String(
    getCurrentUserId() || Math.floor(Math.random() * 1e6)
  );
  const userName = "Guest " + userID.slice(-4);

  useEffect(() => {
    if (!ref.current) return;
    joinRoom(ref.current, {
      roomID,
      userID,
      userName,
      mode: "group", // hoặc "one-on-one"
      showPreJoinView: true,
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,
    });

    return () => {
      destroyRoom();
    };
  }, [roomID]);

  return (
    <div
      style={{ height: "100vh", width: "100vw", position: "relative" }}
      className="container mt-3 mb-3"
    >
      {/* Nút Back */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li
            className="breadcrumb-item"
            style={{ cursor: "pointer", color: "#038238ff" }}
            onClick={() => {
              const confirmExit = window.confirm("Bạn có chắc chắn muốn thoát cuộc gọi?");
              if (confirmExit) {
                navigate("/user/chat/list");
              }
            }}
          >
            Chat
          </li>

          <li className="breadcrumb-item active" aria-current="page">
            Public call
          </li>
        </ol>
      </nav>

      <div ref={ref} style={{ height: "95%", width: "100%" }} />
    </div>
  );
}
