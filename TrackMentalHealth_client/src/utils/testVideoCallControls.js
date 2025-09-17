// Test utility for VideoCall controls
export const testVideoCallControls = () => {
  console.log('🧪 Testing VideoCall Controls...');
  
  // Test 1: Check if controls are visible
  const controlsContainer = document.querySelector('.alert .d-flex.gap-2');
  if (controlsContainer) {
    console.log('✅ Controls container found');
    
    // Test 2: Check individual buttons
    const cameraBtn = controlsContainer.querySelector('button:nth-child(1)');
    const micBtn = controlsContainer.querySelector('button:nth-child(2)');
    const endCallBtn = controlsContainer.querySelector('button:nth-child(3)');
    
    if (cameraBtn) console.log('✅ Camera button found');
    if (micBtn) console.log('✅ Microphone button found');
    if (endCallBtn) console.log('✅ End Call button found');
    
    // Test 3: Check button states
    if (cameraBtn) {
      const isEnabled = cameraBtn.classList.contains('btn-success');
      console.log(`📹 Camera: ${isEnabled ? 'Enabled' : 'Disabled'}`);
    }
    
    if (micBtn) {
      const isEnabled = micBtn.classList.contains('btn-success');
      console.log(`🎤 Microphone: ${isEnabled ? 'Enabled' : 'Disabled'}`);
    }
    
  } else {
    console.log('❌ Controls container not found');
  }
  
  // Test 4: Check connection status
  const statusAlert = document.querySelector('.alert');
  if (statusAlert) {
    const statusText = statusAlert.querySelector('span').textContent;
    console.log(`📊 Status: ${statusText}`);
  }
  
  console.log('✅ VideoCall Controls test completed');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testVideoCallControls = testVideoCallControls;
}


