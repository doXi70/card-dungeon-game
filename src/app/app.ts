import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGameComponent } from './card-game/card-game.component';
import { MusicService } from './services/music.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CardGameComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App {
  showRulesModal = false;

  constructor(public musicService: MusicService) {
    // Ensure music continues playing when user interacts with the page
    this.setupMusicPersistence();
  }

  private setupMusicPersistence(): void {
    // Resume music when user interacts with the page (browsers often pause audio until user interaction)
    const resumeMusic = () => {
      this.musicService.ensureMusicPlaying();
    };

    // Add event listeners for user interactions
    document.addEventListener('click', resumeMusic);
    document.addEventListener('keydown', resumeMusic);
    document.addEventListener('touchstart', resumeMusic);
  }

  showRules() {
    this.showRulesModal = true;
  }

  closeRules() {
    this.showRulesModal = false;
  }

  toggleMusic() {
    this.musicService.toggleMusic();
  }
} 