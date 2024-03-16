export interface UserAccount {
  id?: number;
  goldBalance: number;
}

export interface User {
  id: string;
  login: string;
  account: UserAccount;
}
