import React, { useState } from 'react';
import {
  X,
  User,
  IdentificationCard,
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
  const { setAuth, setRole } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('consumer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
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
          const resolvedRole: UserRole = (userMeta.role as UserRole) || 'consumer';
          setAuth(
            {
              id: data.user.id,
              email: data.user.email || '',
              role: resolvedRole,
              fullName: userMeta.full_name || data.user.email?.split('@')[0] || 'User',
              badgeNumber: userMeta.badge_number,
              jurisdiction: userMeta.jurisdiction,
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
          if (onSuccess) onSuccess(`Signed in successfully as ${resolvedRole}.`);
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
              role: selectedRole,
              badge_number: selectedRole === 'officer' ? badgeNumber : null,
              jurisdiction: selectedRole === 'officer' ? jurisdiction : null,
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
                role: selectedRole,
                fullName: fullName || 'User',
                badgeNumber: selectedRole === 'officer' ? badgeNumber : undefined,
                jurisdiction: selectedRole === 'officer' ? jurisdiction : undefined,
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
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Authentication operation failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);

    // Provide immediate demo session for local evaluation
    const demoUser = {
      id:
        role === 'officer'
          ? '11111111-1111-1111-1111-111111111111'
          : '22222222-2222-2222-2222-222222222222',
      email:
        role === 'officer'
          ? 'officer.verma@packdrashiti.gov.in'
          : 'citizen.sharma@example.com',
      role: role,
      fullName: role === 'officer' ? 'Inspector S. Verma' : 'Ramesh Sharma',
      badgeNumber: role === 'officer' ? 'DL-LM-INSP-0442' : undefined,
      jurisdiction: role === 'officer' ? 'Delhi Central Enforcement Zone' : undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAuth(demoUser, {
      accessToken: `demo_token_${role}_${Date.now()}`,
      refreshToken: `demo_refresh_${Date.now()}`,
      tokenType: 'bearer',
      expiresIn: 86400,
    });
    setRole(role);

    setIsLoading(false);
    if (onSuccess) {
      onSuccess(
        role === 'officer'
          ? 'Enforcement Officer Demo Access Activated (Badge: DL-LM-INSP-0442).'
          : 'Citizen Demo Access Activated.'
      );
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 p-4 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-card border border-neutral-200 bg-white shadow-modal z-10 flex flex-col max-h-[92vh] animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="PackDrashiti Emblem"
              className="h-10 w-10 rounded-md object-contain shadow-xs shrink-0"
            />
            <div>
              <h2
                id="auth-modal-title"
                className="text-base font-bold text-neutral-900 font-heading"
              >
                PackDrashiti Authentication
              </h2>
              <p className="text-xs text-neutral-500 font-sans">
                Legal Metrology Enforcement Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-navy-800"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-neutral-200 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition-colors border-b-2 font-heading ${
              mode === 'signin'
                ? 'border-navy-800 text-navy-800 bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 bg-neutral-50/60 font-medium'
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
            className={`py-3 text-center transition-colors border-b-2 font-heading ${
              mode === 'signup'
                ? 'border-navy-800 text-navy-800 bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 bg-neutral-50/60 font-medium'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-md border border-violation-border bg-violation-light p-3 text-xs text-violation">
              <WarningCircle size={16} weight="bold" className="mt-0.5 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Role Selector Pill */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 font-heading">
                    Account Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('consumer')}
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-all ${
                        selectedRole === 'consumer'
                          ? 'border-saffron-500 bg-saffron-50 text-saffron-800 shadow-xs'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <User size={15} weight="bold" />
                      Citizen Consumer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('officer')}
                      className={`flex items-center justify-center gap-1.5 rounded-md border p-2 text-xs font-semibold transition-all ${
                        selectedRole === 'officer'
                          ? 'border-navy-800 bg-navy-50 text-navy-800 shadow-xs'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <IdentificationCard size={15} weight="bold" />
                      Enforcement Officer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Inspector R. K. Verma"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                  />
                </div>

                {selectedRole === 'officer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                        Badge Number
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="DL-LM-INSP-0442"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                        Jurisdiction District
                      </label>
                      <input
                        type="text"
                        required
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        placeholder="Delhi Central"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                Official Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple size={16} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@nic.in or user@example.com"
                  className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-xs sm:text-sm text-neutral-900 focus:border-navy-800 focus:ring-2 focus:ring-navy-800/20 focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 font-heading">
                Secure Password
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

          {/* Instant Evaluation Demo Shortcuts */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center gap-1.5 text-2xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5 font-heading">
              <Sparkle size={13} weight="fill" className="text-saffron-500" />
              <span>Instant Evaluation Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('officer')}
                className="rounded-md border border-navy-200 bg-navy-50/70 p-2.5 text-left hover:bg-navy-100 hover:border-navy-300 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-navy-800"
              >
                <div className="font-bold text-xs text-navy-900 flex items-center gap-1.5 font-heading">
                  <IdentificationCard size={15} weight="bold" className="text-navy-800" />
                  Officer Mode
                </div>
                <div className="text-2xs text-navy-700 font-mono mt-0.5">
                  DL-LM-INSP-0442
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('consumer')}
                className="rounded-md border border-saffron-200 bg-saffron-50/70 p-2.5 text-left hover:bg-saffron-100 hover:border-saffron-300 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-saffron-500"
              >
                <div className="font-bold text-xs text-saffron-900 flex items-center gap-1.5 font-heading">
                  <User size={15} weight="bold" className="text-saffron-600" />
                  Citizen Mode
                </div>
                <div className="text-2xs text-saffron-700 mt-0.5">
                  Consumer Retail Scanner
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
