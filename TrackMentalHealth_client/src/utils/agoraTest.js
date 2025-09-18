// Agora integration test utility
import { 
  joinRoom, 
  leaveRoom, 
  destroyRoom, 
  checkCameraAvailability, 
  checkMicrophoneAvailability,
  getCurrentRoomInfo 
} from '../services/AgoraService';

/**
 * Test Agora integration
 */
export async function testAgoraIntegration() {
  console.log('🧪 Testing Agora Integration...');
  
  try {
    // Test device availability
    const cameraAvailable = await checkCameraAvailability();
    const microphoneAvailable = await checkMicrophoneAvailability();
    
    console.log('📹 Camera available:', cameraAvailable);
    console.log('🎤 Microphone available:', microphoneAvailable);
    
    if (!cameraAvailable || !microphoneAvailable) {
      console.warn('⚠️ Some devices are not available. Please check permissions.');
    }
    
    // Test room info
    const roomInfo = getCurrentRoomInfo();
    console.log('🏠 Current room info:', roomInfo);
    
    console.log('✅ Agora integration test completed');
    return true;
  } catch (error) {
    console.error('❌ Agora integration test failed:', error);
    return false;
  }
}

/**
 * Test video call functionality
 */
export async function testVideoCall(container, roomId = 'test-room', userId = 'test-user') {
  console.log('📞 Testing video call...');
  
  try {
    // Join test room
    await joinRoom(container, {
      roomId,
      userId,
      userName: 'Test User',
      mode: 'one-on-one'
    });
    
    console.log('✅ Successfully joined test room');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Leave room
    await leaveRoom();
    console.log('✅ Successfully left test room');
    
    return true;
  } catch (error) {
    console.error('❌ Video call test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests(container) {
  console.log('🚀 Running all Agora tests...');
  
  const integrationTest = await testAgoraIntegration();
  const videoCallTest = await testVideoCall(container);
  
  const allPassed = integrationTest && videoCallTest;
  
  console.log(allPassed ? '🎉 All tests passed!' : '💥 Some tests failed!');
  
  return allPassed;
}
