import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import { requestPasswordResetOTP, resetPassword } from '../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../Js/theme';

export default function ForgotPasswordModal({ isOpen, onClose, onResetSuccess, defaultIdentifier = '' }) {
  // Steps: 'request' | 'reset' | 'success'
  const [step, setStep] = useState('request');

  // Form states
  const [identifier, setIdentifier] = useState(defaultIdentifier || '');
  const [prevDefaultIdentifier, setPrevDefaultIdentifier] = useState(defaultIdentifier);

  if (defaultIdentifier !== prevDefaultIdentifier) {
    setPrevDefaultIdentifier(defaultIdentifier);
    if (defaultIdentifier) {
      setIdentifier(defaultIdentifier);
    }
  }

  const [maskedEmail, setMaskedEmail] = useState('');
  const [resolvedUsername, setResolvedUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & countdown
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      toast.error('Please enter your username or registered email.');
      return;
    }

    setLoading(true);
    try {
      const data = await requestPasswordResetOTP(val);
      setMaskedEmail(data.email || 'your registered email');
      setResolvedUsername(data.username || val);
      setStep('reset');
      setCountdown(60);
      toast.success(data.message || 'Verification code sent!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to send reset code. Please check your username or email.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset with OTP
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    if (cleanOtp.length !== 6) {
      toast.error('Verification code must be exactly 6 digits.');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(identifier.trim(), cleanOtp, newPassword);
      setStep('success');
      toast.success(data.message || 'Password reset successfully!');
      if (onResetSuccess) {
        onResetSuccess(resolvedUsername || identifier.trim());
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to reset password. Please verify the code.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
    // Reset state after closing
    setTimeout(() => {
      setStep('request');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm text-white"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
            >
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500 font-medium">Recover your account securely</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: REQUEST OTP */}
            {step === 'request' && (
              <motion.form
                key="request-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestOTP}
                className="space-y-4"
              >
                <div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                    Enter your registered <strong>username</strong> or <strong>email address</strong>. We will send a secure 6-digit verification code to your email.
                  </p>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. kamlesh or you@company.com"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending verification code...
                      </>
                    ) : (
                      <>
                        Send Reset Code <ArrowRight size={16} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.form>
            )}

            {/* STEP 2: VERIFY OTP & ENTER NEW PASSWORD */}
            {step === 'reset' && (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-900">
                    <p className="font-semibold">Verification code sent!</p>
                    <p className="text-indigo-700/80 mt-0.5">
                      Check your inbox at <strong>{maskedEmail}</strong>.
                    </p>
                  </div>
                </div>

                {/* 6-Digit OTP Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      6-Digit Code
                    </label>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleRequestOTP}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    autoFocus
                    className="w-full py-3 px-4 text-center rounded-xl border border-slate-200 text-lg font-black tracking-[8px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-300 placeholder:tracking-normal"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
                    className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Resetting password...
                      </>
                    ) : (
                      <>
                        Reset Password <ArrowRight size={16} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.form>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && (
              <motion.div
                key="success-form"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Password Reset Complete</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                    Your password has been securely updated. You can now log into your account with your new credentials.
                  </p>
                </div>

                <div className="pt-2">
                  <PrimaryButton
                    type="button"
                    onClick={handleFinish}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                  >
                    Proceed to Login <ArrowRight size={16} />
                  </PrimaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
