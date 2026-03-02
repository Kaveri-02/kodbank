'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API = 'http://localhost:5000/api';

/* ──────────────────────────────────────────────
   Lightweight canvas confetti (no external lib)
─────────────────────────────────────────────── */
interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    color: string;
    size: number;
    rotation: number;
    rotSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle';
}

const COLORS = ['#6c63ff', '#00d4aa', '#ffd700', '#ff6b6b', '#a29bfe', '#fdcb6e', '#e17055', '#74b9ff', '#fd79a8'];

function launchConfetti(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles: Particle[] = [];

    for (let i = 0; i < 220; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: Math.random() * 10 + 5,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
        });
    }

    let frame: number;
    let startTime = Date.now();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const elapsed = (Date.now() - startTime) / 1000;

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06; // gravity
            p.rotation += p.rotSpeed;
            if (elapsed > 2) p.opacity -= 0.01;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            if (p.shape === 'rect') {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        if (elapsed < 5) {
            frame = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
    return () => cancelAnimationFrame(frame);
}

export default function DashboardPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [username, setUsername] = useState('');
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [balanceVisible, setBalanceVisible] = useState(false);

    // Format currency Indian style
    const formatBalance = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);

    const handleLogout = useCallback(async () => {
        await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
        router.push('/login');
    }, [router]);

    const handleCheckBalance = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API}/balance`, {
                method: 'GET',
                credentials: 'include', // sends the JWT cookie automatically
            });
            const data = await res.json();

            if (res.status === 401) {
                // Token expired or invalid — redirect to login
                router.push('/login');
                return;
            }

            if (!res.ok || !data.success) {
                setError(data.message || 'Failed to fetch balance.');
                return;
            }

            setBalance(data.balance);
            setUsername(data.username);
            setBalanceVisible(true);

            // 🎉 Launch confetti
            if (canvasRef.current) {
                launchConfetti(canvasRef.current);
            }
        } catch {
            setError('Cannot connect to server.');
        } finally {
            setLoading(false);
        }
    };

    // Resize canvas on window resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            {/* Confetti canvas */}
            <canvas ref={canvasRef} id="confetti-canvas" />

            {/* Navbar */}
            <nav className="navbar">
                <a className="navbar-brand" href="#">
                    🏦 <span>KodBank</span>
                </a>
                <button className="btn-logout" onClick={handleLogout}>
                    Sign Out
                </button>
            </nav>

            {/* Main content */}
            <div className="dashboard-wrapper" style={{ paddingTop: '5rem' }}>
                <div className="dashboard-card">
                    <p className="welcome-text">Welcome to KodBank</p>
                    <h1 className="dashboard-title">
                        {username ? `Hello, ${username}! 👋` : 'Your Dashboard'}
                    </h1>
                    <p className="dashboard-subtitle">
                        Securely view your account balance in real-time.
                    </p>

                    {/* Error */}
                    {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>⚠️ {error}</div>}

                    {/* Balance reveal */}
                    {balanceVisible && balance !== null ? (
                        <div className="balance-display">
                            <p className="balance-label">💰 Your Current Balance</p>
                            <div className="balance-amount">
                                {formatBalance(balance)}
                            </div>
                            <p className="balance-sub">✅ Verified from secure ledger</p>

                            {/* Party message */}
                            <p style={{
                                marginTop: '1rem',
                                fontSize: '1rem',
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 500
                            }}>
                                🎉🎊 Your balance is : <strong style={{ color: '#ffd700' }}>{formatBalance(balance)}</strong> 🎊🎉
                            </p>
                        </div>
                    ) : (
                        <div style={{ marginBottom: '2rem' }}>

                            {/* Decorative stat boxes */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                {[
                                    { label: 'Account Type', value: 'Savings', icon: '🏦' },
                                    { label: 'Status', value: 'Active', icon: '✅' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        padding: '1rem',
                                        background: 'rgba(108,99,255,0.1)',
                                        border: '1px solid rgba(108,99,255,0.2)',
                                        borderRadius: '14px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="btn-balance"
                        onClick={handleCheckBalance}
                        disabled={loading}
                        id="check-balance-btn"
                    >
                        {loading ? (
                            <><span className="spinner" style={{ borderTopColor: '#0a1a15', borderColor: 'rgba(10,26,21,0.3)' }} /> Checking...</>
                        ) : (
                            <> 💳 Check Balance </>
                        )}
                    </button>

                    {balanceVisible && (
                        <button
                            onClick={() => setBalanceVisible(false)}
                            style={{
                                display: 'block',
                                margin: '1rem auto 0',
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Hide Balance
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
