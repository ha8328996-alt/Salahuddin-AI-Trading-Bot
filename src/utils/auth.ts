import type { ClientUser } from '../types/auth.ts';

const SESSION_STORAGE_KEY = 'salahuddin_ai_auth_session';

// Authorized client details for demo authentication
export const AUTHORIZED_CLIENT = {
  email: 'salahuddin@client.terminal',
  name: 'Salahuddin',
  clientId: 'SLH-2026-X941',
  role: 'client_principal' as const,
  accessLevel: 'Tier 1 - Institutional Private' as const,
};

// Simple hash verification simulator
const VALID_PASSWORD_HASH = 'salahuddin2026';

export const getStoredSession = (): ClientUser | null => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as ClientUser;
    // Verify session validity (e.g. 7 days validity)
    if (Date.now() - session.loginAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const saveSession = (user: ClientUser): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const clearSession = (): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to clear session', e);
  }
};

export interface LoginResult {
  success: boolean;
  user?: ClientUser;
  error?: string;
}

export const authenticateClient = async (
  email: string,
  passcode: string
): Promise<LoginResult> => {
  // Simulate network/authorization latency for institutional feel
  await new Promise(resolve => setTimeout(resolve, 600));

  const normalizedEmail = email.trim().toLowerCase();

  // Strict client authorization verification
  if (normalizedEmail !== AUTHORIZED_CLIENT.email && normalizedEmail !== 'client@salahuddin.ai') {
    return {
      success: false,
      error: 'Access Denied: This account is not in the authorized client registry. Only authorized accounts created by the administrator have terminal access.',
    };
  }

  // Password verification
  if (passcode.trim() !== VALID_PASSWORD_HASH) {
    return {
      success: false,
      error: 'Authentication Failed: Invalid client credentials. Access prohibited.',
    };
  }

  const user: ClientUser = {
    id: 'usr_slh_9921',
    email: normalizedEmail,
    name: AUTHORIZED_CLIENT.name,
    role: AUTHORIZED_CLIENT.role,
    accessLevel: AUTHORIZED_CLIENT.accessLevel,
    clientId: AUTHORIZED_CLIENT.clientId,
    loginAt: Date.now(),
    token: `slh_token_${Math.random().toString(36).substring(2)}_${Date.now()}`,
  };

  saveSession(user);
  return { success: true, user };
};

export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail !== AUTHORIZED_CLIENT.email && normalizedEmail !== 'client@salahuddin.ai') {
    return {
      success: false,
      message: 'Account not recognized in the private client directory.',
    };
  }

  return {
    success: true,
    message: `A secure one-time passcode has been dispatched to ${normalizedEmail}. In this prototype demonstration, use default client credentials 'salahuddin2026' to sign in.`,
  };
};
