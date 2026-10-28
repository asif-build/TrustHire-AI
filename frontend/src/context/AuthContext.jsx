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
        import.meta.env.VITE_SUPABASE_URL && 
        import.meta.env.VITE_SUPABASE_URL !== 'https://your-project.supabase.co' && 
        import.meta.env.VITE_SUPABASE_ANON_KEY && 
        import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anon-key';

    useEffect(() => {
        if (isSupabaseConfigured) {
            // Get active Supabase session
            supabase.auth.getSession().then(({ data: { session } }) => {
                handleSession(session);
            });

            // Listen for auth changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                handleSession(session);
            });

            return () => subscription.unsubscribe();
        } else {
            // Load Local Mock Session
            console.log("Supabase config placeholder detected. Running in Local Developer Mock Mode.");
            const localSessionJson = localStorage.getItem('mock_session');
            if (localSessionJson) {
                try {
                    const session = JSON.parse(localSessionJson);
                    handleSession(session);
                } catch (e) {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }
    }, []);

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
            console.error("Backend auth sync failed:", err);
            // Default fallback if backend is offline or setting up
            setRole(session.user.user_metadata?.role || 'candidate');
            setProfile({
                full_name: session.user.user_metadata?.full_name || '',
                email: session.user.email,
                role: session.user.user_metadata?.role || 'candidate'
            });
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email, password, selectedRole, fullName, termsAccepted = true, termsVersion = 'v1.0.0-2026.10') => {
        if (!termsAccepted) {
            throw new Error('You must accept the Terms of Service and Privacy Policy to create an account.');
        }
        setLoading(true);
        try {
            if (isSupabaseConfigured) {
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
            } else {
                // Attempt real Django registration
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
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            if (isSupabaseConfigured) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                return data;
            } else {
                // Attempt real Django login
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
                    if (apiErr.response && (apiErr.response.status === 400 || apiErr.response.status === 401)) {
                        const errMsg = apiErr.response.data?.detail || apiErr.response.data?.error || "Incorrect email or password.";
                        throw new Error(errMsg);
                    }
                }

                // Fallback developer session
                const selectedRole = email.includes('recruiter') ? 'recruiter' : 'candidate';
                const fullName = selectedRole === 'recruiter' ? 'Mock Recruiter' : 'Mock Candidate';
                
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
            }
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
                throw err;
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
                await supabase.auth.signOut();
            } else {
                localStorage.removeItem('mock_session');
            }
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
                const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/login`
                });
                if (error) throw error;
                return { success: true, message: "Password reset instructions sent to your email." };
            } else {
                const res = await axios.post(`${API_URL}/api/auth/password-reset`, { email });
                return { success: true, message: res.data?.detail || `Password reset instructions sent to ${email}.` };
            }
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
