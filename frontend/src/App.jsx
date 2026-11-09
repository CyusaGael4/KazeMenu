import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import PublicLayout from './components/PublicLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import GuestRestaurant from './pages/GuestRestaurant';
import GuestOrderTracking from './pages/GuestOrderTracking';
import DemoMenuPage from './pages/DemoMenuPage';
import { HomePage, FeaturesPage, HowItWorksPage, FAQPage } from './pages/MarketingPages';
import ManagementLayout from './pages/management/ManagementLayout';
import Orders from './pages/management/Orders';
import MenuManagement from './pages/management/MenuManagement';
import TablesQR from './pages/management/TablesQR';
import RestaurantProfile from './pages/management/RestaurantProfile';
import { ToastProvider } from './components/ui/ToastProvider';
import { NotFoundPage, PrivacyPage, TermsPage } from './pages/LegalPages';
import { RouteMotionProvider } from './components/RouteMotion';
import { isInstalledApp } from './utils/isInstalledApp';

function AppRoutes() {
  const { pathname } = useLocation();
  const allowedInInstalledApp = pathname === '/login' || pathname === '/app' || pathname.startsWith('/app/');

  if (isInstalledApp() && !allowedInInstalledApp) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Sample menu - standalone page without header/footer */}
      <Route path="/demo-menu" element={<DemoMenuPage />} />
      <Route path="/demo" element={<Navigate to="/demo-menu" replace />} />
      <Route path="/for-restaurants" element={<Navigate to="/faq" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guest-restaurant/:slug?" element={<GuestRestaurant />} />
      <Route path="/guest-restaurant/:slug/orders/:trackingToken" element={<GuestOrderTracking />} />
      <Route
        path="/app"
        element={(
          <ProtectedRoute>
            <ManagementLayout />
          </ProtectedRoute>
        )}
      >
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<Orders />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="tables" element={<TablesQR />} />
        <Route path="profile" element={<RestaurantProfile />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <RouteMotionProvider>
            <AppRoutes />
          </RouteMotionProvider>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
