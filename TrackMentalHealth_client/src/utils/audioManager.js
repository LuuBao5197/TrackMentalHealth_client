// Audio Manager - Quản lý tập trung tất cả audio elements
export class AudioManager {
  static stopAllRingtone() {
    // Dừng tất cả audio elements có chứa ringtone
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audioEl => {
      if (audioEl.src && audioEl.src.includes('ringtone')) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    });
    
    console.log('🔇 All ringtone audio stopped');
  }
  
  static stopSpecificAudio(audioRef) {
    if (audioRef && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
  
  static stopAudioById(id) {
    const audio = document.getElementById(id);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  
  static playRingtone(audioRef) {
    // Dừng tất cả audio khác trước khi phát
    this.stopAllRingtone();
    
    if (audioRef && audioRef.current) {
      audioRef.current.play().catch(() => console.log("Autoplay blocked"));
    }
  }
  
  static playRingtoneById(id) {
    // Dừng tất cả audio khác trước khi phát
    this.stopAllRingtone();
    
    const audio = document.getElementById(id);
    if (audio) {
      audio.play().catch(() => console.log("Autoplay blocked"));
    }
  }
}

