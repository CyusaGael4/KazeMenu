import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, Phone, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/ui/Button';
import usePageMeta from '../hooks/usePageMeta';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  usePageMeta({
    title: 'Create your restaurant account',
    description: 'Set up a KazeMenu restaurant account to publish a digital menu, create table QR codes and manage dine-in orders.',
  });
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', restaurantName: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!acceptTerms || !acceptPrivacy) {
      setError('Accept the Terms & Conditions and Privacy Policy to create your account.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        email: form.email,
        phone: form.phone.trim(),
        password: form.password,
        restaurantName: form.restaurantName.trim(),
        acceptTerms,
        acceptPrivacy,
      };
      await register({ ...payload, email: payload.email.trim() });
      navigate('/app/orders', { replace: true, state: { routeMotion: 'push-forward' } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not create your account. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      className="auth-page-register"
      imageSrc="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85"
      imageAlt="Restaurant table set for dinner"
    >
      <BrandLogo className="auth-form-brand" />
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-black">Create your account</h2>
      <form onSubmit={submit} className="auth-form auth-register-form">
        <div className="auth-register-fields">
          <div className="auth-field">
            <label htmlFor="register-restaurant">Restaurant name</label>
            <div className="auth-input-wrap">
              <Store size={18} aria-hidden="true" />
              <input id="register-restaurant" autoComplete="organization" value={form.restaurantName} onChange={set('restaurantName')} required />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="register-phone">Phone number</label>
            <div className="auth-input-wrap">
              <Phone size={18} aria-hidden="true" />
              <input id="register-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="e.g. +250 788 000 000" required />
            </div>
          </div>
          <div className="auth-field auth-register-restaurant-field">
            <label htmlFor="register-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={18} aria-hidden="true" />
              <input id="register-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={form.password} onChange={set('password')} required />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} aria-hidden="true" />
              <input id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} value={form.confirmPassword} onChange={set('confirmPassword')} required />
              <button type="button" className="auth-password-toggle" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'} aria-pressed={showConfirmPassword}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="auth-consent">
          <label><input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} required /> <span>I agree to the <Link to="/terms" className="font-bold text-primary underline underline-offset-2">Terms & Conditions</Link>.</span></label>
          <label><input type="checkbox" checked={acceptPrivacy} onChange={(event) => setAcceptPrivacy(event.target.checked)} required /> <span>I have read and accept the <Link to="/privacy" className="font-bold text-primary underline underline-offset-2">Privacy Policy</Link>.</span></label>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <Button type="submit" loading={loading} loadingLabel="Creating account..." disabled={!form.email.trim() || !form.restaurantName.trim() || !form.phone.trim() || form.password.length < 8 || !form.confirmPassword || !acceptTerms || !acceptPrivacy} className="button-solid w-full">Create account</Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Already have an account? <Link to="/login" className="font-bold text-primary underline underline-offset-4">Log in</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
