import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

export function LoginPage() {
    const { login, loginWithOAuth } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            const userMetadata = data?.user?.user_metadata || {};
            const role = userMetadata.role || 'candidate';
            if (role === 'recruiter') {
                navigate('/recruiter');
            } else {
                navigate('/candidate');
            }
        } catch (err) {
            setError("Incorrect email or password.");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        try {
            await loginWithOAuth(provider, 'recruiter');
            navigate('/recruiter');
        } catch (err) {
            setError("OAuth authentication failed.");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafffa] text-[#121613] flex flex-col justify-center items-center px-6 relative select-none font-twk-lausanne">
            {/* Top Left Home navigation */}
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-1.5 text-[#516254] hover:text-[#121613] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
                <ArrowLeft size={14} />
                <span>Home</span>
            </Link>

            {/* Form Card wrapper */}
            <div className="w-full max-w-[400px] py-10 flex flex-col items-center">
                {/* Brand Logo split mark */}
                <svg className="w-14 h-14 mb-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Left top black wing */}
                    <path d="M48 23H17c-2.5 0-4.5 1.5-4.5 3.5s2 3.5 4.5 3.5h16c3.5 0 7 2.5 9 5.5l1.5 2.5H48V23z" fill="#121613" />
                    {/* Left lower black wing & stem */}
                    <path d="M48 38H41.5l-1.5-2.5c-2-3-5.5-5.5-9-5.5h-3c-1.5 0-2.5 1-2.5 2s1 2 2.5 2h3c2.5 0 4.5 1.5 6 3.5l1.5 2.5H40v34l8 5z" fill="#121613" />
                    {/* Right top black wing */}
                    <path d="M52 23h31c2.5 0 4.5 1.5 4.5 3.5s-2 3.5-4.5 3.5H67c-3.5 0-7 2.5-9 5.5l-1.5 2.5H52V23z" fill="#121613" />
                    {/* Right lower green wing & stem */}
                    <path d="M52 38h6.5l1.5-2.5c2-3 5.5-5.5 9-5.5h3c1.5 0 2.5 1 2.5 2s-1 2-2.5 2h-3c-2.5 0-4.5 1.5-6 3.5l-1.5 2.5H60v34l-8 5z" fill="#2bee4b" />
                </svg>

                <div className="text-center mb-8">
                    <h2 className="font-editorial-new text-[36px] font-light leading-[1.0] text-[#121613] tracking-tight">Account Access</h2>
                    <p className="text-xs text-[#516254] mt-3 font-light">
                        Don't have a credentials profile? <Link to="/signup" className="text-[#121613] font-semibold hover:underline decoration-[#2bee4b] underline-offset-2">Sign up here</Link>.
                    </p>
                </div>

                {error && (
                    <div className="w-full mb-6 p-4 rounded-[10px] bg-red-500/5 border border-red-500/20 text-red-600 text-xs text-center font-light">
                        {error}
                    </div>
                )}

                {/* OAuth section */}
                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <button
                        type="button"
                        onClick={() => handleOAuth('google')}
                        className="bg-[#fafffa] border border-[#c8d2c8] hover:border-[#121613] text-[#121613] rounded-[10px] py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOAuth('github')}
                        className="bg-[#fafffa] border border-[#c8d2c8] hover:border-[#121613] text-[#121613] rounded-[10px] py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        <span>GitHub</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative w-full flex items-center justify-center mb-6">
                    <div className="absolute inset-x-0 h-[1px] bg-[#c8d2c8]/30 z-0" />
                    <span className="text-[10px] text-[#516254] uppercase tracking-widest bg-[#fafffa] px-4 z-10 font-medium">or credentials</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#516254] uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="engineering@team.com"
                            className="w-full px-4 py-3 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] text-[#121613] placeholder-[#c8d2c8] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] text-sm transition-all font-light"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#516254] uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-4 py-3 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] text-[#121613] placeholder-[#c8d2c8] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] text-sm transition-all font-light"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className={`w-full py-4 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border mt-8 ${
                            loading || !email || !password
                                ? 'bg-[#c8d2c8]/40 text-[#516254] border-[#c8d2c8]/40 cursor-not-allowed'
                                : 'bg-[#2bee4b] text-[#121613] border-transparent shadow-[rgba(16,94,29,0.45)_1px_8px_20px_0px,rgba(18,146,39,0.25)_1px_8px_20px_0px] hover:opacity-95 active:scale-[0.99] cursor-pointer'
                        }`}
                    >
                        {loading ? 'Validating...' : 'Authenticate Profile'}
                    </button>
                </form>

                {/* Footer terms */}
                <p className="mt-8 text-center text-[10px] text-[#516254] max-w-[280px] leading-relaxed font-light">
                    Protected by credential hardware checks. Standard <a href="#" className="underline text-[#121613] hover:text-[#2bee4b]">Terms</a> and <a href="#" className="underline text-[#121613] hover:text-[#2bee4b]">Privacy</a> policies apply.
                </p>
            </div>
        </div>
    );
}

export function SignupPage() {
    const { signup, loginWithOAuth } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('candidate'); // candidate | recruiter
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(email, password, role, fullName);
            if (role === 'recruiter') {
                navigate('/recruiter');
            } else {
                navigate('/candidate');
            }
        } catch (err) {
            setError("Authentication check failed. Please ensure password satisfies standard rules.");
        } finally {
            setLoading(false);
        }
    };

    const handleOAuth = async (provider) => {
        try {
            await loginWithOAuth(provider, role);
            if (role === 'recruiter') {
                navigate('/recruiter');
            } else {
                navigate('/candidate');
            }
        } catch (err) {
            setError("OAuth registration failed.");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafffa] text-[#121613] flex flex-col justify-center items-center px-6 relative select-none font-twk-lausanne animate-[fadeIn_0.2s_ease-out]">
            {/* Top Left Home navigation */}
            <Link 
                to="/" 
                className="absolute top-8 left-8 flex items-center gap-1.5 text-[#516254] hover:text-[#121613] transition-colors text-xs font-semibold uppercase tracking-wider"
            >
                <ArrowLeft size={14} />
                <span>Home</span>
            </Link>

            {/* Form Card wrapper */}
            <div className="w-full max-w-[400px] py-6 flex flex-col items-center">
                {/* Brand Logo split mark */}
                <svg className="w-14 h-14 mb-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Left top black wing */}
                    <path d="M48 23H17c-2.5 0-4.5 1.5-4.5 3.5s2 3.5 4.5 3.5h16c3.5 0 7 2.5 9 5.5l1.5 2.5H48V23z" fill="#121613" />
                    {/* Left lower black wing & stem */}
                    <path d="M48 38H41.5l-1.5-2.5c-2-3-5.5-5.5-9-5.5h-3c-1.5 0-2.5 1-2.5 2s1 2 2.5 2h3c2.5 0 4.5 1.5 6 3.5l1.5 2.5H40v34l8 5z" fill="#121613" />
                    {/* Right top black wing */}
                    <path d="M52 23h31c2.5 0 4.5 1.5 4.5 3.5s-2 3.5-4.5 3.5H67c-3.5 0-7 2.5-9 5.5l-1.5 2.5H52V23z" fill="#121613" />
                    {/* Right lower green wing & stem */}
                    <path d="M52 38h6.5l1.5-2.5c2-3 5.5-5.5 9-5.5h3c1.5 0 2.5 1 2.5 2s-1 2-2.5 2h-3c-2.5 0-4.5 1.5-6 3.5l-1.5 2.5H60v34l-8 5z" fill="#2bee4b" />
                </svg>

                <div className="text-center mb-6">
                    <h2 className="font-editorial-new text-[36px] font-light leading-[1.0] text-[#121613] tracking-tight">Create Profile</h2>
                    <p className="text-xs text-[#516254] mt-3 font-light">
                        Already registered? <Link to="/login" className="text-[#121613] font-semibold hover:underline decoration-[#2bee4b] underline-offset-2">Access account here</Link>.
                    </p>
                </div>

                {error && (
                    <div className="w-full mb-4 p-4 rounded-[10px] bg-red-500/5 border border-red-500/20 text-red-600 text-xs text-center font-light">
                        {error}
                    </div>
                )}

                {/* Role Selector Panel */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <button
                        type="button"
                        onClick={() => setRole('candidate')}
                        className={`py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                            role === 'candidate'
                                ? 'bg-[#121613] border-[#121613] text-[#fafffa]'
                                : 'bg-[#fafffa] border-[#c8d2c8] text-[#516254] hover:text-[#121613] hover:border-[#121613]'
                        }`}
                    >
                        Candidate
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('recruiter')}
                        className={`py-3 rounded-[10px] text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                            role === 'recruiter'
                                ? 'bg-[#121613] border-[#121613] text-[#fafffa]'
                                : 'bg-[#fafffa] border-[#c8d2c8] text-[#516254] hover:text-[#121613] hover:border-[#121613]'
                        }`}
                    >
                        Recruiter
                    </button>
                </div>

                {/* OAuth section */}
                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    <button
                        type="button"
                        onClick={() => handleOAuth('google')}
                        className="bg-[#fafffa] border border-[#c8d2c8] hover:border-[#121613] text-[#121613] rounded-[10px] py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span>Google</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOAuth('github')}
                        className="bg-[#fafffa] border border-[#c8d2c8] hover:border-[#121613] text-[#121613] rounded-[10px] py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        <span>GitHub</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative w-full flex items-center justify-center mb-6">
                    <div className="absolute inset-x-0 h-[1px] bg-[#c8d2c8]/30 z-0" />
                    <span className="text-[10px] text-[#516254] uppercase tracking-widest bg-[#fafffa] px-4 z-10 font-medium">or credentials</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 w-full">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#516254] uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Jack Reacher"
                            className="w-full px-4 py-3 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] text-[#121613] placeholder-[#c8d2c8] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] text-sm transition-all font-light"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#516254] uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jack@company.com"
                            className="w-full px-4 py-3 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] text-[#121613] placeholder-[#c8d2c8] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] text-sm transition-all font-light"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#516254] uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full px-4 py-3 rounded-[10px] bg-[#fafffa] border border-[#c8d2c8] text-[#121613] placeholder-[#c8d2c8] focus:outline-none focus:border-[#121613] focus:ring-1 focus:ring-[#121613] text-sm transition-all font-light"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !email || !password || !fullName}
                        className={`w-full py-4 rounded-[10px] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border mt-6 ${
                            loading || !email || !password || !fullName
                                ? 'bg-[#c8d2c8]/40 text-[#516254] border-[#c8d2c8]/40 cursor-not-allowed'
                                : 'bg-[#2bee4b] text-[#121613] border-transparent shadow-[rgba(16,94,29,0.45)_1px_8px_20px_0px,rgba(18,146,39,0.25)_1px_8px_20px_0px] hover:opacity-95 active:scale-[0.99] cursor-pointer'
                        }`}
                    >
                        {loading ? 'Creating...' : 'Register Profile'}
                    </button>
                </form>

                {/* Footer terms */}
                <p className="mt-8 text-center text-[10px] text-[#516254] max-w-[280px] leading-relaxed font-light">
                    Protected by credential hardware checks. Standard <a href="#" className="underline text-[#121613] hover:text-[#2bee4b]">Terms</a> and <a href="#" className="underline text-[#121613] hover:text-[#2bee4b]">Privacy</a> policies apply.
                </p>
            </div>
        </div>
    );
}
