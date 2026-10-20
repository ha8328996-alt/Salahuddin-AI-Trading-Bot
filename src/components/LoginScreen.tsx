import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Cpu, 
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { authenticateClient, requestPasswordReset, AUTHORIZED_CLIENT } from '../utils/auth';
import { ClientUser } from '../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: ClientUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('salahuddin@client.terminal');
  const [password, setPassword] = useState('salahuddin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authenticateClient(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setErrorMessage('Unexpected server error during client authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail(AUTHORIZED_CLIENT.email);
    setPassword('salahuddin2026');
    setErrorMessage(null);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);
    setResetFeedback(null);
    try {
      const res = await requestPasswordReset(resetEmail);
      setResetFeedback(res);
    } catch {
      setResetFeedback({ success: false, message: 'Password reset request timed out.' });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans select-none">
      
      {/* Background ambient grid pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#2589FF 1px, transparent 1px), radial-gradient(#1A2230 1px, #080A0F 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }} 
      />

      {/* Top subtle glow banner */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#2589FF] to-transparent opacity-80" />

      {/* Central Login Container */}
      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          {/* Logo Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11151D] border border-[#1A2230] mb-3 shadow-lg shadow-black/60">
            <div className="w-2 h-2 rounded-full bg-[#2589FF] animate-pulse" />
            <span className="font-extrabold text-sm tracking-tight text-white font-mono">
              SALAHUDDIN <span className="text-[#2589FF]">AI</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1A2230] text-[#2589FF] font-mono uppercase tracking-wider font-semibold">
              Client Terminal
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Salahuddin Trading Terminal
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 font-mono">
            Salahuddin AI Trading Bot • Private Client Access
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#11151D] border border-[#1A2230] rounded-xl p-6 sm:p-7 shadow-2xl shadow-black/80 relative">
          
          {/* Status Indicator */}
          <div className="flex items-center justify-between border-b border-[#1A2230] pb-3 mb-5 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-[#2589FF]" />
              <span>PROTECTED CLIENT SESSION</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#1A2230] text-[#2589FF] font-medium border border-[#2589FF]/30">
              GATEWAY // ONLINE
            </span>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-[#FF3B4F]/10 border border-[#FF3B4F]/40 text-[#FF3B4F] text-xs flex items-start gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#FF3B4F]" />
              <div className="leading-relaxed font-sans">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Authorized Client Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A889B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="salahuddin@client.terminal"
                  className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2589FF] focus:ring-1 focus:ring-[#2589FF] transition font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">
                  Client Passcode
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetFeedback(null);
                    setIsResetModalOpen(true);
                  }}
                  className="text-[11px] text-[#2589FF] hover:underline font-mono"
                >
                  Forgot passcode?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7A889B]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2589FF] focus:ring-1 focus:ring-[#2589FF] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7A889B] hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Autofill Pill */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#080A0F] border border-[#1A2230] hover:border-[#2589FF]/50 text-[11px] text-[#94A3B8] hover:text-white transition group"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2589FF]" />
                  <span>Use Demo Client Credentials:</span>
                  <strong className="text-slate-200 font-mono">Salahuddin</strong>
                </span>
                <span className="text-[#2589FF] text-[10px] font-mono group-hover:translate-x-0.5 transition-transform">
                  Autofill →
                </span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#2589FF] hover:bg-[#1D74DB] active:scale-[0.99] text-white font-semibold text-xs tracking-wide transition flex items-center justify-center gap-2 shadow-lg shadow-[#2589FF]/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Client Access...</span>
                </>
              ) : (
                <>
                  <span>Enter Trading Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Access Policy Note */}
          <div className="mt-5 pt-4 border-t border-[#1A2230] text-[11px] text-[#7A889B] leading-relaxed">
            <p className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Strictly restricted access. Public registration is disabled.</span>
            </p>
            <p className="mt-1">
              To request authorization or invite a client account, contact the system administrator.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] font-mono text-[#7A889B]">
          <p>Salahuddin AI Trading Bot • Prototype Client Edition</p>
          <p className="text-[10px] text-slate-600 mt-0.5">
            Institutional Quantitative Model // Simulated Paper-Trading Prototype
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#11151D] border border-[#1A2230] rounded-xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded hover:bg-[#1A2230]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3 text-slate-100 font-mono text-xs">
              <KeyRound className="w-4 h-4 text-[#2589FF]" />
              <span className="font-bold">RESET CLIENT PASSCODE</span>
            </div>

            <p className="text-xs text-[#94A3B8] mb-4">
              Enter your registered client email to receive authorized authentication credentials.
            </p>

            {resetFeedback && (
              <div className={`p-2.5 rounded-lg mb-4 text-xs font-mono border ${
                resetFeedback.success 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : 'bg-[#FF3B4F]/10 border-[#FF3B4F]/40 text-[#FF3B4F]'
              }`}>
                {resetFeedback.message}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#94A3B8] mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  placeholder="salahuddin@client.terminal"
                  className="w-full bg-[#080A0F] border border-[#1A2230] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#2589FF] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-[#1A2230]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="px-4 py-1.5 rounded-lg bg-[#2589FF] hover:bg-[#1D74DB] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isResetLoading ? 'Sending...' : 'Send Recovery Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
