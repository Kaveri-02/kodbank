'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // ← crucial: lets browser receive the cookie
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'Login failed.');
                return;
            }

            router.push('/dashboard');
        } catch {
            setError('Cannot connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">

                {/* Brand */}
                <div className="brand">
                    <div className="brand-icon">🔐</div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your KodBank account</p>
                </div>

                {/* Error */}
                {error && <div className="alert alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username" name="username" type="text"
                            placeholder="Enter your username"
                            value={form.username} onChange={handleChange} required
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password" name="password" type="password"
                            placeholder="Enter your password"
                            value={form.password} onChange={handleChange} required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <><span className="spinner" /> Signing In...</> : 'Sign In →'}
                    </button>
                </form>

                <div className="link-row">
                    New to KodBank? <Link href="/register">Create Account</Link>
                </div>
            </div>
        </div>
    );
}
