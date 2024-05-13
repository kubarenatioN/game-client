import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CryptoMonkeys } from '@core/tokens/abis';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private http = inject(HttpClient);

  constructor() {}

  getMonkeysContract(): CryptoMonkeys {
    return new CryptoMonkeys();
  }
}
