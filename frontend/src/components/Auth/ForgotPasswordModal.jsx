import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import { requestPasswordResetOTP, resetPassword } from '../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../Js/theme';

// Step 1: Yup Validation Schema for Requesting OTP
const requestSchema = yup.object().shape({
  identifier: yup
    .string()
    .trim()
    .required('Username or email is required')
    .min(3, 'Must be at least 3 characters')
    .max(150, 'Cannot exceed 150 characters')
    .test(
      'valid-identifier',
      'Please enter a valid username or email address',
      (value) => {
        if (!value) return false;
        // If it includes '@', check email format
        if (value.includes('@')) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        // Otherwise validate standard username format (alphanumeric, dots, underscores, dashes, no spaces)
        return /^[a-zA-Z0-9_.-]+$/.test(value);
      }
    )
});

// Step 2: Yup Validation Schema for OTP Verification & Password Reset
const resetSchema = yup.object().shape({
  otp: yup
    .string()
    .trim()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be exactly 6 digits'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(64, 'Password cannot exceed 64 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
});

// Password strength calculation helper
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', textColor: 'text-slate-400' };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-indigo-500', textColor: 'text-indigo-500' };
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
    default:
      return { score: 1, label: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500' };
  }
};

export default function ForgotPasswordModal({ isOpen, onClose, onResetSuccess, defaultIdentifier = '' }) {
  // Steps: 'request' | 'reset' | 'success'
  const [step, setStep] = useState('request');

  // Stored state between steps
  const [confirmedIdentifier, setConfirmedIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resolvedUsername, setResolvedUsername] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading & countdown
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Step 1: Form handling with Yup
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: requestErrors },
    setValue: setRequestValue,
    setError: setRequestError,
    reset: resetRequestForm
  } = useForm({
    resolver: yupResolver(requestSchema),
    defaultValues: {
      identifier: defaultIdentifier || ''
    },
    mode: 'onTouched'
  });

  // Step 2: Form handling with Yup
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
    setValue: setResetValue,
    control: controlReset,
    reset: resetResetForm
  } = useForm({
    resolver: yupResolver(resetSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onTouched'
  });

  const watchedNewPassword = useWatch({ control: controlReset, name: 'newPassword' }) || '';
  const watchedOtp = useWatch({ control: controlReset, name: 'otp' }) || '';

  const passwordStrength = getPasswordStrength(watchedNewPassword);

  // Synchronize defaultIdentifier when prop changes
  useEffect(() => {
    if (defaultIdentifier) {
      setRequestValue('identifier', defaultIdentifier, { shouldValidate: false });
    }
  }, [defaultIdentifier, setRequestValue]);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Modal cleanup and close handler
  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStep('request');
      resetRequestForm();
      resetResetForm();
      setMaskedEmail('');
      setResolvedUsername('');
      setConfirmedIdentifier('');
      setCountdown(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 300);
  }, [onClose, resetRequestForm, resetResetForm]);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  // Step 1: Submit Request OTP (Validated via Yup)
  const onHandleRequestOTP = async (data) => {
    const val = data.identifier.trim();
    setLoading(true);
    try {
      const res = await requestPasswordResetOTP(val);
      setConfirmedIdentifier(val);
      setMaskedEmail(res.email || 'your registered email');
      setResolvedUsername(res.username || val);
      setStep('reset');
      setCountdown(60);
      toast.success(res.message || 'Verification code sent!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        (val.includes('@')
          ? "This email doesn't exist. Please verify your email or change your email."
          : "This account doesn't exist. Please verify your username/email or change your email.");
      setRequestError('identifier', {
        type: 'manual',
        message: errorMsg
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0 || loading || !confirmedIdentifier) return;
    setLoading(true);
    try {
      const res = await requestPasswordResetOTP(confirmedIdentifier);
      setCountdown(60);
      toast.success(res.message || 'Verification code resent!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to resend code. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset with OTP & New Passwords (Validated via Yup)
  const onHandleResetPassword = async (data) => {
    setLoading(true);
    try {
      const res = await resetPassword(
        confirmedIdentifier,
        data.otp.trim(),
        data.newPassword
      );
      setStep('success');
      toast.success(res.message || 'Password reset successfully!');
      if (onResetSuccess) {
        onResetSuccess(resolvedUsername || confirmedIdentifier);
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

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
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
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                onSubmit={handleSubmitRequest(onHandleRequestOTP)}
                noValidate
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
                    <Mail
                      size={18}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${requestErrors.identifier ? 'text-rose-500' : 'text-slate-400'
                        }`}
                    />
                    <input
                      type="text"
                      placeholder="e.g. kamlesh or you@company.com"
                      autoFocus
                      {...registerRequest('identifier')}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 ${requestErrors.identifier
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                        }`}
                    />
                  </div>
                  {requestErrors.identifier && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" />
                      {requestErrors.identifier.message}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
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
                onSubmit={handleSubmitReset(onHandleResetPassword)}
                noValidate
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
                      onClick={handleResendOTP}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={12} />
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={watchedOtp}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setResetValue('otp', clean, { shouldValidate: true });
                    }}
                    placeholder="123456"
                    autoFocus
                    className={`w-full py-3 px-4 text-center rounded-xl border text-lg font-black tracking-[8px] text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 placeholder:tracking-normal ${resetErrors.otp
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                      }`}
                  />
                  {resetErrors.otp && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" />
                      {resetErrors.otp.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${resetErrors.newPassword ? 'text-rose-500' : 'text-slate-400'
                        }`}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      {...registerReset('newPassword')}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${resetErrors.newPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetErrors.newPassword && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" />
                      {resetErrors.newPassword.message}
                    </p>
                  )}

                  {/* Password Strength Meter */}
                  {watchedNewPassword && !resetErrors.newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500">Password strength:</span>
                        <span className={passwordStrength.textColor}>{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full transition-all duration-300 ${level <= passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${resetErrors.confirmPassword ? 'text-rose-500' : 'text-slate-400'
                        }`}
                    />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-type new password"
                      {...registerReset('confirmPassword')}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${resetErrors.confirmPassword
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
                      <AlertCircle size={13} className="shrink-0" />
                      {resetErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('request');
                      resetResetForm();
                    }}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-60 cursor-pointer"
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
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
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
