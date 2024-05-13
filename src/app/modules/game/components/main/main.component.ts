import {
  Component,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Unit } from '@core/models';
import { GameService, RaidService, UnitsService } from '@core/services';
import { SessionService } from 'app/modules/auth/services';
import { map, switchMap } from 'rxjs';
import { HeroCardData } from '../../standalone/hero-card/hero-card.component';

export interface BoardUnit extends Unit {
  isLoading$: WritableSignal<boolean>;
}

export class BoardUnit {
  constructor(data: Unit) {
    this.isLoading$ = signal(false);

    Object.assign(this, data);
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  unitsService = inject(UnitsService);
  raidsService = inject(RaidService);
  sessionService = inject(SessionService);
  gameService = inject(GameService);

  units$ = signal<BoardUnit[]>([]);

  heroes = signal<HeroCardData[]>([]);

  get units(): BoardUnit[] {
    return this.units$();
  }

  ngOnInit(): void {
    this.unitsService
      .getAll()
      .pipe(
        map((units) => {
          return units.map((u) => {
            return new BoardUnit(u);
          });
        })
      )
      .subscribe({
        next: (res) => {
          this.units$.set(res);
        },
      });

    const user = this.sessionService.user;
    if (user && user.walletAddress) {
      this.getAddressTokens(user.walletAddress);
    }
  }

  onSendToRaid(unitId: number) {
    this.unitsService.sendToRaid(unitId).subscribe({
      next: (res) => {
        const { active_raid } = res;
        if (!active_raid) {
          throw new Error('No new raid found');
        }

        const changedUnitIndex = this.units.findIndex((u) => u.id === res.id);
        const unitToUpdate = {
          ...this.units[changedUnitIndex],
          active_raid: res.active_raid,
        };

        this.units[changedUnitIndex] = unitToUpdate;

        this.units$.set([...this.units]);
      },
    });
  }

  onRaidReturned(unitId: number): void {
    const index = this.units.findIndex((u) => u.id === unitId);

    this.unitsService
      .get(unitId)
      .pipe(map((u) => new BoardUnit(u)))
      .subscribe({
        next: (res) => {
          this.units[index] = res;
          this.units$.set([...this.units]);
        },
      });
  }

  onCollectRaidLoot(raidId: number) {
    this.raidsService.complete(raidId).subscribe({
      next: (res) => {
        const changedUnitIndex = this.units.findIndex(
          (u) => u.id === res.unit.id
        );

        this.units[changedUnitIndex] = new BoardUnit(res.unit);

        this.units$.set(this.units);
        this.sessionService.patchUserState({
          gameAccount: {
            goldBalance: res.goldBalance,
          },
        });
      },
    });
  }

  onUpgrade(unitId: number) {
    this.unitsService
      .upgrade(unitId)
      .pipe(
        switchMap((res) => {
          return this.unitsService.get(unitId);
        })
      )
      .subscribe({
        next: (res) => {
          const index = this.units.findIndex((u) => u.id === res.id);
          this.units[index] = new BoardUnit(res);

          this.units$.set([...this.units]);
        },
      });
  }

  onUpgradeCompleted(unitId: number): void {
    this.unitsService.get(unitId).subscribe({
      next: (res) => {
        const index = this.units.findIndex((u) => u.id === res.id);
        this.units[index] = new BoardUnit(res);

        this.units$.set([...this.units]);
      },
    });
  }

  async getAddressTokens(address: string) {
    const contract = this.gameService.getMonkeysContract();

    const tokensCount = await contract.balanceOf(address);

    const heroes = [];
    for (let i = 0; i < tokensCount; i++) {
      console.log('getting token meta...', i);
      const tokenId = await contract.tokenOfOwnerByIndex(address, i);

      const tokenUri: string = await contract.tokenURI(tokenId);

      const tokenMetaUrl = ipfsUriToHttp(tokenUri);
      const tokenMeta = await (await fetch(tokenMetaUrl)).json();
      const { image, name, attributes, dna, edition, description } = tokenMeta;

      heroes.push({
        imageSrc: ipfsUriToHttp(image),
        name,
        dna,
        attributes,
        edition,
        description,
      });
    }

    this.heroes.set(heroes);
  }
}

function ipfsUriToHttp(ipfsUri: string) {
  return `https://ipfs.io/ipfs/${String(ipfsUri).slice(7)}`;
}
