// services/AgoraService.jsx
import AgoraRTC from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG, getAgoraToken } from '../config/agoraConfig';

let client = null;
let localTracks = {
  videoTrack: null,
  audioTrack: null
};
let remoteUsers = {};
let currentRoomId = null;
let isJoined = false;

// Initialize Agora client
function createClient() {
  if (!client) {
    client = AgoraRTC.createClient(AGORA_CONFIG.CLIENT_CONFIG);
  }
  return client;
}

// Generate token for authentication
async function generateToken(roomId, userId) {
  return await getAgoraToken(roomId, userId);
}

/**
 * Join room with Agora RTC
 * @param {HTMLElement} container - Container element for video display
 * @param {Object} options - Join options
 * @param {string} options.roomId - Room ID
 * @param {string} options.userId - User ID
 * @param {string} options.userName - User name
 * @param {string} options.mode - Call mode ('one-on-one' or 'group')
 * @param {Function} options.onLeave - Callback when leaving room
 * @returns {Promise} - Promise that resolves when joined
 */
export async function joinRoom(container, options = {}) {
  const { roomId, userId, userName, mode = 'one-on-one', onLeave } = options;
  
  console.log('[AgoraService] joinRoom called:', { roomId, userId, mode });

  if (!container) throw new Error('[AgoraService] container is null');
  if (!roomId || !userId) throw new Error('[AgoraService] roomId and userId are required');

  try {
    // Clean up previous session
    if (isJoined) {
      await leaveRoom();
    }

    // Create client
    const agoraClient = createClient();
    currentRoomId = roomId;

    // Set up event handlers
    setupEventHandlers(agoraClient, container, onLeave);

    // Generate token
    const token = await generateToken(roomId, userId);

    // Check if App ID is valid (temporarily disabled for testing)
    // if (!AGORA_CONFIG.APP_ID || AGORA_CONFIG.APP_ID === 'YOUR_AGORA_APP_ID') {
    //   throw new Error('Agora App ID is not configured. Please set a valid App ID in agoraConfig.js');
    // }
    
    console.log('[AgoraService] Using App ID:', AGORA_CONFIG.APP_ID);

    // Join the channel
    await agoraClient.join(AGORA_CONFIG.APP_ID, roomId, token, userId);
    isJoined = true;

    console.log('[AgoraService] Successfully joined room:', roomId);

    // Create and publish local tracks
    await createAndPublishTracks();

    return true;
  } catch (error) {
    console.error('[AgoraService] Error joining room:', error);
    throw error;
  }
}

// Set up Agora event handlers
function setupEventHandlers(client, container, onLeave) {
  // User published (joined and published tracks)
  client.on('user-published', async (user, mediaType) => {
    console.log('[AgoraService] User published:', user.uid, mediaType);
    
    await client.subscribe(user, mediaType);
    
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;
      const remotePlayerContainer = document.createElement('div');
      remotePlayerContainer.id = `remote-player-${user.uid}`;
      remotePlayerContainer.style.width = '100%';
      remotePlayerContainer.style.height = '100%';
      container.appendChild(remotePlayerContainer);
      
      remoteVideoTrack.play(remotePlayerContainer);
      remoteUsers[user.uid] = remotePlayerContainer;
    }
    
    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack.play();
    }
  });

  // User unpublished (left or stopped publishing)
  client.on('user-unpublished', (user, mediaType) => {
    console.log('[AgoraService] User unpublished:', user.uid, mediaType);
    
    if (mediaType === 'video') {
      const remotePlayerContainer = remoteUsers[user.uid];
      if (remotePlayerContainer) {
        remotePlayerContainer.remove();
        delete remoteUsers[user.uid];
      }
    }
  });

  // User left
  client.on('user-left', (user) => {
    console.log('[AgoraService] User left:', user.uid);
    const remotePlayerContainer = remoteUsers[user.uid];
    if (remotePlayerContainer) {
      remotePlayerContainer.remove();
      delete remoteUsers[user.uid];
    }
  });

  // Connection state changed
  client.on('connection-state-change', (curState, revState) => {
    console.log('[AgoraService] Connection state changed:', curState, revState);
  });

  // Exception occurred
  client.on('exception', (event) => {
    console.error('[AgoraService] Exception occurred:', event);
  });
}

// Create and publish local tracks
async function createAndPublishTracks() {
  try {
    // Create local video track
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack({
      encoderConfig: AGORA_CONFIG.VIDEO_CONFIG
    });

    // Create local audio track
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    // Publish tracks
    await client.publish([localTracks.videoTrack, localTracks.audioTrack]);
    
    console.log('[AgoraService] Local tracks published successfully');
  } catch (error) {
    console.error('[AgoraService] Error creating/publishing tracks:', error);
    throw error;
  }
}

// Play local video in container
export function playLocalVideo(container) {
  if (localTracks.videoTrack && container) {
    const localPlayerContainer = document.createElement('div');
    localPlayerContainer.id = 'local-player';
    localPlayerContainer.style.width = '200px';
    localPlayerContainer.style.height = '150px';
    localPlayerContainer.style.position = 'absolute';
    localPlayerContainer.style.top = '10px';
    localPlayerContainer.style.right = '10px';
    localPlayerContainer.style.border = '2px solid #007bff';
    localPlayerContainer.style.borderRadius = '8px';
    container.appendChild(localPlayerContainer);
    
    localTracks.videoTrack.play(localPlayerContainer);
  }
}

// Toggle camera
export async function toggleCamera() {
  if (localTracks.videoTrack) {
    await localTracks.videoTrack.setEnabled(!localTracks.videoTrack.enabled);
    return localTracks.videoTrack.enabled;
  }
  return false;
}

// Toggle microphone
export async function toggleMicrophone() {
  if (localTracks.audioTrack) {
    await localTracks.audioTrack.setEnabled(!localTracks.audioTrack.enabled);
    return localTracks.audioTrack.enabled;
  }
  return false;
}

// Leave room
export async function leaveRoom() {
  if (!isJoined || !client) {
    console.warn('[AgoraService] leaveRoom called but not joined');
    return;
  }

  try {
    // Stop and close local tracks
    if (localTracks.videoTrack) {
      localTracks.videoTrack.stop();
      localTracks.videoTrack.close();
      localTracks.videoTrack = null;
    }
    
    if (localTracks.audioTrack) {
      localTracks.audioTrack.stop();
      localTracks.audioTrack.close();
      localTracks.audioTrack = null;
    }

    // Leave the channel
    await client.leave();
    
    // Clean up remote users
    Object.values(remoteUsers).forEach(container => {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    remoteUsers = {};

    isJoined = false;
    currentRoomId = null;
    
    console.log('[AgoraService] Successfully left room');
  } catch (error) {
    console.error('[AgoraService] Error leaving room:', error);
    throw error;
  }
}

// Destroy room and clean up
export async function destroyRoom() {
  await leaveRoom();
  
  if (client) {
    client.removeAllListeners();
    client = null;
  }
  
  console.log('[AgoraService] Room destroyed');
}

// Get current room info
export function getCurrentRoomInfo() {
  return {
    roomId: currentRoomId,
    isJoined,
    client: client ? 'connected' : 'disconnected'
  };
}

// Check if camera is available
export async function checkCameraAvailability() {
  try {
    const devices = await AgoraRTC.getDevices();
    return devices.some(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('[AgoraService] Error checking camera:', error);
    return false;
  }
}

// Check if microphone is available
export async function checkMicrophoneAvailability() {
  try {
    const devices = await AgoraRTC.getDevices();
    return devices.some(device => device.kind === 'audioinput');
  } catch (error) {
    console.error('[AgoraService] Error checking microphone:', error);
    return false;
  }
}
