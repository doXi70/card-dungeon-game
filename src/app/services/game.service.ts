import { Injectable } from '@angular/core';
import { Card } from '../models/card.model';
import { MusicService } from './music.service';

export interface GameEvent {
  type: 'heal' | 'kill' | 'bare_handed' | 'equip' | 'discard';
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  deck: Card[] = [];
  dungeon: Card[] = [];
  equippedWeapon: Card | null = null;
  playerHealth: number = 20;
  score: number = 0;
  gameStarted: boolean = false;
  gameOver: boolean = false;
  gameWon: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | 'info' = 'info';
  lastKilledMonsterDamage: number = 0;
  history: GameEvent[] = [];

  constructor(private musicService: MusicService) {
    this.initializeDeck();
  }

  private initializeDeck(): void {
    this.deck = [];
    const suits: Array<'hearts' | 'diamonds' | 'clubs' | 'spades'> = ['hearts', 'diamonds', 'clubs', 'spades'];
    const suitSymbols = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

    for (const suit of suits) {
      for (let value = 2; value <= 14; value++) {
        let displayValue: string;
        let damage: number;
        let heal: number;

        switch (value) {
          case 11:
            displayValue = 'J';
            damage = 11;
            heal = 11;
            break;
          case 12:
            displayValue = 'Q';
            damage = 12;
            heal = 12;
            break;
          case 13:
            displayValue = 'K';
            damage = 13;
            heal = 13;
            break;
          case 14:
            displayValue = 'A';
            damage = 14;
            heal = 14;
            break;
          default:
            displayValue = value.toString();
            damage = value;
            heal = value;
        }

        const card: Card = {
          suit,
          value,
          displayValue,
          suitSymbol: suitSymbols[suit],
          damage,
          heal
        };

        this.deck.push(card);
      }
    }
  }

  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private drawCards(count: number): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < count && this.deck.length > 0; i++) {
      drawnCards.push(this.deck.shift()!);
    }
    return drawnCards;
  }

  private refillDungeon(): void {
    // Only refill if we have cards in deck and dungeon is getting low
    if (this.dungeon.length <= 1 && this.deck.length > 0) {
      const cardsToDraw = Math.min(4 - this.dungeon.length, this.deck.length);
      const newCards = this.drawCards(cardsToDraw);
      this.dungeon.push(...newCards);
      this.showMessage(`Dungeon refilled with ${newCards.length} new cards!`, 'info');
    }
  }

  private logEvent(type: GameEvent['type'], message: string): void {
    this.history.unshift({
      type,
      message,
      timestamp: new Date()
    });
    
    // Keep only last 20 events to prevent memory issues
    if (this.history.length > 20) {
      this.history = this.history.slice(0, 20);
    }
  }

  startGame(): void {
    this.gameStarted = true;
    this.gameOver = false;
    this.gameWon = false;
    this.playerHealth = 20;
    this.score = 0;
    this.equippedWeapon = null;
    this.lastKilledMonsterDamage = 0;
    this.message = '';
    this.history = [];
    
    this.initializeDeck();
    this.shuffleDeck();
    this.dungeon = this.drawCards(4);
    
    // Start background music when game starts
    this.musicService.playMusic();
    
    this.logEvent('heal', 'Game started!');
    this.showMessage('Game started! Defeat monsters with weapons and heal when needed!', 'info');
  }

  restartGame(): void {
    this.gameStarted = false;
    this.gameOver = false;
    this.gameWon = false;
    this.playerHealth = 20;
    this.score = 0;
    this.equippedWeapon = null;
    this.lastKilledMonsterDamage = 0;
    this.message = '';
    this.dungeon = [];
    this.history = [];
    this.initializeDeck();
    
    // Don't stop music on restart - let player control it manually
    // Music will continue playing in the background
  }

  useCard(card: Card, index: number): void {
    if (card.suit === 'hearts') {
      this.useHealCard(card, index);
    } else if (card.suit === 'diamonds') {
      this.equipWeapon(card, index);
    } else if (card.suit === 'spades' || card.suit === 'clubs') {
      this.fightMonster(card, index);
    }
  }

  private useHealCard(card: Card, index: number): void {
    const healAmount = Math.min(card.heal, 20 - this.playerHealth);
    this.playerHealth += healAmount;
    this.removeCardFromDungeon(index);
    this.score += 5;
    
    if (healAmount > 0) {
      this.showMessage(`Healed for ${healAmount} HP!`, 'success');
    } else {
      this.showMessage(`Used healing card but already at full health!`, 'info');
    }
    
    this.refillDungeon();
    this.checkGameEnd();
    this.logEvent('heal', `Used healing card: ${card.displayValue}${card.suitSymbol}`);
  }

  private equipWeapon(card: Card, index: number): void {
    if (this.equippedWeapon) {
      this.showMessage(`Discarded ${this.equippedWeapon.displayValue}${this.equippedWeapon.suitSymbol} and equipped ${card.displayValue}${card.suitSymbol}!`, 'info');
    } else {
      this.showMessage(`Equipped ${card.displayValue}${card.suitSymbol}!`, 'success');
    }
    
    this.equippedWeapon = card;
    this.removeCardFromDungeon(index);
    this.score += 10;
    this.lastKilledMonsterDamage = 0; // Reset when equipping new weapon
    this.refillDungeon();
    this.checkGameEnd();
    this.logEvent('equip', `Equipped weapon: ${card.displayValue}${card.suitSymbol}`);
  }

  private fightMonster(card: Card, index: number): void {
    if (!this.equippedWeapon) {
      // Bare-handed combat - take full damage
      this.playerHealth -= card.damage;
      this.removeCardFromDungeon(index);
      this.score += card.damage; // Small score bonus for bravery
      
      this.showMessage(`Fought ${card.displayValue}${card.suitSymbol} bare-handed! Took ${card.damage} damage!`, 'error');
      this.refillDungeon();
      this.checkGameEnd();
      this.logEvent('bare_handed', `Fought bare-handed against monster: ${card.displayValue}${card.suitSymbol}`);
      return;
    }

    // Check if weapon can kill this monster
    if (card.damage > this.equippedWeapon.damage) {
      // Weapon too weak - fight bare-handed and take damage
      this.playerHealth -= card.damage;
      this.removeCardFromDungeon(index);
      this.score += card.damage; // Small score bonus for bravery
      
      this.showMessage(`Weapon too weak! Fought ${card.displayValue}${card.suitSymbol} bare-handed! Took ${card.damage} damage!`, 'error');
      this.refillDungeon();
      this.checkGameEnd();
      this.logEvent('bare_handed', `Weapon too weak against monster: ${card.displayValue}${card.suitSymbol}`);
      return;
    }

    // Check if weapon can kill based on last killed monster
    if (this.lastKilledMonsterDamage > 0 && card.damage > this.lastKilledMonsterDamage) {
      // Weapon restriction - fight bare-handed and take damage
      this.playerHealth -= card.damage;
      this.removeCardFromDungeon(index);
      this.score += card.damage; // Small score bonus for bravery
      
      this.showMessage(`Weapon restriction! Fought ${card.displayValue}${card.suitSymbol} bare-handed! Took ${card.damage} damage!`, 'error');
      this.refillDungeon();
      this.checkGameEnd();
      this.logEvent('bare_handed', `Weapon restriction against monster: ${card.displayValue}${card.suitSymbol}`);
      return;
    }

    // Successfully kill the monster
    this.lastKilledMonsterDamage = card.damage;
    this.removeCardFromDungeon(index);
    this.score += card.damage * 10;
    
    this.showMessage(`Defeated ${card.displayValue}${card.suitSymbol} (${card.damage} DMG)!`, 'success');
    this.refillDungeon();
    this.checkGameEnd();
    this.logEvent('kill', `Defeated monster: ${card.displayValue}${card.suitSymbol}`);
  }

  discardWeapon(): void {
    if (!this.equippedWeapon) {
      this.showMessage('No weapon equipped!', 'error');
      return;
    }

    const weaponName = `${this.equippedWeapon.displayValue}${this.equippedWeapon.suitSymbol}`;
    this.showMessage(`Discarded ${weaponName}!`, 'info');
    this.equippedWeapon = null;
    this.lastKilledMonsterDamage = 0;
    this.logEvent('discard', `Discarded weapon: ${weaponName}`);
  }

  private removeCardFromDungeon(index: number): void {
    this.dungeon.splice(index, 1);
  }

  private checkGameEnd(): void {
    // Check for win condition: all 52 cards have been used
    if (this.deck.length === 0 && this.dungeon.length === 0) {
      this.gameWon = true;
      this.gameOver = true;
      this.showMessage('🎉 Congratulations! You used all 52 cards and won the game!', 'success');
      this.logEvent('heal', 'Game won! All 52 cards used!');
      // Keep music playing for victory celebration
    } 
    // Check for loss condition: health reaches 0 or below
    else if (this.playerHealth <= 0) {
      this.gameWon = false;
      this.gameOver = true;
      this.showMessage('💀 Game Over! You ran out of health!', 'error');
      this.logEvent('heal', 'Game over! Health depleted!');
      // Keep music playing for game over
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.message = message;
    this.messageType = type;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
} 