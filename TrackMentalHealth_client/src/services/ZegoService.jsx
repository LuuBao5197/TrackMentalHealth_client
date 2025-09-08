// services/zegoService.js
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const APP_ID = 520529008;
const SERVER_SECRET = "4456c4fc98e6f18c1b5fdea763949ad5";

let zegoInstance = null;
let currentRoomID = null;

function createDevToken(roomID, userID, userName) {
  return ZegoUIKitPrebuilt.generateKitTokenForTest(
    APP_ID,
    SERVER_SECRET,
    roomID,
    String(userID),
    userName || `User_${userID}`
  );
}

/**
 * Join room (one-on-one | group) – luôn re-mount UI vào container mới
 * Trả về Promise resolve sau khi onJoinRoom được gọi.
 */
export async function joinRoom(
  container,
  {
    roomID,
    userID,
    userName,
    mode = "one-on-one", // "one-on-one" | "group"
  } = {}
) {
  console.log("[ZegoService] joinRoom called:", { roomID, userID, mode });

  if (!container) throw new Error("[ZegoService] container is null");
  if (!roomID || !userID) throw new Error("[ZegoService] roomID và userID là bắt buộc");

  // ✅ Luôn destroy instance cũ để re-bind vào container mới (kể cả cùng roomID)
  if (zegoInstance) {
    try {
      await zegoInstance.destroy();
    } catch (err) {
      console.error("[ZegoService] Error destroying previous instance:", err);
    } finally {
      zegoInstance = null;
      currentRoomID = null;
    }
  }

  // Tạo token + instance
  const kitToken = createDevToken(roomID, String(userID), userName);
  const zp = ZegoUIKitPrebuilt.create(kitToken);

  const scenario =
    mode === "group"
      ? { mode: ZegoUIKitPrebuilt.VideoConference }
      : { mode: ZegoUIKitPrebuilt.OneONoneCall };

  console.log("[ZegoService] Scenario set to:", scenario);

  // ✅ Trả về Promise resolve khi đã Join xong (UI đã mount)
  const joined = new Promise((resolve) => {
    zp.joinRoom({
      container,
      scenario,

      // one-on-one: bỏ pre-join
      showPreJoinView: mode === "group",

      // auto bật cam/mic
      turnOnCameraWhenJoining: true,
      turnOnMicrophoneWhenJoining: true,

      // UI config
      ...(mode === "group"
        ? {
          showRoomTimer: true,
          showTextChat: true,
          showScreenSharingButton: true,
          showUserList: true,
          sharedLinks: [
            {
              name: "Room link",
              url: `${window.location.origin}/public-call/${encodeURIComponent(roomID)}`,
            },
          ],
        }
        : {
          showRoomTimer: false,
          showTextChat: false,
          showScreenSharingButton: false,
          showUserList: false,
          sharedLinks: [],
        }),

      onJoinRoom: () => {
        console.log("[ZegoService] Joined room:", roomID);
        resolve(true);
      },
      onLeaveRoom: () => {
        console.log("[ZegoService] Left room:", roomID);
        zegoInstance = null;
        currentRoomID = null;
      },
    });
  });

  zegoInstance = zp;
  currentRoomID = roomID;

  console.log("[ZegoService] joinRoom finished. Current room:", currentRoomID);
  return joined;
}

export function leaveRoom() {
  if (!zegoInstance) {
    console.warn("[ZegoService] leaveRoom called but no active instance");
    return;
  }
  try {
    zegoInstance.leaveRoom();
    console.log("[ZegoService] leaveRoom success");
  } catch (err) {
    console.error("[ZegoService] leaveRoom error:", err);
  }
}

export async function destroyRoom() {
  if (!zegoInstance) {
    console.warn("[ZegoService] destroyRoom called but no active instance");
    return;
  }
  try {
    await zegoInstance.destroy();
    console.log("[ZegoService] destroyRoom success");
  } catch (err) {
    console.error("[ZegoService] destroyRoom error:", err);
  } finally {
    zegoInstance = null;
    currentRoomID = null;
  }
}
