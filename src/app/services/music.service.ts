import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    this.audio = new Audio();
    this.audio.src = 'assets/sound/music.mp3';
    this.audio.loop = true;
    this.audio.volume = 0.3; // Set volume to 30%

    // Handle audio loading
    this.audio.addEventListener('canplaythrough', () => {
      console.log('Audio loaded successfully');
    });

    // Handle audio errors
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });

    // Handle audio ending (shouldn't happen with loop=true, but just in case)
    this.audio.addEventListener('ended', () => {
      console.log('Audio ended, restarting...');
      if (this.isPlaying && !this.isMuted) {
        this.audio?.play();
      }
    });
  }

  playMusic(): void {
    if (this.audio && !this.isMuted) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        console.log('Music started playing and will loop');
      }).catch(error => {
        console.error('Error playing music:', error);
      });
    }
  }

  stopMusic(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
      console.log('Music stopped and reset to beginning');
    }
  }

  toggleMusic(): void {
    if (this.isMuted) {
      this.unmuteMusic();
    } else {
      this.muteMusic();
    }
  }

  muteMusic(): void {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.isMuted = true;
      console.log('Music muted (paused but will resume from same position when unmuted)');
    }
  }

  unmuteMusic(): void {
    this.isMuted = false;
    if (this.isPlaying) {
      this.audio?.play().then(() => {
        console.log('Music resumed from where it was paused');
      }).catch(error => {
        console.error('Error resuming music:', error);
      });
    }
    console.log('Music unmuted');
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Ensure music continues playing if it should be playing
  ensureMusicPlaying(): void {
    if (this.isPlaying && !this.isMuted && this.audio && this.audio.paused) {
      this.audio.play().catch(error => {
        console.error('Error ensuring music plays:', error);
      });
    }
  }
}
