import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSales } from '../types/database.types';

interface AuthContextType {
  user: UserSales | null;
  login: (user: UserSales, pin: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSales | null>(null);

  useEffect(() => {
    // Check local storage on initial load
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse auth_user from localStorage', e);
      }
    }
  }, []);

  const login = (selectedUser: UserSales, pin: string) => {
    // Basic PIN check. In a real app this would be hashed and checked against the DB securely.
    const expectedPin = selectedUser.pin || '123456'; // fallback for existing mock data
    if (pin === expectedPin) {
      setUser(selectedUser);
      localStorage.setItem('auth_user', JSON.stringify(selectedUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role || 'sales', // Default to sales if no role specified
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
