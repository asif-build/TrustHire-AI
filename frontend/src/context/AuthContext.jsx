import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    
    // Auto-detect if Supabase is properly configured
    const isSupabaseConfigured = 
        Boolean(
            import.meta.env.VITE_SUPABASE_URL && 
            import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' && 
            import.meta.env.VITE_SUPABASE_ANON_KEY && 
            import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key'
        );

    const handleSession = async (session) => {
        if (!session) {
            setUser(null);
            setToken(null);
            setRole(null);
            setProfile(null);
            setLoading(false);
            return;
        }

        const jwt = session.access_token;
        setToken(jwt);
        setUser(session.user);

        // Sync with backend API
        try {
            const syncRes = await axios.post(`${API_URL}/api/users/sync`, {}, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            // Get detailed profile
            const profileRes = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });
            
            setRole(syncRes.data.role);
            setProfile(profileRes.data);
        } catch (err) {
            console.warn("Backend auth sync notice:", err?.message || err);
            // Default fallback if backend is offline or setting up
            setRole(session.user?.user_metadata?.role || 'candidate');
            setProfile({
                full_name: session.user?.user_metadata?.full_name || '',
                email: session.user?.email,
                role: session.user?.user_metadata?.role || 'candidate'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            // 1. Check local session first
            const localSessionJson = localStorage.getItem('mock_session');
            if (localSessionJson) {
                try {
                    const session = JSON.parse(localSessionJson);
                    if (session?.access_token && isMounted) {
                        await handleSession(session);
                        return;
                    }
                } catch (e) {
                    console.warn("Failed to parse local stored session:", e);
                }
            }

            // 2. If Supabase is configured, check its session
            if (isSupabaseConfigured) {
                try {
                    const { data, error } = await supabase.auth.getSession();
                    if (!error && data?.session && isMounted) {
                        await handleSession(data.session);
                        return;
                    }
                } catch (err) {
                    console.warn("Supabase session check skipped:", err?.message || err);
                }
            }

            if (isMounted) {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for Supabase auth state changes if configured
        let subscription = null;
        if (isSupabaseConfigured) {
            try {
                const { data } = supabase.auth.onAuthStateChange((_event, session) => {
                    if (isMounted) {
                        handleSession(session);
                    }
                });
                subscription = data?.subscription;
            } catch (err) {
                console.warn("Supabase onAuthStateChange failed:", err?.message || err);
            }
        }

        return () => {
            isMounted = false;
            if (subscription && typeof subscription.unsubscribe === 'function') {
                subscription.unsubscribe();
            }
        };
    }, [isSupabaseConfigured]);

    const signup = async (email, password, selectedRole, fullName, termsAccepted = true, termsVersion = 'v1.0.0-2026.10') => {
        if (!termsAccepted) {
            throw new Error('You must accept the Terms of Service and Privacy Policy to create an account.');
        }
        setLoading(true);
        try {
            // 1. Primary: Attempt real Django backend registration
            try {
                const response = await axios.post(`${API_URL}/api/auth/register`, {
                    email,
                    password,
                    role: selectedRole,
                    full_name: fullName,
                    terms_accepted: true,
                    terms_version: termsVersion
                });
                if (response.data && response.data.access) {
                    const realSession = {
                        access_token: response.data.access,
                        refresh_token: response.data.refresh,
                        user: {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            user_metadata: {
                                role: response.data.user.role,
                                full_name: response.data.user.full_name,
                                terms_accepted: true,
                                terms_accepted_at: new Date().toISOString(),
                                terms_version: termsVersion
                            }
                        }
                    };
                    localStorage.setItem('mock_session', JSON.stringify(realSession));
                    await handleSession(realSession);
                    return realSession;
                }
            } catch (apiErr) {
                if (apiErr.response && (apiErr.response.status === 400 || apiErr.response.status === 409)) {
                    const errData = apiErr.response.data;
                    let msg = "Registration failed.";
                    if (errData?.email) msg = Array.isArray(errData.email) ? errData.email[0] : errData.email;
                    else if (errData?.terms_accepted) msg = Array.isArray(errData.terms_accepted) ? errData.terms_accepted[0] : errData.terms_accepted;
                    else if (errData?.password) msg = Array.isArray(errData.password) ? errData.password[0] : errData.password;
                    else if (errData?.detail) msg = errData.detail;
                    throw new Error(msg);
                }

                // If backend is unreachable and Supabase is configured, attempt Supabase
                if (isSupabaseConfigured) {
                    try {
                        const { data, error } = await supabase.auth.signUp({
                            email,
                            password,
                            options: {
                                data: {
                                    role: selectedRole,
                                    full_name: fullName,
                                    terms_accepted: true,
                                    terms_accepted_at: new Date().toISOString(),
                                    terms_version: termsVersion
                                }
                            }
                        });
                        if (error) throw error;
                        return data;
                    } catch (sbErr) {
                        console.warn("Supabase signup fallback failed:", sbErr?.message || sbErr);
                    }
                }

                if (!apiErr.response) {
                    // In local development when backend is down
                    console.warn("Backend unreachable for registration, creating local session.");
                }
            }

            // Fallback developer session
            const mockSession = {
                access_token: `mock-jwt-${selectedRole}-${uuidv4()}`,
                user: {
                    id: selectedRole === 'recruiter' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
                    email,
                    user_metadata: {
                        role: selectedRole,
                        full_name: fullName,
                        terms_accepted: true,
                        terms_accepted_at: new Date().toISOString(),
                        terms_version: termsVersion
                    }
                }
            };
            localStorage.setItem('mock_session', JSON.stringify(mockSession));
            await handleSession(mockSession);
            return mockSession;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            // 1. Primary: Attempt real Django backend authentication
            try {
                const response = await axios.post(`${API_URL}/api/auth/login`, {
                    email,
                    password
                });
                if (response.data && response.data.access) {
                    const realSession = {
                        access_token: response.data.access,
                        refresh_token: response.data.refresh,
                        user: {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            user_metadata: {
                                role: response.data.user.role,
                                full_name: response.data.user.full_name
                            }
                        }
                    };
                    localStorage.setItem('mock_session', JSON.stringify(realSession));
                    await handleSession(realSession);
                    return realSession;
                }
            } catch (apiErr) {
                const isAuthError = apiErr.response && (apiErr.response.status === 400 || apiErr.response.status === 401);

                // If Supabase is configured, try Supabase fallback
                if (isSupabaseConfigured) {
                    try {
                        const { data, error } = await supabase.auth.signInWithPassword({
                            email,
                            password
                        });
                        if (!error && data?.session) {
                            return data;
                        }
                    } catch (sbErr) {
                        console.warn("Supabase login fallback failed or unreachable:", sbErr?.message || sbErr);
                    }
                }

                // If credentials were submitted to Django and rejected
                if (isAuthError) {
                    const errMsg = apiErr.response.data?.detail || apiErr.response.data?.error || "Incorrect email or password. Please verify your credentials.";
                    throw new Error(errMsg);
                }

                // If backend was completely unreachable
                if (!apiErr.response && !isSupabaseConfigured) {
                    console.warn("Authentication server unreachable, falling back to local developer session");
                } else if (!apiErr.response) {
                    throw new Error("Unable to connect to the authentication server. Please verify your network and server status.");
                }
            }

            // Fallback developer session (for demo/mock purposes)
            const selectedRole = email.includes('recruiter') ? 'recruiter' : 'candidate';
            const fullName = selectedRole === 'recruiter' ? 'Demo Recruiter' : 'Demo Candidate';
            
            const mockSession = {
                access_token: `mock-jwt-${selectedRole}-${uuidv4()}`,
                user: {
                    id: selectedRole === 'recruiter' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
                    email,
                    user_metadata: {
                        role: selectedRole,
                        full_name: fullName
                    }
                }
            };
            localStorage.setItem('mock_session', JSON.stringify(mockSession));
            await handleSession(mockSession);
            return mockSession;
        } finally {
            setLoading(false);
        }
    };

    const loginWithOAuth = async (provider, customRole = 'candidate') => {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider,
                    options: {
                        redirectTo: window.location.origin,
                        queryParams: { role: customRole }
                    }
                });
                if (error) throw error;
                return data;
            } catch (err) {
                console.error("OAuth login failed:", err);
                throw new Error(`Authentication with ${provider} is currently unavailable.`);
            }
        } else {
            // Mock OAuth
            const mockSession = {
                access_token: `mock-jwt-${customRole}-${uuidv4()}`,
                user: {
                    id: customRole === 'recruiter' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
                    email: `oauth_${provider}@demo.com`,
                    user_metadata: {
                        role: customRole,
                        full_name: `OAuth ${provider.toUpperCase()} User`
                    }
                }
            };
            localStorage.setItem('mock_session', JSON.stringify(mockSession));
            await handleSession(mockSession);
            return mockSession;
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            if (isSupabaseConfigured) {
                try {
                    await supabase.auth.signOut();
                } catch (err) {
                    console.warn("Supabase signOut error:", err?.message || err);
                }
            }
            localStorage.removeItem('mock_session');
            setUser(null);
            setToken(null);
            setRole(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (!token) return;
        try {
            const profileRes = await axios.get(`${API_URL}/api/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(profileRes.data);
        } catch (err) {
            console.error("Failed to refresh profile:", err);
        }
    };

    const resetPassword = async (email) => {
        try {
            if (isSupabaseConfigured) {
                try {
                    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/login`
                    });
                    if (error) throw error;
                    return { success: true, message: "Password reset instructions sent to your email." };
                } catch (sbErr) {
                    console.warn("Supabase password reset failed, trying backend:", sbErr?.message || sbErr);
                }
            }
            const res = await axios.post(`${API_URL}/api/auth/password-reset`, { email });
            return { success: true, message: res.data?.detail || `Password reset instructions sent to ${email}.` };
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to send reset instructions.";
            throw new Error(msg);
        }
    };

    // Lightweight UUID generator for mock tokens
    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const value = {
        user,
        profile,
        role,
        token,
        loading,
        signup,
        login,
        loginWithOAuth,
        logout,
        refreshProfile,
        resetPassword,
        isSocialAuthEnabled: Boolean(isSupabaseConfigured),
        isSupabaseConfigured: Boolean(isSupabaseConfigured)
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
