import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <main className="account-loading" role="status" aria-label="Logging in">
        <span className="account-loading-spinner" aria-hidden="true" />
        <span>Logging in...</span>
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
