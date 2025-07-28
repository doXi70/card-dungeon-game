export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  displayValue: string;
  suitSymbol: string;
  damage: number;
  heal: number;
} 