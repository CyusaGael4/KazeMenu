import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const AUTH_CACHE_KEY = 'kazemenu-auth';

const readAuthCache = () => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(AUTH_CACHE_KEY) || 'null');
    if (!cached?.user) return null;
    return {
      user: cached.user,
      memberships: Array.isArray(cached.memberships) ? cached.memberships : [],
    };
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [cachedAuth] = useState(readAuthCache);
  const [user, setUser] = useState(cachedAuth?.user || null);
  const [memberships, setMemberships] = useState(cachedAuth?.memberships || []);
  const [loading, setLoading] = useState(!cachedAuth);
  const authRequestId = useRef(0);

  const saveAuthCache = (nextUser, nextMemberships) => {
    try {
      if (nextUser) {
        sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
          user: nextUser,
          memberships: nextMemberships,
        }));
      } else {
        sessionStorage.removeItem(AUTH_CACHE_KEY);
      }
    } catch {
      // The server session remains authoritative when browser storage is unavailable.
    }
  };

  const refresh = async () => {
    const requestId = ++authRequestId.current;
    try {
      const { data } = await api.get('/api/auth/me');
      if (requestId === authRequestId.current) {
        const nextUser = data.data.user;
        const nextMemberships = data.data.memberships || [];
        setUser(nextUser);
        setMemberships(nextMemberships);
        saveAuthCache(nextUser, nextMemberships);
      }
    } catch (error) {
      if (requestId === authRequestId.current) {
        if ([401, 403].includes(error.response?.status)) {
          setUser(null);
          setMemberships([]);
          saveAuthCache(null, []);
        }
      }
    } finally {
      if (requestId === authRequestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    authRequestId.current += 1;
    setUser(data.data.user);
    const nextMemberships = data.data.memberships || [];
    setMemberships(nextMemberships);
    saveAuthCache(data.data.user, nextMemberships);
    setLoading(false);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload);
    authRequestId.current += 1;
    setUser(data.data.user);
    const nextMemberships = data.data.restaurant?.id
      ? [{ restaurantId: data.data.restaurant.id, role: 'owner' }]
      : [];
    setMemberships(nextMemberships);
    saveAuthCache(data.data.user, nextMemberships);
    setLoading(false);
    return data;
  };

  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setMemberships([]);
    saveAuthCache(null, []);
  };

  const activeMembership = memberships[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        restaurantId: activeMembership?.restaurantId || null,
        userRole: activeMembership?.role || null,
        loading,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
