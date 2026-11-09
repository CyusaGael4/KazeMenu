import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PublicNavigation from './PublicNavigation';
import PublicFooter from './PublicFooter';
import { RouteMotionSurface } from './RouteMotion';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-warm">
      <PublicNavigation />
      <RouteMotionSurface as="main">
        <Outlet />
      </RouteMotionSurface>
      <PublicFooter />
    </div>
  );
}
