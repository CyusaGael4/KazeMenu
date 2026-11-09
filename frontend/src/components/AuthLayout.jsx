import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RouteMotionSurface } from './RouteMotion';

export default function AuthLayout({
  children,
  className = '',
  imageSrc = 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1400&q=85',
  imageAlt = 'Guests enjoying a meal together in a restaurant',
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <RouteMotionSurface as="main" className={`auth-page ${className}`}>
      <section className="auth-photo-panel">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="auth-photo"
        />
        <div className="auth-photo-overlay" />
      </section>
      <section className="auth-form-panel">
        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate('/')}
          aria-label="Back to home"
          title="Back to home"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>
        <div className="auth-form-wrap" key={pathname}>
          {children}
        </div>
      </section>
    </RouteMotionSurface>
  );
}
