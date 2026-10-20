export interface ClientUser {
  id: string;
  email: string;
  name: string;
  role: 'client_principal' | 'administrator';
  accessLevel: 'Tier 1 - Institutional Private';
  clientId: string;
  loginAt: number;
  token: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: ClientUser | null;
  isLoading: boolean;
  error: string | null;
}
