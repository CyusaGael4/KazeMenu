import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const RouteMotionContext = createContext('none');

const isGuestMenu = (pathname) => /^\/guest-restaurant\/[^/]+\/?$/.test(pathname);
const isGuestTracking = (pathname) => /^\/guest-restaurant\/[^/]+\/orders\/[^/]+\/?$/.test(pathname);

function getRouteMotion(from, to, navigationType, explicitMotion) {
  if (!from || from === to) return 'none';

  const forwardFlow = (
    (from === '/register' && to === '/app/orders')
    || (isGuestMenu(from) && isGuestTracking(to))
  );
  const backwardFlow = (
    (from === '/app/orders' && to === '/register')
    || (isGuestTracking(from) && isGuestMenu(to))
  );

  if (forwardFlow) return 'push-forward';
  if (backwardFlow) return 'push-back';
  if (navigationType !== 'POP' && explicitMotion === 'push-forward') return 'push-forward';
  if (navigationType !== 'POP' && explicitMotion === 'push-back') return 'push-back';
  return 'fade-through';
}

export function RouteMotionProvider({ children }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(null);
  const [motion, setMotion] = useState('none');

  useLayoutEffect(() => {
    const from = previousPath.current;
    setMotion(getRouteMotion(from, location.pathname, navigationType, location.state?.routeMotion));
    previousPath.current = location.pathname;
  }, [location.key, location.pathname, location.state, navigationType]);

  return (
    <RouteMotionContext.Provider value={motion}>
      {children}
    </RouteMotionContext.Provider>
  );
}

export function RouteMotionSurface({ as: Element = 'div', className = '', children, ...props }) {
  const location = useLocation();
  const motion = useContext(RouteMotionContext);
  const surfaceClassName = useMemo(
    () => `route-motion-surface route-motion-${motion}${className ? ` ${className}` : ''}`,
    [motion, className]
  );

  return (
    <Element key={location.pathname} className={surfaceClassName} {...props}>
      {children}
    </Element>
  );
}
