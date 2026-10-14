import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';
import FormField from '../../components/FormField/FormField';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { supabase } from '../../lib/supabase';
import './Login.css';

interface LoginProps {
  onLogin: (user: User) => void;
}

type Mode = 'login' | 'signup';

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string; password?: string; businessName?: string; general?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (mode === 'signup' && !businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: email.split('@')[0].replace(/[._]/g, ' '),
              business_name: businessName.trim(),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setErrors({ general: 'Account created! Please check your email to confirm, then log in.' });
          setMode('login');
          setLoading(false);
          return;
        }
        const meta = data.user?.user_metadata ?? {};
        onLogin({ id: data.user!.id, name: meta.name ?? email.split('@')[0], email: data.user!.email ?? email, businessName: meta.business_name ?? 'My Business' });
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const meta = data.user?.user_metadata ?? {};
        onLogin({ id: data.user.id, name: meta.name ?? email.split('@')[0], email: data.user.email ?? email, businessName: meta.business_name ?? 'My Business' });
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="screen login-screen">
      <div className="login-brand fade-in">
        <div className="login-brand__icon">📄</div>
        <div className="login-brand__name">InvoEasy</div>
        <div className="login-brand__tagline">
          E-invoicing made simple for everyone
        </div>
      </div>

      <div className="login-form fade-in" onKeyDown={handleKeyDown}>
        <div className="login-form__title">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </div>
        {errors.general && (
          <div style={{ color: '#c0392b', background: '#fdecea', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 12 }}>
            {errors.general}
          </div>
        )}
        <FormField
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined, general: undefined })); }}
          error={errors.email}
          required
          name="email"
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: undefined, general: undefined })); }}
          error={errors.password}
          required
          name="password"
        />
        {mode === 'signup' && (
          <FormField
            label="Business Name"
            placeholder="e.g. Nguyen's Shop"
            value={businessName}
            onChange={(v) => { setBusinessName(v); setErrors((e) => ({ ...e, businessName: undefined })); }}
            error={errors.businessName}
            required
            name="businessName"
          />
        )}
        <PrimaryButton onClick={handleSubmit} loading={loading}>
          {mode === 'login' ? 'Log in' : 'Sign up'}
        </PrimaryButton>
      </div>

      <div className="login-footer fade-in">
        {mode === 'login' ? (
          <>New here? <a href="/signup" onClick={(e) => { e.preventDefault(); setMode('signup'); setErrors({}); }}>Create an account</a></>
        ) : (
          <>Already have an account? <a href="/" onClick={(e) => { e.preventDefault(); setMode('login'); setErrors({}); }}>Log in</a></>
        )}
      </div>
    </div>
  );
}