import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserAccountById } from '../services/userAccount.service';

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
  const appState = useRef(AppState.currentState);
  const authRef = useRef({ token: null, account: null });

  useEffect(() => {
    authRef.current = { token, account };
  }, [token, account]);

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

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      const wasBackground = appState.current === 'background' || appState.current === 'inactive';
      const isNowActive = nextState === 'active';
      appState.current = nextState;

      if (wasBackground && isNowActive) {
        const { token: currentToken, account: currentAccount } = authRef.current;
        if (!currentToken || !currentAccount?.uaId) return;
        try {
          const fresh = await getUserAccountById(currentAccount.uaId, currentToken);
          setAccount(fresh);
          await AsyncStorage.setItem('account', JSON.stringify(fresh));
        } catch {
          // silently ignore — keep stale data if fetch fails
        }
      }
    });
    return () => subscription.remove();
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