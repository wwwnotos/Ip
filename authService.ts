import { User } from '../types';

const STORAGE_KEY_USER = 'MOVOS_USER';
const STORAGE_KEY_ACCOUNTS = 'MOVOS_ACCOUNTS'; // Simulated DB

export const authService = {
  // Check if user is logged in
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  },

  // Login Logic
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const accountsStr = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const accounts = accountsStr ? JSON.parse(accountsStr) : [];
    
    // Simple check (in production, use backend with hashed passwords)
    const user = accounts.find((u: any) => u.email === email && u.password === password);

    if (user) {
      const sessionUser: User = { 
        name: user.name, 
        email: user.email, 
        joined: user.joined 
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
      return sessionUser;
    }

    throw new Error('Invalid email or password');
  },

  // Registration Logic
  register: async (name: string, email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const accountsStr = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    const accounts = accountsStr ? JSON.parse(accountsStr) : [];

    if (accounts.find((u: any) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      name,
      email,
      password, // In real app, never store plain text
      joined: new Date().getFullYear().toString()
    };

    accounts.push(newUser);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

    // Auto login
    const sessionUser: User = { name, email, joined: newUser.joined };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
    
    return sessionUser;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    // Optional: Clear history on logout
    // localStorage.removeItem('MOVOS_RECENT'); 
  }
};