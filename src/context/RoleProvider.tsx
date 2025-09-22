// context/RoleProvider.tsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {Role, User} from '../../types';

type Ctx = {
  user: User | null;
  setUser: (u: User | null) => void;
  setRole: (r: Role) => void;
};

const RoleContext = createContext<Ctx | null>(null);

export const RoleProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('user');
      if (saved) setUserState(JSON.parse(saved));
    })();
  }, []);

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem('user', JSON.stringify(u));
    else await AsyncStorage.removeItem('user');
  };

  const setRole = async (role: Role) => {
    if (!user) return;
    const updated = {...user, role};
    setUser(updated);
  };

  return (
    <RoleContext.Provider value={{user, setUser, setRole}}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
};