import { Component, Input } from '@angular/core';

export interface HeroCardData {
  edition: number;
  imageSrc: string;
  name: string;
  attributes: any;
  dna: string;
  description: string;
}

@Component({
  selector: 'app-hero-card',
  standalone: true,
  imports: [],
  templateUrl: './hero-card.component.html',
  styleUrl: './hero-card.component.scss',
})
export class HeroCardComponent {
  @Input({ required: true }) hero!: HeroCardData;

  getUrl() {
    return `https://testnet.rarible.com/token/0x04938291720211bd16fac647e9884aa282bd456f:${this.hero.edition}`;
  }
}
