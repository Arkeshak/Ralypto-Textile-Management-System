import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useAuthStore } from '../stores/auth.store';
import { useToastStore } from '../stores/toast.store';
import { PressButton, quick } from '../lib/motion';

export const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const { push: pushToast } = useToastStore();
  const [authMethod, setAuthMethod] = useState<'pin' | 'email'>('pin');
  const [mode, setMode] = useState<'login' | 'setup'>('login');

  // PIN Login state
  const [pin, setPin] = useState<string>('');
  const [isWrongPin, setIsWrongPin] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Manager' | 'Cashier' | 'Storekeeper'>('Owner');

  // Email login form
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

  // Fast PIN handling: correct PIN is any 4 digits (e.g. 1234 or 2026), wrong PIN triggers shake
  const handlePinInput = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === '0000') {
        // Simulated Wrong PIN -> short horizontal shake, then clear
        setIsWrongPin(true);
        setTimeout(() => {
          setPin('');
          setIsWrongPin(false);
        }, 500);
      } else {
        // Successful PIN login
        executeLoginForRole(selectedRole);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const executeLoginForRole = async (roleName: string) => {
    setIsLoading(true);
    setError(null);
    const roleEmail =
      roleName === 'Manager'
        ? 'manager@ralypto.lk'
        : roleName === 'Cashier'
        ? 'cashier@ralypto.lk'
        : roleName === 'Storekeeper'
        ? 'cashier@ralypto.lk'
        : 'owner@ralypto.lk';

    try {
      const res = await api.post('/auth/login', { email: roleEmail, password: 'password123' });
      if (res.success && res.data) {
        const { token, user, business, branches } = res.data;
        // Adjust role for storekeeper demo test
        if (roleName === 'Storekeeper') {
          user.role = 'Storekeeper';
        }
        setAuth(token, user, business, branches);
        pushToast(`Welcome back, ${user.name}!`, 'ok');
      } else {
        throw new Error(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.data) {
        const { token, user, business, branches } = res.data;
        setAuth(token, user, business, branches);
        pushToast(`Welcome back, ${user.name}!`, 'ok');
      } else {
        throw new Error(res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Check email and password.');
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
        currency: 'Rs',
        timezone: 'Asia/Colombo',
        ownerName,
        ownerEmail,
        ownerPassword,
      });
      if (res.success && res.data) {
        const { token, user, business, branch } = res.data;
        setAuth(token, user as any, business, [branch]);
        pushToast('Boutique setup completed successfully!', 'ok');
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
      {/* Left decorative panel (Cinematic Editorial Background) */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[50%] flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-neutral-800"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.3) 100%), url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-hidden="true"
      >
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
              <div className="text-white font-bold text-lg leading-tight tracking-tight">Ralypto Textile OS</div>
              <div className="text-neutral-400 text-2xs uppercase tracking-wider font-semibold">Boutique & Retail ERP</div>
            </div>
          </div>
        </div>

        {/* Center headline */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-white text-3xl xl:text-4xl font-extrabold leading-[1.15] tracking-tight">
              Your boutique,<br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #5AC8FA 0%, #C9956A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                beautifully managed.
              </span>
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed max-w-md font-medium">
              POS · Garment Matrix · Stock Ledger · Closet 3D Showcase · Production Stages · Thermal Receipts in Rs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Point of Sale', 'Stock Ledger', 'Closet Showcase', 'Stage Board', 'Rs Currency', 'Thermal Receipts'].map((f) => (
              <span
                key={f}
                className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-neutral-400 text-xs font-medium">
            Designed for Sri Lankan textile retailers & clothing boutiques
          </p>
        </div>
      </div>

      {/* Right: Auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-10 sm:px-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? (authMethod === 'pin' ? 'Fast PIN Sign In' : 'Sign in to Store') : 'Set up your boutique'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? authMethod === 'pin'
                  ? 'Tap your role and enter your 4-digit PIN for instant access.'
                  : 'Enter your credentials to continue.'
                : 'Configure your clothing store in under a minute.'}
            </p>
          </div>

          {/* Mode switch */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            <button
              type="button"
              onClick={() => { setAuthMethod('pin'); setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' && authMethod === 'pin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              PIN Pad (POS)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' && authMethod === 'email'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Email Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('setup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'setup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              New Store
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              <AlertCircle strokeWidth={2} className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. PIN Screen (with spring pop dots & short horizontal shake on wrong PIN) */}
          {mode === 'login' && authMethod === 'pin' && (
            <div className="space-y-5">
              {/* Role selector */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Owner', 'Manager', 'Cashier', 'Storekeeper'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r);
                        setPin('');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                        selectedRole === r
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Dots (pop with small spring) */}
              <div className="py-2">
                <motion.div
                  animate={isWrongPin ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.35 }}
                  className="flex justify-center items-center gap-4 py-2"
                >
                  {[0, 1, 2, 3].map((i) => {
                    const filled = pin.length > i;
                    return (
                      <motion.div
                        key={i}
                        animate={{ scale: filled ? [1, 1.35, 1] : 1 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                        className={`w-4 h-4 rounded-full transition-colors ${
                          filled ? 'bg-blue-600 shadow-sm shadow-blue-500/40' : 'bg-slate-200'
                        }`}
                      />
                    );
                  })}
                </motion.div>
                <p className="text-center text-xs text-slate-400 mt-1">
                  {isWrongPin ? <span className="text-red-600 font-bold">Wrong PIN, cleared</span> : 'Enter any 4-digit PIN (try 1234)'}
                </p>
              </div>

              {/* Number Pad (Min 48px touch targets) */}
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      if (k === 'C') setPin('');
                      else if (k === '⌫') handleBackspace();
                      else handlePinInput(k);
                    }}
                    className="min-h-12 h-13 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-lg font-bold text-slate-800 transition-all flex items-center justify-center shadow-xs"
                  >
                    {k}
                  </button>
                ))}
              </div>

              {/* Fast continue button */}
              <PressButton
                onClick={() => executeLoginForRole(selectedRole)}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign in as {selectedRole}</span>}
              </PressButton>
            </div>
          )}

          {/* 2. Email Form */}
          {mode === 'login' && authMethod === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="login-email">Email address</label>
                <div className="relative">
                  <Mail strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="owner@ralypto.lk"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700" htmlFor="login-password">Password</label>
                <div className="relative">
                  <Lock strokeWidth={1.75} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 pl-10 pr-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <PressButton
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Continue to Dashboard</span>}
              </PressButton>

              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-center text-slate-400 mb-2">Instant demo accounts</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Owner', role: 'Owner' },
                    { label: 'Cashier', role: 'Cashier' },
                    { label: 'Manager', role: 'Manager' },
                  ].map(({ label, role }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => executeLoginForRole(role)}
                      className="py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* 3. Setup Store Form */}
          {mode === 'setup' && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700" htmlFor="setup-name">Boutique Name *</label>
                  <input
                    id="setup-name"
                    type="text"
                    required
                    placeholder="Ralypto Silk Studio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700" htmlFor="setup-phone">Phone *</label>
                    <input
                      id="setup-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700" htmlFor="setup-address">Address</label>
                    <input
                      id="setup-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700" htmlFor="setup-owner-name">Owner Name *</label>
                  <input
                    id="setup-owner-name"
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700" htmlFor="setup-owner-email">Owner Email *</label>
                  <input
                    id="setup-owner-email"
                    type="email"
                    required
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <PressButton
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Launch My Store →</span>}
              </PressButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
