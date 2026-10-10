'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type UserRole = 'admin' | 'bapenda' | 'bpn' | 'kecamatan' | 'desa';

export interface AuthUser {
    id: number;
    username: string;
    name: string;
    role: UserRole;
    kodeWilayah: string | null;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    canEdit: boolean;
    canManageUsers: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: get stored token
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

// Helper: build headers with Authorization
function authHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user can edit (admin, bapenda)
    const canEdit = user?.role === 'admin' || user?.role === 'bapenda';

    // Check if user can manage users (admin only)
    const canManageUsers = user?.role === 'admin';

    // Fetch current user
    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: authHeaders(),
            });
            const data = await response.json();

            if (data.success && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = async (username: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Store token in localStorage as fallback for IP access
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
                setUser(data.user);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Login gagal' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Terjadi kesalahan saat login' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: authHeaders(),
            });
            localStorage.removeItem('auth_token');
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Check session on mount
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                canEdit,
                canManageUsers,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
