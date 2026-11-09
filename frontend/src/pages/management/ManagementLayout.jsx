import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, Download, LogOut, QrCode, Store, UserRound, Utensils } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/Skeleton';
import { RouteMotionSurface } from '../../components/RouteMotion';
import { isInstalledApp } from '../../utils/isInstalledApp';

const navigation = [
  { to: '/app/orders', label: 'Orders', icon: ClipboardList },
  { to: '/app/menu', label: 'Menu', icon: Utensils },
  { to: '/app/tables', label: 'Tables & QR', icon: QrCode },
  { to: '/app/profile', label: 'Profile', icon: UserRound },
];

export default function ManagementLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [restaurantLoading, setRestaurantLoading] = useState(true);
  const [restaurantError, setRestaurantError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState('');
  const [installed, setInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );

  useEffect(() => {
    const handleInstallAvailable = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
      setInstallMessage('KazeMenu has been installed.');
    };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!installMessage) return undefined;
    const timeoutId = window.setTimeout(() => setInstallMessage(''), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [installMessage]);

  useEffect(() => {
    let active = true;
    api.get('/api/restaurant/me')
      .then(({ data }) => {
        if (active) setRestaurant(data.data);
      })
      .catch(() => {
        if (active) setRestaurantError('Restaurant details could not be loaded.');
      })
      .finally(() => {
        if (active) setRestaurantLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleInstall = async () => {
    setInstallMessage('');
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        setInstallPrompt(null);
        setInstallMessage(outcome === 'accepted' ? 'KazeMenu is being installed.' : 'Installation was cancelled.');
      } catch {
        setInstallMessage('The install prompt could not be opened. Try again from your browser menu.');
      }
      return;
    }

    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent) && !window.navigator.standalone) {
      setInstallMessage('To install, open the Share menu in Safari and choose “Add to Home Screen”.');
      return;
    }

    setInstallMessage('Install is not available in this browser, or KazeMenu is already installed.');
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError('');
    try {
      await logout();
      navigate(isInstalledApp() ? '/login' : '/', { replace: true });
    } catch {
      setLogoutError('Could not log out. Check your connection and try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="pt-shell">
      <aside className="pt-rail">
        <div className="pt-brand">
          <span className="pt-brand-mark" aria-hidden="true"><Store size={18} /></span>
          <div className="pt-brand-text">
            <span className="pt-brand-label">Restaurant portal</span>
            {restaurantLoading
              ? <Skeleton className="h-5 w-32" aria-label="Loading restaurant name" />
              : <strong className="pt-brand-name" title={restaurant?.name || undefined}>{restaurant?.name || 'Restaurant'}</strong>}
          </div>
        </div>

        {restaurantError && <p className="pt-error" role="status">{restaurantError}</p>}

        <nav aria-label="Restaurant management" className="pt-nav">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `pt-nav-link ${isActive ? 'pt-nav-link-active' : ''}`}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-rail-foot">
          {!installed && (
            <button type="button" className="pt-rail-action" onClick={handleInstall}>
              <Download size={16} aria-hidden="true" />
              Install app
            </button>
          )}
          {installMessage && <p className="pt-rail-note" role="status">{installMessage}</p>}
          <button
            type="button"
            className="pt-rail-action"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <LogOut size={16} aria-hidden="true" />
            {loggingOut ? 'Logging out...' : 'Log out'}
          </button>
          {logoutError && <p className="pt-error" role="alert">{logoutError}</p>}
        </div>
      </aside>

      <main className="pt-main">
        <div className="pt-page">
          <RouteMotionSurface>
            <Outlet context={{ restaurant, setRestaurant }} />
          </RouteMotionSurface>
        </div>
      </main>
    </div>
  );
}
