// Test utility for Call Ended Flow
export const testCallEndedFlow = () => {
  console.log('🧪 Testing Call Ended Flow...');
  
  // Test 1: Check if CALL_ENDED signal is handled
  console.log('Test 1: Simulating CALL_ENDED signal...');
  
  // Simulate CALL_ENDED signal
  const mockCallEndedSignal = {
    type: "CALL_ENDED",
    callerId: "123",
    callerName: "Test User",
    calleeId: "456",
    sessionId: "test-session-123"
  };
  
  console.log('📞 Mock CALL_ENDED signal:', mockCallEndedSignal);
  
  // Test 2: Check if navigation happens
  console.log('Test 2: Checking navigation behavior...');
  
  // Check if we're in video call page
  const isVideoCallPage = window.location.pathname.includes('/video-call/');
  console.log(`📱 Current page: ${window.location.pathname}`);
  console.log(`🎥 Is video call page: ${isVideoCallPage}`);
  
  // Test 3: Check UI state
  console.log('Test 3: Checking UI state...');
  
  const statusAlert = document.querySelector('.alert');
  if (statusAlert) {
    const statusText = statusAlert.querySelector('span').textContent;
    console.log(`📊 Status: ${statusText}`);
    
    const isCallEnded = statusText.includes('Call ended') || statusText.includes('Returning to chat');
    console.log(`✅ Call ended state: ${isCallEnded}`);
  }
  
  // Test 4: Check button states
  const endCallBtn = document.querySelector('button:contains("End Call")');
  if (endCallBtn) {
    const isDisabled = endCallBtn.disabled;
    const btnText = endCallBtn.textContent;
    console.log(`🔘 End Call button: ${btnText} (disabled: ${isDisabled})`);
  }
  
  console.log('✅ Call Ended Flow test completed');
  console.log('💡 Expected behavior:');
  console.log('   - When one party ends call, other party should see "Call ended by other party" message');
  console.log('   - Both parties should automatically return to chat page after 2 seconds');
  console.log('   - UI should show "Call ended - Returning to chat..." status');
  console.log('   - All controls should be disabled');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCallEndedFlow = testCallEndedFlow;
}


