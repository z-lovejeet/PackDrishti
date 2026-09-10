import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  IdentificationCard,
  LockKey,
  EnvelopeSimple,
  Buildings,
  CheckCircle,
  WarningCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { Button } from './Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../utils/supabaseClient';
import type { UserRole } from '../../types/models';

interface AuthModalProps {
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

    // Provide immediate mock token and verified session for hackathon evaluation
    const demoUser = {
      id: role === 'officer' ? '11111111-1111-1111-1111-111111111111' : '22222222-2222-2222-2222-222222222222',
      email: role === 'officer' ? 'officer.verma@packdrashiti.gov.in' : 'citizen.sharma@example.com',
      role: role,
      fullName: role === 'officer' ? 'Inspector S. Verma' : 'Ramesh Sharma',
      badgeNumber: role === 'officer' ? 'LMO-DL-2024-991' : undefined,
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
          ? 'Enforcement Officer Demo Access Activated (Badge: LMO-DL-2024-991).'
          : 'Citizen Demo Access Activated.'
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F3A4C] text-white">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 font-heading">
                PackDrashiti Authentication
              </h2>
              <p className="text-xs text-neutral-500">Legal Metrology Portal Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'signin'
                ? 'border-[#0F3A4C] text-[#0F3A4C] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 bg-neutral-50'
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
            className={`py-3 text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-[#0F3A4C] text-[#0F3A4C] bg-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 bg-neutral-50'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <WarningCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Role Selector Pill */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Account Jurisdiction Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('consumer')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                        selectedRole === 'consumer'
                          ? 'border-[#0F3A4C] bg-[#0F3A4C]/5 text-[#0F3A4C]'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <User size={15} />
                      Citizen Consumer
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('officer')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs font-semibold transition-all ${
                        selectedRole === 'officer'
                          ? 'border-[#0F3A4C] bg-[#0F3A4C]/5 text-[#0F3A4C]'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <IdentificationCard size={15} />
                      Enforcement Officer
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Inspector R. K. Verma"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-[#0F3A4C] focus:ring-1 focus:ring-[#0F3A4C] outline-hidden"
                  />
                </div>

                {selectedRole === 'officer' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Badge Number
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder="LMO-DL-2024-XXXX"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-[#0F3A4C] focus:ring-1 focus:ring-[#0F3A4C] outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 mb-1">
                        Jurisdiction District
                      </label>
                      <input
                        type="text"
                        required
                        value={jurisdiction}
                        onChange={(e) => setJurisdiction(e.target.value)}
                        placeholder="Delhi Central"
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-[#0F3A4C] focus:ring-1 focus:ring-[#0F3A4C] outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Official Email Address
              </label>
              <div className="relative">
                <EnvelopeSimple size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@nic.in or user@example.com"
                  className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:border-[#0F3A4C] focus:ring-1 focus:ring-[#0F3A4C] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <LockKey size={15} className="absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-neutral-300 pl-9 pr-3 py-2 text-xs text-neutral-900 focus:border-[#0F3A4C] focus:ring-1 focus:ring-[#0F3A4C] outline-hidden"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center bg-[#0F3A4C] hover:bg-[#0B2C3A]"
              disabled={isLoading}
            >
              {isLoading
                ? 'Validating Credentials...'
                : mode === 'signin'
                ? 'Sign In to Portal'
                : 'Complete Registration'}
            </Button>
          </form>

          {/* Instant Evaluation Demo Shortcuts */}
          <div className="pt-3 border-t border-neutral-200">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              <Sparkle size={13} className="text-amber-500" />
              <span>Instant Hackathon Evaluation Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('officer')}
                className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-2 text-left hover:bg-indigo-100/70 transition-colors"
              >
                <div className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                  <IdentificationCard size={14} />
                  Officer Mode
                </div>
                <div className="text-[10px] text-indigo-700">Badge: LMO-DL-2024-991</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('consumer')}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-left hover:bg-neutral-100 transition-colors"
              >
                <div className="font-bold text-xs text-neutral-800 flex items-center gap-1">
                  <User size={14} />
                  Citizen Mode
                </div>
                <div className="text-[10px] text-neutral-600">Consumer Retail Scanner</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
