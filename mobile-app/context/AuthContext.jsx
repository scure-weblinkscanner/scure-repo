import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({
  token: null,
  account: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedAccount = await AsyncStorage.getItem('account');
        if (storedToken) setToken(storedToken);
        if (storedAccount) setAccount(JSON.parse(storedAccount));
      } catch (error) {
        console.error('Failed to load auth:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (tokenValue, accountValue) => {
    await AsyncStorage.setItem('token', tokenValue);
    await AsyncStorage.setItem('account', JSON.stringify(accountValue));
    setToken(tokenValue);
    setAccount(accountValue);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('account');
    setToken(null);
    setAccount(null);
  };

  return (
    <AuthContext.Provider value={{ token, account, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);