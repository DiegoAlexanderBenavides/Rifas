'use client';
// app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { obtenerRifasDeUsuario, eliminarRifa } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Rifa } from '@/types';
import { PLANTILLAS } from '@/types';
import styles from './dashboard.module.css';

function RifaCard({ rifa, onDelete }: { rifa: Rifa; onDelete: (id: string) => void }) {
  const plantilla = PLANTILLAS.find((p) => p.id === rifa.plantillaId) || PLANTILLAS[0];
  const porcentaje = Math.round((rifa.numerosVendidos / rifa.cantidadNumeros) * 100);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta rifa? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try { await eliminarRifa(rifa.id!); onDelete(rifa.id!); } catch { setDeleting(false); }
  };

  const badgeClass = rifa.estado === 'activa' ? 'badge-success' : rifa.estado === 'cerrada' ? 'badge-warning' : 'badge-primary';
  const badgeLabel = rifa.estado === 'activa' ? '🟢 Activa' : rifa.estado === 'cerrada' ? '🟡 Cerrada' : '🏆 Sorteada';

  return (
    <div className={styles.rifaCard} style={{ '--card-gradient': plantilla.gradiente } as React.CSSProperties}>
      <div className={styles.rifaCardHeader}>
        <span className={styles.rifaEmoji}>{plantilla.emoji}</span>
        <div className={styles.rifaCardHeaderInfo}>
          <h3 className={styles.rifaName}>{rifa.nombre}</h3>
          <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
        </div>
      </div>

      <div className={styles.rifaCardBody}>
        <div className={styles.rifaInfo}>
          <div className={styles.rifaInfoItem}><span>🏆</span><span>{rifa.premio}</span></div>
          <div className={styles.rifaInfoItem}><span>💰</span><span>${rifa.precioPorNumero.toLocaleString('es-CO')} / número</span></div>
          <div className={styles.rifaInfoItem}><span>📅</span><span>{new Date(rifa.fechaLimite).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Números vendidos</span>
            <span className={styles.progressValue}>{rifa.numerosVendidos} / {rifa.cantidadNumeros}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${porcentaje}%` }} />
          </div>
          <span className={styles.progressPercent}>{porcentaje}% vendido</span>
        </div>

        {rifa.estado === 'sorteada' && rifa.ganadorNombre && (
          <div className={styles.ganadorBanner}>
            🏆 Ganador: <strong>{rifa.ganadorNombre}</strong> — Número {String(rifa.ganadorNumero).padStart(3, '0')}
          </div>
        )}
      </div>

      <div className={styles.rifaCardActions}>
        <Link href={`/rifa/${rifa.id}`} className="btn btn-outline btn-sm" target="_blank">
          👁️ Ver Rifa
        </Link>
        <Link href={`/rifa/${rifa.id}/admin`} className="btn btn-primary btn-sm">
          ⚙️ Gestionar
        </Link>
        <button className="btn btn-ghost btn-sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '🗑️'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [loadingRifas, setLoadingRifas] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');

  useEffect(() => {
    if (!loading && !user) { router.push('/login'); return; }
    if (user) {
      setErrorCarga('');
      obtenerRifasDeUsuario(user.uid)
        .then(setRifas)
        .catch((err) => {
          console.error('Error cargando rifas:', err);
          setErrorCarga('No se pudieron cargar tus rifas. Verifica tu conexión o la configuración de Firebase.');
        })
        .finally(() => setLoadingRifas(false));
    }
  }, [user, loading, router]);

  const handleDelete = (id: string) => setRifas((prev) => prev.filter((r) => r.id !== id));

  if (loading || loadingRifas) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🎯</div>
        <div className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Cargando tus rifas...</p>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="loading-screen">
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2 style={{ color: '#ff8a80', fontSize: '1.3rem', textAlign: 'center', padding: '0 20px' }}>
          Error de conexión con Firebase
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', maxWidth: 400, padding: '0 20px' }}>
          {errorCarga}
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          🔄 Reintentar
        </button>
      </div>
    );
  }

  const activas = rifas.filter((r) => r.estado === 'activa').length;
  const totalVendidos = rifas.reduce((a, r) => a + r.numerosVendidos, 0);
  const totalIngresos = rifas.reduce((a, r) => a + r.numerosVendidos * r.precioPorNumero, 0);

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.dashboard}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              Hola, {user?.displayName?.split(' ')[0] || 'Organizador'} 👋
            </h1>
            <p className={styles.subtitle}>Gestiona todas tus rifas desde aquí</p>
          </div>
          <Link href="/crear-rifa" className="btn btn-accent btn-lg">
            + Crear Nueva Rifa
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎯</span>
            <span className={styles.statValue}>{rifas.length}</span>
            <span className={styles.statLabel}>Rifas totales</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🟢</span>
            <span className={styles.statValue}>{activas}</span>
            <span className={styles.statLabel}>Rifas activas</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎟️</span>
            <span className={styles.statValue}>{totalVendidos.toLocaleString()}</span>
            <span className={styles.statLabel}>Números vendidos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💰</span>
            <span className={styles.statValue}>${totalIngresos.toLocaleString('es-CO')}</span>
            <span className={styles.statLabel}>Ingresos totales (est.)</span>
          </div>
        </div>

        {/* Rifas */}
        {rifas.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎯</span>
            <h3>Aún no tienes rifas</h3>
            <p>¡Crea tu primera rifa y empieza a vender números!</p>
            <br />
            <Link href="/crear-rifa" className="btn btn-accent" style={{ marginTop: 16 }}>
              + Crear mi primera rifa
            </Link>
          </div>
        ) : (
          <div className={styles.rifasGrid}>
            {rifas.map((r) => (
              <RifaCard key={r.id} rifa={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
