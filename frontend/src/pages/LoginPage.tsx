import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  Shirt,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth.store';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'setup'>('login');

  // Login form
  const [email, setEmail] = useState('owner@ralypto.lk');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Setup form
  const [businessName, setBusinessName] = useState('Ralypto Silk Boutique');
  const [phone, setPhone] = useState('+94 11 258 9632');
  const [address, setAddress] = useState('Galle Road, Colombo 03');
  const [ownerName, setOwnerName] = useState('Boutique Owner');
  const [ownerEmail, setOwnerEmail] = useState('boutique@ralypto.lk');
  const [ownerPassword, setOwnerPassword] = useState('password123');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { token, user, business, branches } = res.data;
        setAuth(token, user, business, branches);
      } else {
        throw new Error(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email: roleEmail, password: 'password123' });
      if (res.success && res.data) {
        const { token, user, business, branches } = res.data;
        setAuth(token, user, business, branches);
      } else {
        throw new Error(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register-setup', {
        businessName,
        phone,
        address,
        email: ownerEmail,
        currency: 'LKR',
        timezone: 'Asia/Colombo',
        ownerName,
        ownerEmail,
        ownerPassword,
      });
      if (res.success && res.data) {
        const { token, user, business, branch } = res.data;
        setAuth(token, user as any, business, [branch]);
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete store setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* === Left decorative panel (Cinematic Editorial Background) === */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[50%] flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-neutral-800"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      >
        {/* Subtle ambient light */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand mark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
              style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)' }}
            >
              LT
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight tracking-tight">Luxe Threads</div>
              <div className="text-neutral-400 text-2xs uppercase tracking-wider font-semibold">Textile & Fashion OS</div>
            </div>
          </div>
        </div>

        {/* Center headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-white text-3xl xl:text-4xl font-extrabold leading-[1.15] tracking-tight">
              Your boutique,<br />
              <span style={{
                background: 'linear-gradient(135deg, #5AC8FA 0%, #C9956A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                beautifully managed.
              </span>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-md font-medium">
              POS · Garment Matrix · Stock Ledger · Customers · AI Virtual Try-On — everything a luxury clothing boutique and textile store needs in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Point of Sale', 'Stock Ledger', 'AI Try-On', 'Colombo & Kandy Branches', 'LKR Currency', 'Thermal Receipts'].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-neutral-400 text-xs font-medium">
            Designed for Sri Lankan textile retailers & clothing boutiques · Public Demo Ready
          </p>
        </div>
      </div>

      {/* === Right: Auth panel === */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 sm:px-12">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Mobile brand mark */}
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)' }}
            >
              R
            </div>
            <span className="text-base font-bold text-label-primary">Ralypto</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-label-primary tracking-tight">
              {mode === 'login' ? 'Sign in' : 'Set up your boutique'}
            </h1>
            <p className="text-sm text-label-secondary mt-1">
              {mode === 'login'
                ? 'Welcome back. Enter your credentials to continue.'
                : 'Configure your clothing store in under a minute.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-surface-secondary p-1 gap-1">
            {(['login', 'setup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ${
                  mode === m
                    ? 'bg-white text-label-primary shadow-sm'
                    : 'text-label-secondary hover:text-label-primary'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'New Store'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-error-50 border border-error-100 rounded-xl text-error-700 text-xs animate-slide-down">
              <AlertCircle strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Login Form ── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="form-group">
                <label className="input-label" htmlFor="login-email">Email address</label>
                <div className="relative">
                  <Mail strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-label-tertiary pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@boutique.lk"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label" htmlFor="login-password">Password</label>
                <div className="relative">
                  <Lock strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-label-tertiary pointer-events-none" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary btn-lg w-full justify-center gap-2 shadow-action"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight strokeWidth={2} className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick demo roles */}
              <div className="pt-4 border-t border-separator">
                <p className="section-label text-center mb-3">Demo accounts</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Owner', email: 'owner@ralypto.lk' },
                    { label: 'Cashier', email: 'cashier@ralypto.lk' },
                    { label: 'Manager', email: 'manager@ralypto.lk' },
                  ].map(({ label, email: e }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleQuickDemo(e)}
                      className="py-2 text-xs font-semibold text-label-secondary bg-surface-secondary hover:bg-surface-tertiary hover:text-action-500 rounded-lg transition-colors duration-150"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ── Setup Form ── */}
          {mode === 'setup' && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-3">
                <div className="section-label pb-1">Store details</div>
                <div className="form-group">
                  <label className="input-label" htmlFor="setup-name">Boutique name *</label>
                  <div className="relative">
                    <Building2 strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-label-tertiary pointer-events-none" />
                    <input
                      id="setup-name"
                      type="text"
                      required
                      placeholder="Elegance Silk Studio"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="form-row grid-cols-2">
                  <div className="form-group">
                    <label className="input-label" htmlFor="setup-phone">Phone *</label>
                    <input id="setup-phone" type="tel" required placeholder="+94 11 258 9632"
                      value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
                  </div>
                  <div className="form-group">
                    <label className="input-label" htmlFor="setup-address">Address</label>
                    <input id="setup-address" type="text" placeholder="Colombo 03"
                      value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="section-label pb-1 border-t border-separator pt-4">Owner account</div>
                <div className="form-group">
                  <label className="input-label" htmlFor="setup-owner-name">Your name *</label>
                  <input id="setup-owner-name" type="text" required value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="input-label" htmlFor="setup-owner-email">Email *</label>
                  <input id="setup-owner-email" type="email" required value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)} className="input-field" />
                </div>
                <div className="form-group">
                  <label className="input-label" htmlFor="setup-owner-password">Password *</label>
                  <input id="setup-owner-password" type="password" required value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)} className="input-field" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary btn-lg w-full justify-center gap-2 shadow-action"
              >
                {isLoading ? 'Creating store…' : 'Launch My Boutique →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
