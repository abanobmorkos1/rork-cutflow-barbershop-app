import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole } from '@/types';
import { DEMO_USERS } from '@/mocks/data';

const AUTH_KEY = 'cutflow_auth';
const USERS_KEY = 'cutflow_users';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const [authData, usersData] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(USERS_KEY),
      ]);
      if (usersData) {
        setUsers(JSON.parse(usersData));
      }
      if (authData) {
        const parsed = JSON.parse(authData);
        const allUsers = usersData ? JSON.parse(usersData) : DEMO_USERS;
        const found = allUsers.find((u: User) => u.id === parsed.id);
        if (found) setUser(found);
      }
    } catch (e) {
      console.log('Error loading auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, _password: string): Promise<User | null> => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ id: found.id }));
      return found;
    }
    return null;
  }, [users]);

  const signup = useCallback(async (name: string, email: string, phone: string, role: UserRole, shopId?: string): Promise<User> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      shopId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setUser(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updated));
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ id: newUser.id }));
    return newUser;
  }, [users]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_KEY);
  }, []);

  return { user, users, isLoading, login, signup, logout };
});
