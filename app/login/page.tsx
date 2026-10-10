'use client';

import { useState, FormEvent, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [appNameShort, setAppNameShort] = useState('SmartMap');
    const [appName, setAppName] = useState('Sistem Informasi Geografis Bapenda');
    const [institutionName, setInstitutionName] = useState('BAPENDA');
    const [appLogo, setAppLogo] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/settings', { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    if (data.data.app_name_short) setAppNameShort(data.data.app_name_short);
                    if (data.data.app_name) setAppName(data.data.app_name);
                    if (data.data.app_logo) setAppLogo(data.data.app_logo);
                    if (data.data.institution_name) setInstitutionName(data.data.institution_name);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        }
        fetchSettings();
    }, []);

    const { login } = useAuth();
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: result.message || 'Selamat datang',
                    timer: 1500,
                    showConfirmButton: false,
                }).then(() => {
                    // Use token in URL as fallback for IP access where cookies fail
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                        window.location.href = '/map?_token=' + encodeURIComponent(token);
                    } else {
                        window.location.href = '/map';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: result.message || 'Username atau password salah',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan saat login',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 text-center">{appNameShort}</h1>
                    <p className="text-sm text-gray-600 text-center max-w-xs mt-1">{appName}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username" name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900"
                            placeholder="Masukkan username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password" name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-gray-900"
                                placeholder="Masukkan password"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    {institutionName} © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
