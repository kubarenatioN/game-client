export interface UserGameAccount {
  id?: number;
  goldBalance: number;
}

export interface User {
  id: string;
  login?: string;
  gameAccount: UserGameAccount;
  walletAddress?: string;
}
