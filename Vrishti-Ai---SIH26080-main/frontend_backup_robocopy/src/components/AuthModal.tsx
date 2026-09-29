import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, 
  CheckCircle2, Sparkles, CloudRain, AlertCircle, RefreshCw, LogIn,
  Eye, EyeOff
} from 'lucide-react';

export interface UserAccount {
  name: string;
  email: string;
  password: string;
  role: string;
  dpUrl?: string;
}

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    name: 'Dr. Chandrashekar Poojary',
    email: 'dr.poojary@vrishti-ai.org',
    password: 'password123',
    role: 'Senior Meteorological Officer',
    dpUrl: 'https://unavatar.io/dr.poojary@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Dr+Poojary&background=4f46e5&color=fff&bold=true'
  },
  {
    name: 'Dr. Chandrashekar Poojary',
    email: 'c.poojary@vrishti-ai.org',
    password: 'password123',
    role: 'Senior Meteorological Officer',
    dpUrl: 'https://unavatar.io/c.poojary@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Chandrashekar+Poojary&background=4f46e5&color=fff&bold=true'
  },
  {
    name: 'Operational Specialist',
    email: 'meteorologist@vrishti-ai.org',
    password: 'password123',
    role: 'IMD Meteorological Analyst',
    dpUrl: 'https://unavatar.io/meteorologist@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Meteorologist&background=0284c7&color=fff&bold=true'
  },
  {
    name: 'System Admin',
    email: 'admin@vrishti-ai.org',
    password: 'password123',
    role: 'System Administrator',
    dpUrl: 'https://unavatar.io/admin@vrishti-ai.org?fallback=https://ui-avatars.com/api/?name=Admin&background=059669&color=fff&bold=true'
  }
];

export function getStoredAccounts(): UserAccount[] {
  try {
    const data = localStorage.getItem('vrishti_user_accounts');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load accounts from storage:', e);
  }
  return DEFAULT_ACCOUNTS;
}

export function saveStoredAccounts(accounts: UserAccount[]) {
  try {
    localStorage.setItem('vrishti_user_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save accounts to storage:', e);
  }
}

export function getAvatarUrl(email: string, name: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = encodeURIComponent(name || 'User');
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https://ui-avatars.com/api/?name=${cleanName}&background=4f46e5&color=fff&bold=true`;
}

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot' | 'verify_code';
  onClose: () => void;
  onSuccess: (user: { name: string; email: string; role: string; dpUrl?: string }) => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  canClose = true
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify_code'>(initialMode);
  const [accounts, setAccounts] = useState<UserAccount[]>(getStoredAccounts());
  
  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNonExistentEmail('');
    
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setLoading(false);
        setError(data.detail || 'Authentication failed. Please check credentials.');
        if (resp.status === 404) setNonExistentEmail(cleanEmail);
        return;
      }
      setLoading(false);
      onSuccess(data.user);
      onClose();
    } catch (err) {
      // Local fallback for offline mode
      setTimeout(() => {
        setLoading(false);
        const currentAccounts = getStoredAccounts();
        const account = currentAccounts.find(a => a.email.toLowerCase() === cleanEmail);

        if (!account) {
          setError(`Account does not exist with email "${cleanEmail}".`);
          setNonExistentEmail(cleanEmail);
          return;
        }

        if (password !== account.password) {
          setError('Invalid / wrong password. Please check your credentials or click "Forgot password?".');
          return;
        }

        const dp = account.dpUrl || getAvatarUrl(account.email, account.name);
        onSuccess({
          name: account.name,
          email: account.email,
          role: account.role,
          dpUrl: dp
        });
        onClose();
      }, 300);
    }
  };
  
  // Register Form State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [role, setRole] = useState('Senior Meteorologist');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Forgot & Verification Code State
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [codeTab, setCodeTab] = useState<'login_code' | 'reset_password'>('login_code');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [targetAccount, setTargetAccount] = useState<UserAccount | null>(null);

  // Status & Messaging State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nonExistentEmail, setNonExistentEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setNonExistentEmail('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNonExistentEmail('');

    const cleanEmail = regEmail.trim().toLowerCase();

    if (!fullName || !cleanEmail || !regPassword) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (regPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Vrishti AI Data Security Guidelines.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: cleanEmail,
          password: regPassword,
          role: role
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        setLoading(false);
        setError(data.detail || 'Registration failed.');
        return;
      }
      const currentAccounts = getStoredAccounts();
      const updated = [...currentAccounts, { name: fullName, email: cleanEmail, password: regPassword, role, dpUrl: data.user?.dpUrl }];
      setAccounts(updated);
      saveStoredAccounts(updated);
      setLoading(false);
      onSuccess(data.user);
      onClose();
    } catch (err) {
      setTimeout(() => {
        setLoading(false);
        const currentAccounts = getStoredAccounts();
        const existing = currentAccounts.find(a => a.email.toLowerCase() === cleanEmail);

        if (existing) {
          setError(`An account with email "${cleanEmail}" already exists. Please Sign In.`);
          return;
        }

        const dp = getAvatarUrl(cleanEmail, fullName);
        const newAcc: UserAccount = {
          name: fullName,
          email: cleanEmail,
          password: regPassword,
          role: role,
          dpUrl: dp
        };

        const updated = [...currentAccounts, newAcc];
        setAccounts(updated);
        saveStoredAccounts(updated);

        onSuccess({
          name: newAcc.name,
          email: newAcc.email,
          role: newAcc.role,
          dpUrl: dp
        });
        onClose();
      }, 400);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNonExistentEmail('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const currentAccounts = getStoredAccounts();
    const account = currentAccounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (!account) {
      setLoading(false);
      setError(`Account does not exist with email "${cleanEmail}".`);
      setNonExistentEmail(cleanEmail);
      return;
    }

    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });
      const data = await res.json();
      const code = data.code || Math.floor(100000 + Math.random() * 900000).toString();

      setGeneratedCode(code);
      setTargetAccount(account);
      setEnteredCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setLoading(false);
      setMode('verify_code');

      window.dispatchEvent(new CustomEvent('vrishti_email_dispatched', { detail: { email: cleanEmail, code } }));
    } catch (err) {
      console.error(err);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setTargetAccount(account);
      setEnteredCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setLoading(false);
      setMode('verify_code');

      window.dispatchEvent(new CustomEvent('vrishti_email_dispatched', { detail: { email: cleanEmail, code } }));
    }
  };

  const handleVerifyCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!enteredCode || enteredCode.trim() !== generatedCode) {
      setError(`Invalid verification code. Please enter the 6-digit code sent to ${forgotEmail}.`);
      return;
    }

    if (!targetAccount) {
      setError('Session expired. Please request a new verification code.');
      setMode('forgot');
      return;
    }

    if (codeTab === 'reset_password') {
      if (!newPassword || newPassword.length < 4) {
        setError('Please enter a new password (at least 4 characters).');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // Update password in storage
        const currentAccounts = getStoredAccounts();
        const updated = currentAccounts.map(a => 
          a.email.toLowerCase() === targetAccount.email.toLowerCase() 
            ? { ...a, password: newPassword } 
            : a
        );
        setAccounts(updated);
        saveStoredAccounts(updated);

        const dp = targetAccount.dpUrl || getAvatarUrl(targetAccount.email, targetAccount.name);
        setSuccessMsg('Password updated successfully! Signing you in...');

        setTimeout(() => {
          onSuccess({
            name: targetAccount.name,
            email: targetAccount.email,
            role: targetAccount.role,
            dpUrl: dp
          });
          onClose();
        }, 800);
      }, 600);

    } else {
      // Login with Verification Code directly
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const dp = targetAccount.dpUrl || getAvatarUrl(targetAccount.email, targetAccount.name);
        onSuccess({
          name: targetAccount.name,
          email: targetAccount.email,
          role: targetAccount.role,
          dpUrl: dp
        });
        onClose();
      }, 500);
    }
  };

  const handleSwitchToCreateAccount = (prefillEmail: string) => {
    setError('');
    setNonExistentEmail('');
    setRegEmail(prefillEmail);
    setMode('register');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-[560px] bg-white border border-slate-300 rounded-[28px] shadow-2xl overflow-hidden">
        
        {/* Top Gradient Header Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-500"></div>

        {/* Close Button */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-8 sm:p-10 space-y-6">
          
          {/* Header Brand Subtitle */}
          <div className="flex items-center space-x-2 text-xs font-extrabold tracking-widest text-indigo-600 uppercase">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-indigo-600" />
            </div>
            <span>Vrishti AI &bull; SIH26080 Portal</span>
          </div>

          {/* Mode 1: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In to Vrishti AI</h2>
                <p className="text-sm font-semibold text-slate-600 mt-1.5">
                  Access rainfall intelligence & regime-aware post-processing.
                </p>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  
                  {/* Account Not Found -> Create Account Suggestion Banner */}
                  {nonExistentEmail && (
                    <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                      <span className="text-slate-700">No account found with this email.</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchToCreateAccount(nonExistentEmail)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} noValidate autoComplete="off" className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-2">Work Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type="email"
                      name="vrishti_login_work_email"
                      id="vrishti_login_work_email"
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@vrishti-ai.org"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[48px] text-sm lg:text-base focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => { setForgotEmail(email); setMode('forgot'); setError(''); setNonExistentEmail(''); }}
                      className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="vrishti_login_user_password"
                      id="vrishti_login_user_password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={showPassword ? "Enter your password" : "••••••••••••"}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-12 h-[48px] text-sm lg:text-base focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 focus:outline-none cursor-pointer p-0.5 rounded transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label htmlFor="show_password_checkbox" className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="show_password_checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <span className="ml-2.5 text-xs text-slate-700 font-extrabold">
                      Show password
                    </span>
                  </label>

                  <label htmlFor="remember" className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                    <span className="ml-2 text-xs text-slate-700 font-extrabold">
                      Remember credentials
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to System</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600 font-semibold">
                  Don't have a Vrishti AI account?{' '}
                  <button
                    onClick={() => { setRegEmail(email); setMode('register'); setError(''); setNonExistentEmail(''); }}
                    className="font-extrabold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: CREATE ACCOUNT / REGISTER */}
          {mode === 'register' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Vrishti AI Account</h2>
                <p className="text-sm font-semibold text-slate-600 mt-1.5">
                  Register authorized credentials for SIH26080 Operational Intelligence.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-extrabold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type="text"
                      name="vrishti_reg_full_name"
                      autoComplete="off"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Chandrashekar Poojary"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Official Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type="email"
                      name="vrishti_reg_email"
                      autoComplete="off"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="c.poojary@vrishti-ai.org"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl px-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="Senior Meteorologist">Senior Meteorologist</option>
                    <option value="Research Scientist">Research Scientist / ML Engineer</option>
                    <option value="SIH Jury Evaluator">SIH 2026 Jury Evaluator</option>
                    <option value="Operational Analyst">IMD / Disaster Management Officer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Password</label>
                    <input
                      type="password"
                      name="vrishti_reg_password"
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl px-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      name="vrishti_reg_confirm_password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl px-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2.5 text-xs text-slate-700 font-extrabold leading-snug cursor-pointer">
                    I agree to the Vrishti AI Data Security Guidelines & Confidentiality Protocols.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ShieldCheck className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 text-center">
                <p className="text-xs text-slate-600 font-semibold">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); setNonExistentEmail(''); }}
                    className="font-extrabold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Mode 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
                <p className="text-sm font-semibold text-slate-600 mt-1.5">
                  Enter your registered work email address to receive password recovery instructions.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                  
                  {/* Account Not Found -> Suggest Create Account */}
                  {nonExistentEmail && (
                    <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                      <span className="text-slate-700">Account not found. Create one now?</span>
                      <button
                        type="button"
                        onClick={() => handleSwitchToCreateAccount(nonExistentEmail)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm cursor-pointer inline-flex items-center space-x-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-2">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@vrishti-ai.org"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[48px] text-sm lg:text-base focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Instructions & Verification Code</span>
                      <KeyRound className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setNonExistentEmail(''); }}
                    className="text-xs text-slate-600 font-bold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mode 4: VERIFY CODE & RESET PASSWORD */}
          {mode === 'verify_code' && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Email Verification & Password Reset</h2>
                <p className="text-sm font-semibold text-slate-600 mt-1">
                  Verification code sent to <span className="text-indigo-600 font-black">{forgotEmail}</span>.
                </p>
              </div>

              {/* Email Sent Banner Notification */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start space-x-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs text-indigo-950 font-bold space-y-1">
                  <p className="font-extrabold text-indigo-900 text-sm">📩 Check Your Email Inbox</p>
                  <p className="text-slate-700">We have sent a 6-digit verification code to <strong className="text-indigo-950">{forgotEmail}</strong>.</p>
                  <p className="text-[11px] text-slate-500">Please check your email inbox (and spam folder) for the code and enter it below to proceed.</p>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-extrabold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-extrabold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Mode Toggle Tabs: Sign In with Code vs Reset Password */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setCodeTab('login_code'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    codeTab === 'login_code' 
                      ? 'bg-white text-indigo-950 shadow-sm border border-slate-200 font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In With Code
                </button>
                <button
                  type="button"
                  onClick={() => { setCodeTab('reset_password'); setError(''); }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                    codeTab === 'reset_password' 
                      ? 'bg-white text-indigo-950 shadow-sm border border-slate-200 font-black' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Reset & Set New Password
                </button>
              </div>

              <form onSubmit={handleVerifyCodeSubmit} autoComplete="off" className="space-y-4">
                {/* 6-Digit Code Input */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Enter 6-Digit Verification Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                    <input
                      type="text"
                      name="vrishti_verification_code"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code from email"
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-mono font-black text-lg rounded-xl pl-12 pr-4 h-[48px] tracking-widest focus:outline-none focus:border-indigo-600 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Password Reset Fields */}
                {codeTab === 'reset_password' && (
                  <div className="space-y-3.5 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                        <input
                          type="password"
                          name="vrishti_new_password_field"
                          autoComplete="new-password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-indigo-600" />
                        <input
                          type="password"
                          name="vrishti_confirm_new_password_field"
                          autoComplete="new-password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold rounded-xl pl-12 pr-4 h-[46px] text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[50px] rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-base shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : codeTab === 'reset_password' ? (
                    <>
                      <span>Reset Password & Sign In</span>
                      <RefreshCw className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <span>Sign In With Code</span>
                      <LogIn className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-xs">
                  <button
                    type="button"
                    onClick={async () => {
                      setError('');
                      try {
                        const res = await fetch('/api/auth/send-verification-code', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: forgotEmail })
                        });
                        const data = await res.json();
                        setGeneratedCode(data.code || Math.floor(100000 + Math.random() * 900000).toString());
                        setSuccessMsg(`Resent verification code to ${forgotEmail}. Please check your email.`);
                      } catch {
                        const code = Math.floor(100000 + Math.random() * 900000).toString();
                        setGeneratedCode(code);
                        setSuccessMsg(`Resent verification code to ${forgotEmail}. Please check your email.`);
                      }
                    }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Resend Code to Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setNonExistentEmail(''); }}
                    className="text-slate-600 font-bold hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


