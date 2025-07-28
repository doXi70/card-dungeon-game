import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../models/card.model';
import { GameService, GameEvent } from '../services/game.service';

@Component({
  selector: 'app-card-game',
  standalone: true,
  imports: [CommonModule],
    template: `
    <div class="game-container">
      <div class="game-main">
        <!-- Game Stats -->
        <div class="game-stats">
          <div class="stat">
            <span class="label">Health:</span>
            <span class="value health">{{ gameService.playerHealth }}/20</span>
          </div>
          <div class="stat">
            <span class="label">Deck:</span>
            <span class="value">{{ gameService.deck.length }} cards</span>
          </div>
          <div class="stat">
            <span class="label">Score:</span>
            <span class="value">{{ gameService.score }}</span>
          </div>
        </div>

              <!-- Current Weapon -->
      <div class="weapon-section" *ngIf="gameService.equippedWeapon">
        <h3>Equipped Weapon:</h3>
        <div class="weapon-info">
          <div class="card weapon-card" [class]="gameService.equippedWeapon.suit">
            <div class="card-value">{{ gameService.equippedWeapon.displayValue }}</div>
            <div class="card-suit">{{ gameService.equippedWeapon.suitSymbol }}</div>
            <div class="weapon-damage">Damage: {{ gameService.equippedWeapon.damage }}</div>
          </div>
          
          <!-- Last Killed Monster Info -->
          <div class="last-killed-info" *ngIf="gameService.lastKilledMonsterDamage > 0">
            <div class="info-label">Last Killed:</div>
            <div class="monster-damage">{{ gameService.lastKilledMonsterDamage }} DMG</div>
            <div class="info-text">Can kill monsters ≤ {{ gameService.lastKilledMonsterDamage }} DMG</div>
          </div>
          
          <div class="last-killed-info" *ngIf="gameService.lastKilledMonsterDamage === 0">
            <div class="info-label">Weapon Status:</div>
            <div class="info-text">Can kill any monster ≤ {{ gameService.equippedWeapon.damage }} DMG</div>
          </div>
        </div>
        <button class="btn discard-btn" (click)="discardWeapon()">Discard Weapon</button>
      </div>

        <!-- Dungeon Cards -->
        <div class="dungeon-section">
          <h3>Dungeon ({{ gameService.dungeon.length }}/4)</h3>
          <div class="dungeon-cards">
            <div 
              *ngFor="let card of gameService.dungeon; let i = index" 
              class="card dungeon-card" 
              [class]="card.suit"
              [class.disabled]="!canUseCard(card)"
              [class.dangerous]="willTakeDamage(card)"
              [class.wasted]="isHealingWasted(card)"
              (click)="useCard(card, i)"
            >
              <div class="card-value">{{ card.displayValue }}</div>
              <div class="card-suit">{{ card.suitSymbol }}</div>
              <div class="card-type">{{ getCardType(card) }}</div>
              <div class="card-effect">{{ getCardEffect(card) }}</div>
              <div class="card-warning" *ngIf="willTakeDamage(card)">⚠️ Will take damage!</div>
              <div class="card-warning wasted-warning" *ngIf="isHealingWasted(card)">⚠️ No healing needed!</div>
            </div>
          </div>
        </div>

        <!-- Game Messages -->
        <div class="game-messages" *ngIf="gameService.message">
          <div class="message" [class]="gameService.messageType">
            {{ gameService.message }}
          </div>
        </div>

        <!-- Start Game Button -->
        <div class="start-section" *ngIf="!gameService.gameStarted && !gameService.gameOver">
          <button class="btn start-btn" (click)="startGame()">Start Game</button>
        </div>
      </div>

      <!-- Game History Sidebar -->
      <div class="history-sidebar" *ngIf="gameService.gameStarted && gameService.history.length > 0">
        <h3>Game History</h3>
        <div class="history-container">
          <div 
            *ngFor="let event of gameService.history" 
            class="history-item"
            [class]="event.type"
          >
            <div class="event-time">{{ formatTime(event.timestamp) }}</div>
            <div class="event-message">{{ event.message }}</div>
          </div>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div class="game-over" *ngIf="gameService.gameOver">
        <div class="game-over-content">
          <h2>{{ gameService.gameWon ? 'Victory!' : 'Game Over' }}</h2>
          <p>Final Score: {{ gameService.score }}</p>
          <button class="btn restart-btn" (click)="restartGame()">Play Again</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    .game-main {
      flex: 1;
      max-width: 800px;
    }

    .game-stats {
      display: flex;
      justify-content: space-around;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .stat {
      text-align: center;
    }

    .label {
      display: block;
      color: #ddd;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .value {
      display: block;
      color: white;
      font-size: 18px;
      font-weight: bold;
    }

    .health {
      color: #00ff88;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
      font-weight: bold;
    }

    .weapon-section {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .weapon-section h3 {
      color: white;
      margin-bottom: 15px;
      text-align: center;
    }

    .weapon-info {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 15px;
    }

    .weapon-card {
      background: linear-gradient(45deg, #FFD700, #FFA500);
      border: 3px solid #FFD700;
      flex-shrink: 0;
    }

    .weapon-damage {
      font-size: 12px;
      color: #333;
      font-weight: bold;
      margin-top: 5px;
    }

    .last-killed-info {
      background: rgba(255, 255, 255, 0.15);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2196F3;
      flex: 1;
    }

    .info-label {
      font-size: 14px;
      color: #ddd;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .monster-damage {
      font-size: 18px;
      color: #ff6b35;
      font-weight: bold;
      margin-bottom: 5px;
      text-shadow: 0 0 8px rgba(255, 107, 53, 0.5);
    }

    .info-text {
      font-size: 12px;
      color: #fff;
      opacity: 0.9;
    }

    .dungeon-section {
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      backdrop-filter: blur(10px);
    }

    .dungeon-section h3 {
      color: white;
      margin-bottom: 15px;
      text-align: center;
    }

    .dungeon-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .card {
      width: 120px;
      height: 160px;
      border-radius: 10px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }

    .card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .card.dangerous {
      border: 3px solid #ff4444;
      box-shadow: 0 0 15px rgba(255, 68, 68, 0.6);
      animation: pulse 1s infinite;
    }

    .card.dangerous:hover {
      border-color: #ff6666;
      box-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
    }

    .card.wasted {
      border: 3px solid #ffaa00;
      box-shadow: 0 0 15px rgba(255, 170, 0, 0.6);
      opacity: 0.7;
    }

    .card.wasted:hover {
      border-color: #ffcc00;
      box-shadow: 0 0 20px rgba(255, 170, 0, 0.8);
      opacity: 0.9;
    }

    .card.spades, .card.clubs {
      background: linear-gradient(45deg, #2c3e50, #34495e);
      color: white;
    }

    .card.hearts {
      background: linear-gradient(45deg, #e74c3c, #c0392b);
      color: white;
    }

    .card.diamonds {
      background: linear-gradient(45deg, #f39c12, #e67e22);
      color: white;
    }

    .card-value {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
    }

    .card-suit {
      font-size: 32px;
      text-align: center;
      margin: 10px 0;
    }

    .card-type {
      font-size: 12px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .card-effect {
      font-size: 10px;
      text-align: center;
      opacity: 0.8;
    }

    .card-warning {
      font-size: 9px;
      text-align: center;
      color: #ff4444;
      font-weight: bold;
      margin-top: 2px;
    }

    .wasted-warning {
      color: #ffaa00;
    }

    .game-messages {
      margin: 20px 0;
    }

    .message {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
      color: white;
    }

    .message.success {
      background: rgba(76, 175, 80, 0.8);
    }

    .message.error {
      background: rgba(244, 67, 54, 0.8);
    }

    .message.info {
      background: rgba(33, 150, 243, 0.8);
    }

    .game-over {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .game-over-content {
      background: white;
      padding: 40px;
      border-radius: 15px;
      text-align: center;
    }

    .game-over-content h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 5px;
    }

    .start-btn {
      background: linear-gradient(45deg, #4CAF50, #45a049);
      color: white;
    }

    .restart-btn {
      background: linear-gradient(45deg, #2196F3, #1976D2);
      color: white;
    }

    .discard-btn {
      background: linear-gradient(45deg, #f44336, #d32f2f);
      color: white;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }

    .start-section {
      text-align: center;
      margin-top: 50px;
    }

    .history-sidebar {
      width: 300px;
      background: rgba(255, 255, 255, 0.1);
      padding: 20px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      height: fit-content;
      position: sticky;
      top: 20px;
    }

    .history-sidebar h3 {
      color: white;
      margin-bottom: 15px;
      text-align: center;
    }

    .history-container {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 10px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-left: 4px solid transparent;
    }

    .history-item.heal {
      border-left-color: #4CAF50;
    }

    .history-item.kill {
      border-left-color: #2196F3;
    }

    .history-item.bare_handed {
      border-left-color: #f44336;
    }

    .history-item.equip {
      border-left-color: #FF9800;
    }

    .history-item.discard {
      border-left-color: #9E9E9E;
    }

    .event-time {
      font-size: 12px;
      color: #ddd;
      min-width: 80px;
    }

    .event-message {
      font-size: 14px;
      color: white;
      flex: 1;
      margin-left: 10px;
    }

    /* Responsive design */
    @media (max-width: 1200px) {
      .game-container {
        flex-direction: column;
        gap: 15px;
      }
      
      .game-main {
        max-width: 100%;
      }
      
      .history-sidebar {
        width: 100%;
        position: static;
      }
      
      .history-container {
        max-height: 300px;
      }
    }
  `]
})
export class CardGameComponent implements OnInit {
  constructor(public gameService: GameService) {}

  ngOnInit() {
    // Component initialization
  }

  startGame() {
    this.gameService.startGame();
  }

  restartGame() {
    this.gameService.restartGame();
  }

  useCard(card: Card, index: number) {
    if (!this.canUseCard(card)) {
      return;
    }

    this.gameService.useCard(card, index);
  }

  canUseCard(card: Card): boolean {
    if (card.suit === 'hearts') {
      return true; // Can always use healing cards (even at full health)
    }
    
    if (card.suit === 'diamonds') {
      return true; // Can always equip weapons
    }
    
    if (card.suit === 'spades' || card.suit === 'clubs') {
      // Can always fight monsters (either with weapon or bare-handed)
      return true;
    }
    
    return false;
  }

  willTakeDamage(card: Card): boolean {
    if (card.suit !== 'spades' && card.suit !== 'clubs') {
      return false;
    }
    
    if (!this.gameService.equippedWeapon) {
      return true; // No weapon = bare-handed combat
    }
    
    if (card.damage > this.gameService.equippedWeapon.damage) {
      return true; // Weapon too weak
    }
    
    if (this.gameService.lastKilledMonsterDamage > 0 && card.damage > this.gameService.lastKilledMonsterDamage) {
      return true; // Weapon restriction
    }
    
    return false;
  }

  isHealingWasted(card: Card): boolean {
    if (card.suit !== 'hearts') {
      return false;
    }
    
    return this.gameService.playerHealth >= 20;
  }

  discardWeapon() {
    this.gameService.discardWeapon();
  }

  getCardType(card: Card): string {
    if (card.suit === 'spades' || card.suit === 'clubs') {
      return 'Monster';
    } else if (card.suit === 'hearts') {
      return 'Heal';
    } else if (card.suit === 'diamonds') {
      return 'Weapon';
    }
    return '';
  }

  getCardEffect(card: Card): string {
    if (card.suit === 'spades' || card.suit === 'clubs') {
      return `${card.damage} DMG`;
    } else if (card.suit === 'hearts') {
      return `${card.heal} HP`;
    } else if (card.suit === 'diamonds') {
      return `${card.damage} ATK`;
    }
    return '';
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }
} 