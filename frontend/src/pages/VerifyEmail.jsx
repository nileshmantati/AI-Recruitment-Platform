import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { verifyEmailOTP, resendVerificationOTP } from '../services/api';
import { GlassCard, TextField } from '../ui/AuthUI';
import PrimaryButton from '../components/PrimaryButton';
import { T } from '../Js/theme';
import toast from 'react-hot-toast';

const verifySchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email address is required'),
  otp: yup
    .string()
    .trim()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Verification code must be exactly 6 digits')
});

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialEmail = location.state?.email || '';
  const initialUsername = location.state?.username || '';

  const [email, setEmail] = useState(initialEmail);
  const [username] = useState(initialUsername);
  const [isEditingEmail, setIsEditingEmail] = useState(!initialEmail);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  const {
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(verifySchema),
    defaultValues: {
      email: initialEmail,
      otp: ''
    },
    mode: 'onTouched'
  });

  const watchedOtp = useWatch({ control, name: 'otp' }) || '';

  // Auto-redirect to login after successful verification
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => {
      navigate('/login', { state: { defaultUsername: username || email } });
    }, 2000);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate, username, email]);

  // Countdown timer for Resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Submit OTP verification
  const onSubmit = async (data) => {
    try {
      const targetEmail = email.trim() || data.email.trim();
      const res = await verifyEmailOTP(targetEmail, data.otp.trim());
      setIsSuccess(true);
      toast.success(res.message || 'Email verified successfully!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Verification failed. Please check the code and try again.';

      if (err.response?.data?.attempts_remaining !== undefined) {
        setAttemptsRemaining(err.response.data.attempts_remaining);
      }

      setError('otp', {
        type: 'manual',
        message: errorMsg
      });

      toast.error(errorMsg);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast.error('Please enter your email address to resend code.');
      setIsEditingEmail(true);
      return;
    }
    if (countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const res = await resendVerificationOTP(targetEmail);
      setCountdown(60);
      setAttemptsRemaining(null);
      setValue('otp', '', { shouldValidate: false });
      toast.success(res.message || 'A new verification code has been sent!');
    } catch (err) {
      const cooldownRemaining = err.response?.data?.cooldown;
      if (cooldownRemaining) {
        setCountdown(cooldownRemaining);
      }
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to resend code. Please try again later.';
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="py-12 flex items-center justify-center relative overflow-hidden min-h-[85vh]"
      style={{
        background: `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)`
      }}
    >
      <motion.div variants={itemVariants} className="relative z-10 w-full max-w-md px-6">
        <GlassCard className="px-8 py-7 shadow-2xl border border-white/60">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="verify-content"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                {/* Icon Header */}
                <div className="text-center mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                  >
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
                  <p className="mt-1.5 text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                    We sent a secure 6-digit verification code to confirm your account.
                  </p>
                </div>

                {/* Email Display Card & Edit Option */}
                <div className="mb-6 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Mail size={18} className="text-indigo-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700/80">Recipient Email</p>
                      <p className="text-xs font-black text-slate-900 truncate">
                        {email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(!isEditingEmail)}
                    className="ml-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
                  >
                    <Edit3 size={13} />
                    {isEditingEmail ? 'Done' : 'Change'}
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {/* Optional Email Field (when editing or missing) */}
                  {isEditingEmail && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <TextField
                        icon={Mail}
                        label="Email Address"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setValue('email', e.target.value, { shouldValidate: true });
                        }}
                        error={errors.email?.message}
                      />
                    </motion.div>
                  )}

                  {/* 6-Digit OTP Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        disabled={countdown > 0 || isResending}
                        onClick={handleResend}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-400 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw size={12} className={isResending ? 'animate-spin' : ''} />
                        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={watchedOtp}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setValue('otp', clean, { shouldValidate: true });
                      }}
                      placeholder="123456"
                      autoFocus
                      className={`w-full py-3.5 px-4 text-center rounded-2xl border text-xl font-black tracking-[10px] text-slate-900 focus:outline-none focus:ring-4 transition-all placeholder:text-slate-300 placeholder:tracking-normal ${errors.otp
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-200 bg-white focus:border-indigo-600 focus:ring-indigo-500/20'
                        }`}
                    />

                    {errors.otp && (
                      <p className="mt-2 text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0" />
                        {errors.otp.message}
                      </p>
                    )}

                    {attemptsRemaining !== null && attemptsRemaining > 0 && (
                      <p className="mt-1 text-[11px] text-amber-600 font-medium">
                        Attempts remaining: <strong>{attemptsRemaining} of 5</strong>
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <PrimaryButton
                    type="submit"
                    disabled={isSubmitting || watchedOtp.length !== 6}
                    className="w-full rounded-2xl py-3 mt-4 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Verifying code...
                      </>
                    ) : (
                      <>
                        Verify & Continue <ArrowRight size={18} />
                      </>
                    )}
                  </PrimaryButton>

                  <div className="pt-4 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back to Register
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="hover:underline transition-colors cursor-pointer"
                      style={{ color: T.primary }}
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-4"
              >
                <div className="w-18 h-18 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Email Verified!</h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed font-medium">
                    Your account has been successfully verified. You are now being redirected to log in.
                  </p>
                </div>
                <div className="pt-2">
                  <PrimaryButton
                    type="button"
                    onClick={() => navigate('/login', { state: { defaultUsername: username || email } })}
                    className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    Proceed to Login <ArrowRight size={16} />
                  </PrimaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
