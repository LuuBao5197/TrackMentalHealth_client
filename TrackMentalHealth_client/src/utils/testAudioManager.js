// Test utility for AudioManager
import { AudioManager } from './audioManager';

export const testAudioManager = () => {
  console.log('🧪 Testing AudioManager...');
  
  // Test 1: Stop all ringtone
  console.log('Test 1: Stopping all ringtone...');
  AudioManager.stopAllRingtone();
  
  // Test 2: Create test audio elements
  const testAudio1 = document.createElement('audio');
  testAudio1.id = 'test-ringtone-1';
  testAudio1.src = 'test-ringtone.mp3';
  testAudio1.loop = true;
  document.body.appendChild(testAudio1);
  
  const testAudio2 = document.createElement('audio');
  testAudio2.id = 'test-ringtone-2';
  testAudio2.src = 'another-ringtone.mp3';
  testAudio2.loop = true;
  document.body.appendChild(testAudio2);
  
  // Test 3: Stop specific audio by ID
  console.log('Test 2: Stopping specific audio by ID...');
  AudioManager.stopAudioById('test-ringtone-1');
  
  // Test 4: Stop all ringtone again
  console.log('Test 3: Stopping all ringtone again...');
  AudioManager.stopAllRingtone();
  
  // Cleanup
  document.body.removeChild(testAudio1);
  document.body.removeChild(testAudio2);
  
  console.log('✅ AudioManager tests completed');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testAudioManager = testAudioManager;
}


