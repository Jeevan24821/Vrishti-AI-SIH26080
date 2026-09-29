import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserAccount } from '../types';

interface AuthContextType {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (nameOrAccount: string | UserAccount, email?: string, password?: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: async () => {},
});

import { loginUser, registerUser } from '../services/api';

const DEFAULT_ACCOUNTS: (UserAccount & { password?: string })[] = [
  {
    name: 'Dr. Chandrashekar Poojary',
    email: 'dr.poojary@vrishti-ai.org',
    password: 'password123',
    role: 'Senior Meteorological Officer',
    dpUrl: 'https://unavatar.io/dr.poojary@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Dr+Poojary&background=4f46e5&color=fff&bold=true'
  },
  {
    name: 'Dr. Chandrashekar Poojary',
    email: 'c.poojary@vrishti-ai.org',
    password: 'password123',
    role: 'Senior Meteorological Officer',
    dpUrl: 'https://unavatar.io/c.poojary@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Chandrashekar+Poojary&background=4f46e5&color=fff&bold=true'
  },
  {
    name: 'Operational Specialist',
    email: 'meteorologist@vrishti-ai.org',
    password: 'password123',
    role: 'IMD Meteorological Analyst',
    dpUrl: 'https://unavatar.io/meteorologist@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Meteorologist&background=0284c7&color=fff&bold=true'
  },
  {
    name: 'System Admin',
    email: 'admin@vrishti-ai.org',
    password: 'password123',
    role: 'System Administrator',
    dpUrl: 'https://unavatar.io/admin@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Admin&background=059669&color=fff&bold=true'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredSession() {
      try {
        const stored = await AsyncStorage.getItem('vrishti_active_user_session');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        // Session read error
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      throw new Error('Please enter both email and password.');
    }

    // 1. Attempt online authentication through backend API
    try {
      const resp = await loginUser(cleanEmail, cleanPassword);
      if (resp && resp.user) {
        const userObj: UserAccount = {
          name: resp.user.name,
          email: resp.user.email,
          role: resp.user.role,
          dpUrl: resp.user.dpUrl || resp.user.avatar,
        };
        setUser(userObj);
        await AsyncStorage.setItem('vrishti_active_user_session', JSON.stringify(userObj));
        return true;
      }
    } catch (apiErr: any) {
      // If server returned an explicit validation/credential error (400, 401, 404), rethrow it
      const msg = apiErr?.message || '';
      if (
        msg.includes('Invalid / wrong password') ||
        msg.includes('Account does not exist') ||
        msg.includes('Please enter both email and password')
      ) {
        throw apiErr;
      }
      // If server offline or network unreachable, fall through to verified offline accounts
    }

    // 2. Fallback to local accounts matching system default accounts
    let accounts: (UserAccount & { password?: string })[] = [...DEFAULT_ACCOUNTS];
    try {
      const stored = await AsyncStorage.getItem('vrishti_user_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accounts = [...DEFAULT_ACCOUNTS, ...parsed];
        }
      }
    } catch (e) {}

    const found = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error(`Account does not exist with email "${cleanEmail}".`);
    }

    if (found.password && found.password !== cleanPassword) {
      throw new Error('Invalid / wrong password. Please check your credentials.');
    }

    const sessionUser: UserAccount = {
      name: found.name,
      email: found.email,
      role: found.role,
      dpUrl: found.dpUrl,
    };

    setUser(sessionUser);
    await AsyncStorage.setItem('vrishti_active_user_session', JSON.stringify(sessionUser));
    return true;
  };

  const register = async (
    nameOrAccount: string | UserAccount,
    email?: string,
    password?: string,
    role?: string
  ): Promise<boolean> => {
    let accountName = '';
    let accountEmail = '';
    let accountRole = role || 'Meteorological Officer';

    if (typeof nameOrAccount === 'object') {
      accountName = nameOrAccount.name;
      accountEmail = nameOrAccount.email.trim().toLowerCase();
      accountRole = nameOrAccount.role || accountRole;
    } else {
      accountName = nameOrAccount;
      accountEmail = (email || '').trim().toLowerCase();
    }

    const cleanPassword = (password || '').trim();

    if (!accountName || !accountEmail || !cleanPassword) {
      throw new Error('Please fill out all required fields.');
    }

    // 1. Attempt online registration via backend API
    try {
      const resp = await registerUser(accountName, accountEmail, cleanPassword, accountRole);
      if (resp && resp.user) {
        const userObj: UserAccount = {
          name: resp.user.name,
          email: resp.user.email,
          role: resp.user.role,
          dpUrl: resp.user.dpUrl || resp.user.avatar,
        };
        setUser(userObj);
        await AsyncStorage.setItem('vrishti_active_user_session', JSON.stringify(userObj));
        return true;
      }
    } catch (apiErr: any) {
      if (apiErr?.message && apiErr.message.includes('already exists')) {
        throw apiErr;
      }
    }

    // 2. Offline register fallback
    let accounts: (UserAccount & { password?: string })[] = [];
    try {
      const stored = await AsyncStorage.getItem('vrishti_user_accounts');
      if (stored) accounts = JSON.parse(stored);
    } catch (e) {}

    const existing = [...DEFAULT_ACCOUNTS, ...accounts].find(a => a.email.toLowerCase() === accountEmail);
    if (existing) {
      throw new Error(`An account with email "${accountEmail}" already exists.`);
    }

    const newAcc = {
      name: accountName,
      email: accountEmail,
      password: cleanPassword,
      role: accountRole,
      dpUrl: `https://unavatar.io/${accountEmail}?fallback=https://ui-avatars.com/api/?name=${encodeURIComponent(accountName)}&background=4f46e5&color=fff&bold=true`
    };

    const updated = [...accounts, newAcc];
    await AsyncStorage.setItem('vrishti_user_accounts', JSON.stringify(updated));
    setUser(newAcc);
    await AsyncStorage.setItem('vrishti_active_user_session', JSON.stringify(newAcc));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('vrishti_active_user_session');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
