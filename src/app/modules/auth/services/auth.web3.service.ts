import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { web3 } from '@core/web3';
import {
  Observable,
  Subject,
  firstValueFrom,
  from,
  map,
  of,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthWeb3Service {
  http = inject(HttpClient);

  private eth = web3.eth;

  loginViaWallet() {
    return from(this.loginWithNonce());
  }

  private getNonce(address: string) {
    return this.http.get<{
      message: string;
      token: string;
    }>(`/v1/auth/web3/nonce`, {
      params: {
        address,
      },
    });
  }

  private login(signature: string, nonceToken: string) {
    return this.http.get<{
      accessToken: string;
    }>(`/v1/auth/web3/login`, {
      params: {
        signature,
      },
      headers: {
        ['Authorization']: nonceToken,
      },
    });
  }

  private async loginWithNonce() {
    const address = await firstValueFrom(this.tryGetAccount());
    if (!address) {
      return;
    }

    const { token: nonceToken, message } = await firstValueFrom(
      this.getNonce(address)
    );

    const signature = await this.eth.personal.sign(message, address, 'test');

    return firstValueFrom(this.login(signature, nonceToken));
  }

  getSavedAddress(): Observable<string | null> {
    return from(this.getAccounts()).pipe(
      map((accounts) => {
        if (accounts.length > 0) {
          return accounts[0];
        }
        return null;
      })
    );
  }

  tryGetAccount(): Observable<string | null> {
    return from(this.getAccounts()).pipe(
      switchMap((accounts) => {
        if (accounts.length > 0) {
          return of(accounts[0]);
        }

        return from(this.requestAccounts()).pipe(
          map(([requestedAccount]) => {
            return requestedAccount ?? null;
          })
        );
      })
    );
  }

  onAccountsChanged(): Observable<string[]> {
    const subject = new Subject<string[]>();
    this.eth.currentProvider?.on('accountsChanged', (accounts: string[]) => {
      subject.next(accounts);
    });

    return subject.asObservable();
  }

  private async getAccounts(): Promise<string[]> {
    try {
      return await this.eth.getAccounts();
    } catch (error) {
      return [];
    }
  }

  private async requestAccounts(): Promise<string[]> {
    try {
      return await web3.eth.requestAccounts();
    } catch (error) {
      return [];
    }
  }
}
