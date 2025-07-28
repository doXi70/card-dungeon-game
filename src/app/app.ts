import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGameComponent } from './card-game/card-game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CardGameComponent],
  template: `
    <div class="app-container">
      <h1>Card Dungeon Game</h1>
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
    
    h1 {
      text-align: center;
      color: white;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
  `]
})
export class App {
  title = 'Card Dungeon Game';
}
