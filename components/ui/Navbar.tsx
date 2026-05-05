'use client';
// components/ui/Navbar.tsx
import { useAuthContext } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuthContext();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch {
      /* handled in hook */
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    setMenuOpen(false);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>RifasApp</span>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          <Link href="/" className={styles.navLink}>Inicio</Link>
          {user && <Link href="/dashboard" className={styles.navLink}>Mis Rifas</Link>}
          {user && <Link href="/crear-rifa" className={styles.navLinkAccent}>+ Crear Rifa</Link>}
        </div>

        {/* Auth Section */}
        <div className={styles.authSection}>
          {loading ? (
            <div className="spinner" />
          ) : user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Foto de perfil" className={styles.userAvatar} referrerPolicy="no-referrer" />
                ) : (
                  <div className={styles.userAvatarFallback}>{user.email?.[0].toUpperCase()}</div>
                )}
                <span className={styles.userName}>{user.displayName?.split(' ')[0] || 'Usuario'}</span>
                <span className={styles.chevron}>{menuOpen ? '▲' : '▼'}</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownEmail}>{user.email}</div>
                  <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    📊 Mi Dashboard
                  </Link>
                  <Link href="/crear-rifa" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                    ➕ Crear Rifa
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button className={styles.dropdownItemDanger} onClick={handleLogout}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-accent btn-sm" onClick={handleLogin} disabled={signingIn}>
              {signingIn ? <><span className="spinner" /> Entrando...</> : '🚀 Iniciar Sesión'}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          <span className={menuOpen ? styles.barOpen : styles.bar} />
          <span className={menuOpen ? styles.barOpen2 : styles.bar} />
          <span className={menuOpen ? styles.barOpen3 : styles.bar} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>🏠 Inicio</Link>
          {user && <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>📊 Mis Rifas</Link>}
          {user && <Link href="/crear-rifa" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>➕ Crear Rifa</Link>}
          {user ? (
            <button className={`${styles.mobileLink} ${styles.mobileLinkDanger}`} onClick={handleLogout}>
              🚪 Cerrar sesión
            </button>
          ) : (
            <button className={styles.mobileLink} onClick={handleLogin}>
              🚀 Iniciar con Google
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
