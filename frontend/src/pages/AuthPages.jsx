import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  Loader2, 
  X,
  Briefcase,
  UserCheck
} from 'lucide-react';
import TrustHireLogo from '../components/ui/TrustHireLogo';
import AuthBackground from '../components/auth/AuthBackground';

// Reusable Password Reset Modal connected to official authentication recovery flow.
const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const { resetPassword } = useAuth();
  const [resetEmail, setResetEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetEmail.trim());
      setMessage(res?.message || 'Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err.message || 'Unable to send recovery instructions. Please verify the address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-labelledby="forgot-modal-title"
        aria-modal="true"
        className="relative w-full max-w-md bg-white border border-[#EAEAE5] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] rounded-3xl p-7 sm:p-8"
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF9F6] hover:bg-[#EAEAE5] text-[#121613] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121613]"
          aria-label="Close modal"
        >
          <X size={15} />
        </button>

        <div className="text-center mb-6">
          <div className="w-11 h-11 mx-auto rounded-full bg-[#F0442D]/10 text-[#F0442D] flex items-center justify-center mb-3">
            <Lock size={19} strokeWidth={2} />
          </div>
          <h2 id="forgot-modal-title" className="text-xl font-serif text-[#121613] tracking-tight">
            Reset your password
          </h2>
          <p className="text-xs text-[#6E6E66] mt-1.5 leading-relaxed font-sans">
            Enter the email associated with your TrustHire account and we'll send you recovery instructions.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
              Email address
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-5 rounded-full font-medium text-xs sm:text-sm text-white bg-[#F0442D] hover:bg-[#d63823] active:bg-[#c2301c] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] font-sans"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin text-white" />
                <span>Sending instructions...</span>
              </>
            ) : (
              <span>Send Recovery Link</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// LOGIN PAGE
// ==========================================
export function LoginPage() {
  const { user, role, login, loginWithOAuth, isSocialAuthEnabled } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Compute intended redirect destination
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const targetDestination = redirectParam || location.state?.from?.pathname || (role === 'recruiter' ? '/recruiter' : '/career');

  // Redirect existing authenticated users
  useEffect(() => {
    if (user) {
      navigate(targetDestination, { replace: true });
    }
  }, [user, targetDestination, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await login(trimmedEmail, password);
      const userMetadata = data?.user?.user_metadata || {};
      const userRole = userMetadata.role || role || 'candidate';
      const destination = redirectParam || (userRole === 'recruiter' ? '/recruiter' : '/career');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || 'Incorrect email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    if (loading) return;
    setError('');
    try {
      await loginWithOAuth(provider, 'candidate');
      navigate(targetDestination, { replace: true });
    } catch {
      setError(`Authentication with ${provider} failed. Please try signing in with email.`);
    }
  };

  return (
    <AuthBackground>
      {/* Centred Editorial Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 w-full">
        <div className="w-full max-w-[440px] mx-auto bg-white rounded-3xl border border-[#EAEAE5] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 sm:p-9 transition-all">
          
          {/* Top Emblem Logo & Wordmark */}
          <div className="flex justify-center mb-6">
            <Link to="/" aria-label="TrustHire home" className="hover:opacity-85 transition-opacity">
              <TrustHireLogo variant="dark" symbolOnly={false} symbolSize="h-8 sm:h-9" textSize="text-lg sm:text-xl font-normal" />
            </Link>
          </div>

          {/* Editorial Display Heading & Supporting Line */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121613] font-normal tracking-[-0.025em]">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E66] mt-2 font-sans leading-relaxed">
              Sign in to continue your career journey with TrustHire.
            </p>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div 
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 font-medium animate-fade-in font-sans"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field with Envelope Icon and Generous Left Padding */}
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
                Email address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
                />
              </div>
            </div>

            {/* Password Field with Lock Icon, Padding and Functional Visibility Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] font-sans">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-[#F0442D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] rounded-sm font-sans cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <Lock size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-11 py-3 sm:py-3.5 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 p-1 flex items-center justify-center text-[#9A9A92] hover:text-[#121613] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full font-medium text-sm text-white bg-[#F0442D] hover:bg-[#d63823] active:bg-[#c2301c] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(240,68,45,0.2)] hover:shadow-[0_6px_20px_rgba(240,68,45,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] focus-visible:ring-offset-2 cursor-pointer font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Social Auth Section (Displayed ONLY when real OAuth provider is configured) */}
          {isSocialAuthEnabled && (
            <>
              <div className="relative w-full flex items-center justify-center my-6">
                <div className="absolute inset-x-0 h-[1px] bg-[#EAEAE5]" />
                <span className="text-xs text-[#9A9A92] uppercase tracking-wider bg-white px-3 z-10 font-sans">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full bg-[#FAF9F6] hover:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] text-[#121613] rounded-xl py-3 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121613]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Create Account Link */}
          <div className="mt-7 pt-5 border-t border-[#EAEAE5] text-center">
            <p className="text-xs sm:text-sm text-[#6E6E66] font-sans">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-[#121613] hover:text-[#F0442D] transition-colors underline underline-offset-2"
              >
                Create your account
              </Link>
            </p>
          </div>

          {/* Legal Notice */}
          <div className="mt-5 text-center text-xs text-[#9A9A92] leading-relaxed font-sans flex items-center justify-center gap-2">
            <Link to="/terms" className="hover:text-[#121613] transition-colors">Terms of Service</Link>
            <span>&middot;</span>
            <Link to="/privacy" className="hover:text-[#121613] transition-colors">Privacy Policy</Link>
          </div>

        </div>
      </main>

      {/* Understated Responsive Footer in Normal Document Flow */}
      <footer className="w-full text-center py-6 px-4 shrink-0 font-sans">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-[#9A9A92]">
          <span>&copy; 2026 TrustHire Inc. All rights reserved.</span>
          <span className="hidden sm:inline text-[#EAEAE5]">&middot;</span>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="hover:text-[#121613] transition-colors">Terms of Service</Link>
            <span className="text-[#EAEAE5]">&middot;</span>
            <Link to="/privacy" className="hover:text-[#121613] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* Password Reset Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </AuthBackground>
  );
}

// ==========================================
// REGISTRATION PAGE
// ==========================================
export function SignupPage() {
  const { signup, loginWithOAuth, isSocialAuthEnabled } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('candidate'); // candidate | recruiter
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');

    // Validations
    if (!fullName.trim() || !email.trim()) {
      setError('Please provide your full name and email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!acceptedTerms) {
      setError('You must review and agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password, role, fullName.trim(), true, 'v1.0.0-2026.10');
      if (role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/career');
      }
    } catch (err) {
      setError(err?.message || 'Registration failed. Please verify your details or use another email.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    if (loading) return;
    setError('');
    try {
      await loginWithOAuth(provider, role);
      if (role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/career');
      }
    } catch {
      setError(`Registration with ${provider} failed. Please use standard email registration.`);
    }
  };

  return (
    <AuthBackground>
      {/* Centred Editorial Signup Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 w-full">
        <div className="w-full max-w-[460px] mx-auto bg-white rounded-3xl border border-[#EAEAE5] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-7 sm:p-9 transition-all">
          
          {/* Top Emblem Logo & Wordmark */}
          <div className="flex justify-center mb-6">
            <Link to="/" aria-label="TrustHire home" className="hover:opacity-85 transition-opacity">
              <TrustHireLogo variant="dark" symbolOnly={false} symbolSize="h-8 sm:h-9" textSize="text-lg sm:text-xl font-normal" />
            </Link>
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#121613] font-normal tracking-[-0.025em]">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E66] mt-2 font-sans leading-relaxed">
              Join TrustHire to access verified company facts and structured career roadmaps.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div 
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 font-medium animate-fade-in font-sans"
            >
              <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="mb-5 p-1 rounded-2xl bg-[#FAF9F6] border border-[#EAEAE5] grid grid-cols-2 gap-1 font-sans">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'candidate'
                  ? 'bg-white text-[#121613] shadow-xs font-semibold'
                  : 'text-[#6E6E66] hover:text-[#121613]'
              }`}
            >
              <UserCheck size={14} className={role === 'candidate' ? 'text-[#F0442D]' : ''} />
              <span>Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                role === 'recruiter'
                  ? 'bg-white text-[#121613] shadow-xs font-semibold'
                  : 'text-[#6E6E66] hover:text-[#121613]'
              }`}
            >
              <Briefcase size={14} className={role === 'recruiter' ? 'text-[#F0442D]' : ''} />
              <span>Employer</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
                Full name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <UserIcon size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
                Email address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <Lock size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5 text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 p-1 flex items-center justify-center text-[#9A9A92] hover:text-[#121613] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="signup-confirm" className="text-xs font-semibold uppercase tracking-wider text-[#6E6E66] block mb-2 font-sans">
                Confirm password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-[#9A9A92]">
                  <Lock size={16} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <input
                  id="signup-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-[#FAF9F6] hover:bg-white focus:bg-white border text-sm text-[#121613] placeholder-[#9A9A92] outline-none transition-all duration-200 font-sans ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10'
                      : 'border-[#EAEAE5] hover:border-[#CCCCCC] focus:border-[#121613] focus:ring-4 focus:ring-black/5'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 p-1 flex items-center justify-center text-[#9A9A92] hover:text-[#121613] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* Mandatory Explicit Legal Acceptance Checkbox */}
            <div className="pt-2">
              <label 
                htmlFor="signup-terms" 
                className="flex items-start gap-3 cursor-pointer group select-none text-left"
              >
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (error) setError('');
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-[#D2D2CC] text-[#121613] focus:ring-2 focus:ring-[#121613] focus:ring-offset-1 accent-[#121613] cursor-pointer shrink-0"
                />
                <span className="text-xs text-[#5A5E5B] leading-relaxed">
                  I have read and agree to the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#121613] font-medium underline underline-offset-2 hover:text-[#F0442D] transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#121613] font-medium underline underline-offset-2 hover:text-[#F0442D] transition-colors"
                  >
                    Privacy Policy
                  </Link>.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full py-3.5 px-6 rounded-full font-medium text-sm text-white bg-[#F0442D] hover:bg-[#d63823] active:bg-[#c2301c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(240,68,45,0.2)] hover:shadow-[0_6px_20px_rgba(240,68,45,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0442D] focus-visible:ring-offset-2 cursor-pointer font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>

          {/* Social Auth (if enabled) */}
          {isSocialAuthEnabled && (
            <>
              <div className="relative w-full flex items-center justify-center my-6">
                <div className="absolute inset-x-0 h-[1px] bg-[#EAEAE5]" />
                <span className="text-xs text-[#9A9A92] uppercase tracking-wider bg-white px-3 z-10 font-sans">
                  Or register with
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full bg-[#FAF9F6] hover:bg-white border border-[#EAEAE5] hover:border-[#CCCCCC] text-[#121613] rounded-xl py-3 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#121613]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}

          {/* Sign In Link */}
          <div className="mt-7 pt-5 border-t border-[#EAEAE5] text-center">
            <p className="text-xs sm:text-sm text-[#6E6E66] font-sans">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium text-[#121613] hover:text-[#F0442D] transition-colors underline underline-offset-2"
              >
                Sign in to your account
              </Link>
            </p>
          </div>

          {/* Legal Notice */}
          <div className="mt-5 text-center text-xs text-[#9A9A92] leading-relaxed font-sans flex items-center justify-center gap-2">
            <Link to="/terms" className="hover:text-[#121613] transition-colors">Terms of Service</Link>
            <span>&middot;</span>
            <Link to="/privacy" className="hover:text-[#121613] transition-colors">Privacy Policy</Link>
          </div>

        </div>
      </main>

      {/* Understated Responsive Footer in Normal Document Flow */}
      <footer className="w-full text-center py-6 px-4 shrink-0 font-sans">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-[#9A9A92]">
          <span>&copy; 2026 TrustHire Inc. All rights reserved.</span>
          <span className="hidden sm:inline text-[#EAEAE5]">&middot;</span>
          <div className="flex items-center gap-3">
            <Link to="/terms" className="hover:text-[#121613] transition-colors">Terms of Service</Link>
            <span className="text-[#EAEAE5]">&middot;</span>
            <Link to="/privacy" className="hover:text-[#121613] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </AuthBackground>
  );
}
