'use client';
// app/login/page.tsx
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './login.module.css';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuthContext();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  const handleLogin = async () => {
    setSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🎯</div>
        <div className="spinner" style={{ width: 30, height: 30 }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgGrid} />
      </div>

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>RifasApp</span>
        </div>

        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Bienvenido</h1>
          <p className={styles.subtitle}>
            Inicia sesión con tu cuenta de Gmail para crear y gestionar tus rifas
          </p>
        </div>

        {/* Google Button */}
        <button
          id="btn-google-login"
          className={`btn btn-google btn-full btn-lg ${styles.googleBtn}`}
          onClick={handleLogin}
          disabled={signingIn}
        >
          {signingIn ? (
            <>
              <span className={styles.spinner} />
              Iniciando sesión...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Divider */}
        <div className="divider">o</div>

        {/* Info */}
        <div className={styles.features}>
          {[
            { icon: '🔒', text: 'Inicio de sesión seguro con Google' },
            { icon: '🎯', text: 'Crea rifas ilimitadas gratis' },
            { icon: '📊', text: 'Panel de control completo' },
            { icon: '📧', text: 'Notificaciones automáticas' },
          ].map((f, i) => (
            <div key={i} className={styles.feature}>
              <span>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <p className={styles.terms}>
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
        </p>
      </div>
    </div>
  );
}
