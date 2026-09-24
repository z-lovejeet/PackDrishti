import React, { useState } from 'react';
import {
  X,
  User,
  LockKey,
  EnvelopeSimple,
  WarningCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../utils/supabaseClient';
import type { UserRole } from '../../types/models';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && data.session) {
          const userMeta = data.user.user_metadata || {};
          const resolvedRole: UserRole = 'consumer';
          setAuth(
            {
              id: data.user.id,
              email: data.user.email || '',
              role: resolvedRole,
              fullName: userMeta.full_name || data.user.email?.split('@')[0] || 'Citizen Consumer',
              isActive: true,
              createdAt: data.user.created_at,
              updatedAt: data.user.updated_at || data.user.created_at,
            },
            {
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
              tokenType: 'bearer',
              expiresIn: data.session.expires_in || 3600,
            }
          );
          if (onSuccess) onSuccess('Signed in successfully.');
          onClose();
        }
      } else {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'consumer',
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          if (onSuccess) {
            onSuccess(
              data.session
                ? 'Account created and signed in successfully.'
                : 'Registration submitted. Please check email for confirmation link.'
            );
          }
          if (data.session) {
            setAuth(
              {
                id: data.user.id,
                email: data.user.email || '',
                role: 'consumer',
                fullName: fullName || 'Citizen Consumer',
                isActive: true,
                createdAt: data.user.created_at,
                updatedAt: data.user.created_at,
              },
              {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                tokenType: 'bearer',
                expiresIn: data.session.expires_in || 3600,
              }
            );
          }
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setAuth(
      {
        id: 'consumer-demo-01',
        email: 'consumer.sharma@example.com',
        role: 'consumer',
        fullName: 'Ramesh Sharma',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        accessToken: 'mock-jwt-token-consumer',
        refreshToken: 'mock-refresh-token-consumer',
        tokenType: 'bearer',
        expiresIn: 7200,
      }
    );
    if (onSuccess) {
      onSuccess('Citizen Consumer Demo Access Activated.');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-xl bg-white border border-neutral-200 shadow-modal overflow-hidden animate-slideUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700">
              <User size={18} weight="bold" />
            </div>
            <div>
              <h3 id="auth-modal-title" className="text-base font-bold text-neutral-900 font-heading">
                {mode === 'signin' ? 'Citizen Sign In' : 'Citizen Account Registration'}
              </h3>
              <p className="text-2xs text-neutral-500 font-sans">
                PackDrashiti Consumer Portal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tab selector: Sign in vs Register */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`rounded-md py-1.5 transition-all text-center ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`rounded-md py-1.5 transition-all text-center ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-2xs font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-violation-border bg-violation-light p-3 text-xs text-violation">
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ramesh Sharma"
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                Password
              </label>
              <div className="relative">
                <LockKey size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              loading={isLoading}
            >
              {mode === 'signin' ? 'Sign In to Portal' : 'Complete Registration'}
            </Button>
          </form>

          {/* Quick Demo Shortcut */}
          <div className="pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full rounded-md border border-saffron-200 bg-saffron-50/70 p-2.5 text-left hover:bg-saffron-100 hover:border-saffron-300 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-saffron-500"
            >
              <div className="font-bold text-xs text-saffron-900 flex items-center justify-between font-heading">
                <span className="flex items-center gap-1.5">
                  <Sparkle size={14} weight="fill" className="text-saffron-600" />
                  Quick Citizen Demo Access
                </span>
                <span className="text-2xs text-saffron-700 font-mono">One-click</span>
              </div>
              <div className="text-2xs text-saffron-700 mt-0.5">
                Instant access to consumer verification and health history
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
