// Agora configuration
export const AGORA_CONFIG = {
  // Replace with your actual Agora App ID
  APP_ID: '93206addcb2a486b9460a5c95ba8b7c4',
  

  
  // Default video settings
  VIDEO_CONFIG: {
    width: 640,
    height: 480,
    frameRate: 15,
    bitrateMin: 600,
    bitrateMax: 1000
  },
  
  // Default audio settings
  AUDIO_CONFIG: {
    sampleRate: 48000,
    stereo: true,
    bitrate: 128
  },
  
  // Client configuration
  CLIENT_CONFIG: {
    mode: 'rtc', // 'rtc' for communication, 'live' for broadcasting
    codec: 'vp8' // 'vp8' or 'h264'
  }
};

// Helper function to get token (implement based on your backend)
export async function getAgoraToken(roomId, userId) {
  try {
    // For development, return null to use temporary token
    // For production, make API call to your token server
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    
    const response = await fetch(`${AGORA_CONFIG.TOKEN_SERVER_URL}?roomId=${roomId}&userId=${userId}`);
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting Agora token:', error);
    return null;
  }
}
