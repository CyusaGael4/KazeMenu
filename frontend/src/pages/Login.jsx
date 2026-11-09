import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import BrandLogo from '../components/BrandLogo';

import usePageMeta from '../hooks/usePageMeta';

import AuthLayout from '../components/AuthLayout';

import Button from '../components/ui/Button';



const Login = () => {

  const { login } = useAuth();

  const navigate = useNavigate();

  usePageMeta({
    title: 'Log in',
    description: 'Sign in to your KazeMenu restaurant portal to manage orders, menus, tables and QR codes.',
    noIndex: true,
  });

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);



  const submit = async (event) => {

    event.preventDefault();

    if (loading) return;

    setError('');

    setLoading(true);

    try {

      await login(email.trim(), password);

      navigate('/app/orders', { replace: true });

    } catch (requestError) {

      setError(requestError.response?.data?.message || 'We could not sign you in. Check your connection and try again.');

    } finally {

      setLoading(false);

    }

  };



  return (

    <AuthLayout

      imageSrc="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=85"

      imageAlt="The interior of a warmly lit restaurant"

    >

      <BrandLogo className="auth-form-brand" />            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-black">Welcome back</h2>

      <form onSubmit={submit} className="auth-form">

        <div className="auth-field">

          <label htmlFor="login-email">Email</label>

          <div className="auth-input-wrap">

            <Mail size={18} aria-hidden="true" />

            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />

          </div>

        </div>

        <div className="auth-field">

          <label htmlFor="login-password">Password</label>

          <div className="auth-input-wrap">

            <LockKeyhole size={18} aria-hidden="true" />

            <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>

              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}

            </button>

          </div>

        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <Button type="submit" loading={loading} loadingLabel="Logging in..." disabled={!email.trim() || !password} className="mt-2 w-full">Sign in</Button>

      </form>

      <p className="mt-6 text-sm text-muted">

        New to KazeMenu? <Link to="/register" className="font-bold text-primary underline underline-offset-4">Create an account</Link>

      </p>

    </AuthLayout>

  );

};



export default Login;

