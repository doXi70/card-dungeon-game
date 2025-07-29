import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Card} from '../models/card.model';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-card-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container">
      <div class="game-main">
        <!-- Dungeon Cards -->
        <div class="dungeon-section">
          <div class="dungeon-header">
            <div class="dungeon-title-section">
              <h3>Dungeon ({{ gameService.dungeon.length }}/4)</h3>
              <!-- Integrated Weapon Display -->
              <div class="integrated-weapon" *ngIf="gameService.equippedWeapon">
                <div class="weapon-card-compact" [class]="gameService.equippedWeapon.suit">
                  <div class="weapon-card-header">
                    <span class="weapon-label">⚔️ Weapon</span>
                  </div>
                  <div class="weapon-card-content">
                    <div class="weapon-value">{{ gameService.equippedWeapon.displayValue }}{{ gameService.equippedWeapon.suitSymbol }}</div>
                    <div class="weapon-damage-compact">{{ gameService.equippedWeapon.damage }} ATK</div>
                  </div>
                  <div class="weapon-status" *ngIf="gameService.lastKilledMonsterDamage > 0">
                    <span class="status-text">Can kill ≤ {{ gameService.lastKilledMonsterDamage }} DMG</span>
                  </div>
                  <div class="weapon-status" *ngIf="gameService.lastKilledMonsterDamage === 0">
                    <span class="status-text">Can kill ≤ {{ gameService.equippedWeapon.damage }} DMG</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="game-stats">
              <div class="stat">
                <span class="label">Health:</span>
                <span class="value health">{{ gameService.playerHealth }}/20</span>
              </div>
              <div class="stat">
                <span class="label">Progress:</span>
                <span class="value">{{ 52 - gameService.deck.length - gameService.dungeon.length }}/52</span>
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
          </div>
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
              <div class="card-warning wasted-warning" *ngIf="isHealingWasted(card)">⚠️ Healing wasted!</div>
            </div>
          </div>
        </div>

        <!--        &lt;!&ndash; Game Messages &ndash;&gt;-->
        <!--        <div class="game-messages" *ngIf="gameService.message">-->
        <!--          <div class="message" [class]="gameService.messageType">-->
        <!--            {{ gameService.message }}-->
        <!--          </div>-->
        <!--        </div>-->

        <!-- Game History Section -->
        <div class="history-section" *ngIf="gameService.gameStarted && gameService.history.length > 0">
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

        <!-- Start Game Button -->
        <div class="start-section" *ngIf="!gameService.gameStarted && !gameService.gameOver">
          <button class="btn start-btn" (click)="startGame()">Start Game</button>
        </div>
      </div>

      <!-- Game Over Screen -->
      <div class="game-over" *ngIf="gameService.gameOver">
        <div class="game-over-content" [class.victory]="gameService.gameWon">
          <div class="game-over-header">
            <h2>{{ gameService.gameWon ? '🎉 Victory! 🎉' : '💀 Game Over' }}</h2>
            <p class="game-over-subtitle">
              {{ gameService.gameWon ? 'You successfully used all 52 cards!' : 'You ran out of health!' }}
            </p>
          </div>
          <div class="game-over-stats">
            <div class="stat-item">
              <span class="stat-label">Final Score:</span>
              <span class="stat-value">{{ gameService.score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Cards Used:</span>
              <span class="stat-value">{{ 52 - gameService.deck.length - gameService.dungeon.length }}/52</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Final Health:</span>
              <span class="stat-value" [class.health-low]="gameService.playerHealth <= 0">{{ gameService.playerHealth }}/20</span>
            </div>
          </div>
          <button class="btn restart-btn" (click)="restartGame()">
            {{ gameService.gameWon ? 'Play Again' : 'Try Again' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      display: flex;
      gap: 30px;
      max-width: 95vw;
      margin: 0 auto;
      padding: 30px;
      min-height: 100vh;
      width: 100%;
      box-sizing: border-box;
    }

    .game-main {
      flex: 1;
      max-width: none;
      width: 100%;
    }

    .game-stats {
      display: flex;
      justify-content: space-around;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px 20px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      flex: 1;
      max-width: 500px;
    }

    .stat {
      text-align: center;
      flex: 1;
    }

    .label {
      display: block;
      color: #ddd;
      font-size: 14px;
      margin-bottom: 5px;
      font-weight: 500;
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

    /* Legacy weapon styles removed - now using integrated weapon display */

    .dungeon-section {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
      backdrop-filter: blur(10px);
    }

    .dungeon-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .dungeon-title-section {
      display: flex;
      flex-direction: column;
      gap: 15px;
      flex: 1;
    }

    .dungeon-section h3 {
      color: white;
      margin: 0;
      text-align: left;
      flex-shrink: 0;
      font-size: 24px;
      font-weight: bold;
    }

    .integrated-weapon {
      display: flex;
      align-items: center;
      animation: weaponAppear 0.5s ease-out;
    }

    @keyframes weaponAppear {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .weapon-card-compact {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
      border: 2px solid #FFD700;
      border-radius: 12px;
      padding: 15px 20px;
      min-width: 180px;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2);
      position: relative;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .weapon-card-compact::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
      transform: translateX(-100%);
      transition: transform 0.6s ease;
    }

    .weapon-card-compact:hover::before {
      transform: translateX(100%);
    }

    .weapon-card-compact:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .weapon-card-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
    }

    .weapon-label {
      font-size: 15px;
      font-weight: bold;
      color: #8B4513;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .weapon-card-content {
      text-align: center;
      margin-bottom: 10px;
      padding: 8px 0;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .weapon-value {
      font-size: 22px;
      font-weight: bold;
      color: #8B4513;
      margin-bottom: 4px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      letter-spacing: 1px;
    }

    .weapon-damage-compact {
      font-size: 14px;
      color: #D2691E;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .weapon-status {
      text-align: center;
      padding: 8px 10px;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
      border-radius: 6px;
      margin-top: 8px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(5px);
    }

    .status-text {
      font-size: 14px;
      color: #8B4513;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .dungeon-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 25px;
    }

    .card {
      width: 220px;
      height: 280px;
      border-radius: 12px;
      padding: 22px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
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
      font-size: 38px;
      font-weight: bold;
      text-align: center;
    }

    .card-suit {
      font-size: 50px;
      text-align: center;
      margin: 14px 0;
    }

    .card-type {
      font-size: 19px;
      text-align: center;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .card-effect {
      font-size: 19px;
      text-align: center;
      opacity: 0.8;
      font-weight: bold;
    }

    .card-warning {
      font-size: 17px;
      text-align: center;
      color: #ff4444;
      font-weight: bold;
      margin-top: 8px;
      white-space: nowrap;
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
      font-size: 18px;
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
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      animation: fadeIn 0.5s ease-out;
      max-width: 500px;
      width: 90%;
    }

    .game-over-content.victory {
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border: 3px solid #28a745;
      box-shadow: 0 20px 60px rgba(40, 167, 69, 0.3);
    }

    .game-over-header h2 {
      color: #333;
      margin-bottom: 10px;
      font-size: 32px;
      font-weight: bold;
    }

    .game-over-subtitle {
      color: #666;
      font-size: 18px;
      margin-bottom: 30px;
      font-weight: 500;
    }

    .game-over-stats {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      color: #666;
      font-weight: 500;
      font-size: 16px;
    }

    .stat-value {
      color: #333;
      font-weight: bold;
      font-size: 18px;
    }

    .health-low {
      color: #dc3545 !important;
    }

    .btn {
      padding: 16px 32px;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 8px;
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
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .start-section {
      text-align: center;
      margin-top: 50px;
    }

    .history-section {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      margin-top: 30px;
    }

    .history-section h3 {
      color: white;
      margin-bottom: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
    }

    .history-container {
      max-height: 600px;
      overflow-y: auto;
      padding-right: 15px;
    }

    .history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 10px;
      border-radius: 8px;
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
      font-size: 14px;
      color: #ddd;
      min-width: 90px;
      font-weight: 500;
    }

    .event-message {
      font-size: 16px;
      color: white;
      flex: 1;
      margin-left: 15px;
      font-weight: 500;
    }

    /* Responsive design */
    @media (max-width: 1400px) {
      .game-container {
        max-width: 98vw;
        padding: 25px;
      }
    }

    @media (max-width: 1200px) {
      .game-container {
        flex-direction: column;
        gap: 20px;
        max-width: 100vw;
        padding: 20px;
      }

      .game-main {
        max-width: 100%;
      }

      .dungeon-cards {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }

      .card {
        width: 210px;
        height: 260px;
      }

      .history-container {
        max-height: 400px;
      }
    }

    @media (max-width: 768px) {
      .game-container {
        padding: 15px;
        gap: 15px;
        max-width: 100vw;
      }

      .dungeon-section {
        padding: 20px;
      }

      .dungeon-header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }

      .dungeon-title-section {
        align-items: center;
      }

      .dungeon-section h3 {
        text-align: center;
        font-size: 20px;
      }

      .game-stats {
        max-width: none;
        padding: 12px 16px;
      }

      .label {
        font-size: 13px;
      }

      .value {
        font-size: 16px;
      }

      .integrated-weapon {
        justify-content: center;
      }

      .weapon-card-compact {
        min-width: 160px;
        padding: 12px 16px;
      }

      .weapon-value {
        font-size: 20px;
      }

      .weapon-damage-compact {
        font-size: 13px;
      }

      .status-text {
        font-size: 13px;
      }

      .dungeon-cards {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .card {
        width: 200px;
        height: 240px;
        padding: 18px;
      }

      .card-value {
        font-size: 34px;
      }

      .card-suit {
        font-size: 42px;
      }

      .card-type, .card-effect {
        font-size: 17px;
      }

      .card-warning {
        font-size: 15px;
        white-space: nowrap;
      }

      .history-section {
        padding: 20px;
      }

      .history-section h3 {
        font-size: 20px;
      }

      .event-time {
        font-size: 13px;
        min-width: 80px;
      }

      .event-message {
        font-size: 15px;
      }

      .btn {
        padding: 14px 28px;
        font-size: 16px;
      }
    }

    @media (max-width: 480px) {
      .game-container {
        padding: 10px;
        max-width: 100vw;
      }

      .dungeon-section {
        padding: 15px;
      }

      .dungeon-cards {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
      }

      .card {
        width: 190px;
        height: 230px;
        padding: 16px;
      }

      .card-value {
        font-size: 30px;
      }

      .card-suit {
        font-size: 38px;
      }

      .card-type, .card-effect {
        font-size: 15px;
      }

      .card-warning {
        font-size: 13px;
        white-space: nowrap;
      }

      .weapon-card-compact {
        min-width: 140px;
        padding: 10px 12px;
      }

      .weapon-value {
        font-size: 18px;
      }

      .weapon-damage-compact {
        font-size: 12px;
      }

      .status-text {
        font-size: 12px;
      }

      .btn {
        padding: 12px 24px;
        font-size: 15px;
      }
    }
  `]
})
export class CardGameComponent implements OnInit {

  constructor(public gameService: GameService) {
  }

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
