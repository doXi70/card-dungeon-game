import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Card} from '../models/card.model';
import {GameService} from '../services/game.service';

@Component({
  selector: 'app-card-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-game.component.html',
  styleUrls: ['./card-game.component.css']
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
