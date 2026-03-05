'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        uid: '', uname: '', password: '', email: '', phone: '', role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch(`${API}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data.message || 'Registration failed.');
                return;
            }

            setSuccess('🎉 Account created! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch {
            setError('Cannot connect to server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card card-wide">

                {/* Brand */}
                <div className="brand">
                    <div className="brand-icon">🏦</div>
                    <h1>KodBank</h1>
                    <p>Create your free account</p>
                </div>

                {/* Error / Success */}
                {error && <div className="alert alert-error">⚠️ {error}</div>}
                {success && <div className="alert alert-success">✅ {success}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    {/* Row 1: UID + Username */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="uid">User ID</label>
                            <input
                                id="uid" name="uid" type="text"
                                placeholder="e.g. USR001"
                                value={form.uid} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="uname">Username</label>
                            <input
                                id="uname" name="uname" type="text"
                                placeholder="e.g. john_doe"
                                value={form.uname} onChange={handleChange} required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email" name="email" type="email"
                            placeholder="you@example.com"
                            value={form.email} onChange={handleChange} required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password" name="password" type="password"
                            placeholder="Create a strong password"
                            value={form.password} onChange={handleChange} required
                        />
                    </div>

                    {/* Row 3: Phone + Role */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phone" name="phone" type="tel"
                                placeholder="+91 XXXXX XXXXX"
                                value={form.phone} onChange={handleChange} required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" name="role" value="customer" disabled>
                                <option value="customer">Customer</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account →'}
                    </button>
                </form>

                <div className="link-row">
                    Already have an account? <Link href="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
