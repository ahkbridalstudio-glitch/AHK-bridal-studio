import React, { useState } from 'react';
import {
  Lock,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  Sparkles,
  MapPin,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default allowed passcodes
  const validCredentials = [
    { email: 'admin@ahkbridal.com', passcode: 'ahk2026' },
    { email: 'admin', passcode: 'ahk2026' },
    { email: 'karachi@ahkbridal.com', passcode: '322258' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPasscode = passcode.trim();

    // Check credentials or default passcode
    const isValid =
      validCredentials.some(
        (cred) =>
          (inputEmail === cred.email || !inputEmail) && inputPasscode === cred.passcode
      ) ||
      inputPasscode === 'ahk2026' ||
      inputPasscode === '322258' ||
      inputPasscode === 'admin123';

    setTimeout(() => {
      if (isValid) {
        sessionStorage.setItem('ahk_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid admin credentials. Please enter the correct atelier passcode.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleFillDemo = () => {
    setEmail('admin@ahkbridal.com');
    setPasscode('ahk2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0D0B0E] text-[#ECE5D8] flex flex-col justify-center items-center p-4 relative font-sans selection:bg-[#C5A059] selection:text-[#180E12]">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7A0C1E]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Restricted Card */}
      <div className="relative w-full max-w-md bg-[#161217] border border-[#352538] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7A0C1E] to-[#4A0E17] border border-[#C5A059]/50 text-[#E5C378] shadow-lg mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-semibold">
              <Shield className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>Restricted Access · Authorized Personnel</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              AHK Atelier Admin
            </h2>
            <p className="text-xs text-stone-400">
              Dolmen Mall Tariq Road Flagship · E-Commerce & Karigar Management Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5 font-medium">
              Admin Identity / Email
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@ahkbridal.com"
              className="w-full px-3.5 py-2.5 bg-[#1F1821] border border-[#38283A] rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-1.5 font-medium">
              Security Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-3.5 py-2.5 pr-10 bg-[#1F1821] border border-[#38283A] rounded-xl text-xs font-mono text-white placeholder-stone-500 focus:outline-none focus:border-[#C5A059] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#7A0C1E] to-[#920F24] hover:from-[#920F24] hover:to-[#A71129] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-[#E5C378]" />
                <span>Unlock Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

       

        {/* Return to Public Website */}
        <div className="pt-2 border-t border-[#2C222A] text-center">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-[#C5A059] transition-colors font-mono cursor-pointer"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Return to Public Boutique Storefront</span>
          </button>
        </div>
      </div>

      {/* Footer Location Note */}
      <div className="mt-8 text-center text-xs text-stone-600 font-mono">
        AHK BRIDAL STUDIO · Dolmen Mall Tariq Road (Shop G-32), Karachi, Pakistan
      </div>
    </div>
  );
};
