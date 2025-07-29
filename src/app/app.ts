import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGameComponent } from './card-game/card-game.component';
import { MusicService } from './services/music.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CardGameComponent],
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1 class="app-title">
          Card Dungeon Adventure
          <button class="help-btn" (click)="showRules()" title="Game Rules">
            <span class="help-icon">?</span>
          </button>
          <button class="music-btn" (click)="toggleMusic()" [title]="musicService.getIsMuted() ? 'Unmute Music' : 'Mute Music'">
            <span class="music-icon" [class.muted]="musicService.getIsMuted()">
              {{ musicService.getIsMuted() ? '🔇' : '🎵' }}
            </span>
          </button>
        </h1>
      </div>

      <!-- Rules Modal -->
      <div class="rules-modal" *ngIf="showRulesModal" (click)="closeRules()">
        <div class="rules-content" (click)="$event.stopPropagation()">
          <div class="rules-header">
            <h2>Game Rules</h2>
            <button class="close-btn" (click)="closeRules()">&times;</button>
          </div>
          <div class="rules-body">
            <div class="rule-section">
              <h3>🎯 Objective</h3>
              <p>Survive the dungeons by defeating monsters and managing your health. Your goal is to clear all 52 dungeon cards while maintaining your health above 0.</p>
            </div>

            <div class="rule-section">
              <h3>❤️ Hearts (Healing)</h3>
              <p>Hearts restore your health. Each heart card heals you for its value (2=2, 3=3, ..., 10=10, J=11, Q=12, K=13, A=14). You can use hearts even at full health, but it's wasted healing.</p>
            </div>

            <div class="rule-section">
              <h3>💎 Diamonds (Weapons)</h3>
              <p>Diamonds are weapons you can equip. Each diamond card has attack power equal to its value. You can only have one weapon equipped at a time. Equipping a new weapon replaces the current one.</p>
            </div>

            <div class="rule-section">
              <h3>♠️♣️ Spades & Clubs (Monsters)</h3>
              <p>Spades and clubs are monsters you must fight. Each monster has damage equal to its value. You can fight monsters in two ways:</p>
              <ul>
                <li><strong>With a weapon:</strong> If your weapon's attack ≥ monster's damage, you win without taking damage</li>
                <li><strong>Bare-handed:</strong> You always win but take damage equal to the monster's damage, if your health reaches 0 or less you loose</li>
              </ul>
            </div>

            <div class="rule-section">
              <h3>⚔️ Combat Mechanics</h3>
              <p>When you defeat a monster with a weapon, that weapon becomes "tired" and can only defeat monsters with damage ≤ the last monster it killed. This creates strategic weapon management.</p>
            </div>

            <div class="rule-section">
              <h3>🎮 Game Flow</h3>
              <ul>
                <li>Start with 20 health and a basic deck of 52 cards which are randomly shuffled each time</li>
                <li>4 cards appear and form a dungeon</li>
                <li>Click cards to use trigger their effects</li>
                <li>Clear 3 of the 4 dungeon cards to proceed to the next dungeon which will contain your last card from the last dungeon and 3 new cards</li>
                <li>If your health reaches 0 or less, you lose!</li>
                <li>If you use all of the 52 cards then you win!</li>
                <li>Your score increases with each action so that you can compare with other players</li>
              </ul>
            </div>

            <div class="rule-section">
              <h3>⚠️ Visual Indicators</h3>
              <ul>
                <li><strong>Red border:</strong> Monster will damage you if fought</li>
                <li><strong>Orange border:</strong> Healing card is wasted (full health)</li>
                <li><strong>Disabled cards:</strong> Cannot be used (though all cards are actually usable)</li>
              </ul>
            </div>

            <div class="rule-section">
              <h3>🏆 Victory Conditions</h3>
              <p>Clear all 52 dungeon cards while keeping your health above 0. The game tracks your score based on your actions and efficiency.</p>
            </div>
          </div>
        </div>
      </div>

      <app-card-game></app-card-game>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      font-family: 'Arial', sans-serif;
    }

    .app-header {
      margin-bottom: 20px;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px 20px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }

    .app-title {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .help-btn {
      background: linear-gradient(45deg, #2196F3, #1976D2);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }

    .help-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .help-icon {
      color: white;
      font-size: 16px;
      font-weight: bold;
    }

    .music-btn {
      background: linear-gradient(45deg, #FF6B6B, #FF8E53);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      flex-shrink: 0;
    }

    .music-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .music-icon {
      font-size: 16px;
      transition: all 0.3s ease;
    }

    .music-icon.muted {
      opacity: 0.6;
    }

    .rules-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1001;
      animation: fadeIn 0.3s ease-out;
    }

    .rules-content {
      background: white;
      border-radius: 20px;
      max-width: 900px;
      max-height: 85vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      position: relative;
    }

    .rules-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 25px 30px;
      border-bottom: 3px solid #f0f0f0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px 20px 0 0;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .rules-header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .rules-body {
      padding: 30px;
      line-height: 1.7;
    }

    .rule-section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;
    }

    .rule-section:hover {
      background: #f0f2f5;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .rule-section:last-child {
      margin-bottom: 0;
    }

    .rule-section h3 {
      color: #2c3e50;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }

    .rule-section p {
      color: #34495e;
      margin-bottom: 12px;
      font-size: 16px;
      line-height: 1.6;
    }

    .rule-section ul {
      color: #34495e;
      padding-left: 25px;
      margin-bottom: 12px;
    }

    .rule-section li {
      margin-bottom: 10px;
      font-size: 16px;
      line-height: 1.5;
    }

    .rule-section strong {
      color: #2c3e50;
      font-weight: bold;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
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
