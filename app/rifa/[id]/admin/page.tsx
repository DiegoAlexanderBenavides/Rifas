'use client';
// app/rifa/[id]/admin/page.tsx — Panel de administración
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { obtenerRifa, obtenerNumerosDeRifa, actualizarRifa, realizarSorteo } from '@/lib/firestore';
import { useAuthContext } from '@/components/auth/AuthProvider';
import NumeroGrid from '@/components/rifa/NumeroGrid';
import { PLANTILLAS } from '@/types';
import type { Rifa, Numero } from '@/types';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminRifaPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rifaId = params.id as string;
  const isNueva = searchParams.get('nueva') === '1';

  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();

  const [rifa, setRifa] = useState<Rifa | null>(null);
  const [numeros, setNumeros] = useState<Numero[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [ganador, setGanador] = useState<{ ganadorNumero: number; ganadorNombre: string } | null>(null);
  const [showSorteoModal, setShowSorteoModal] = useState(false);
  const [tab, setTab] = useState<'grid' | 'lista'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showNuevaAlert, setShowNuevaAlert] = useState(isNueva);

  const loadData = useCallback(async () => {
    const [r, n] = await Promise.all([obtenerRifa(rifaId), obtenerNumerosDeRifa(rifaId)]);
    setRifa(r);
    setNumeros(n);
    setLoading(false);
  }, [rifaId]);

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading, loadData]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && rifa && user && rifa.organizadorId !== user.uid) router.push(`/rifa/${rifaId}`);
  }, [authLoading, user, rifa, rifaId, router]);

  const plantilla = PLANTILLAS.find((p) => p.id === rifa?.plantillaId) || PLANTILLAS[0];
  const porcentaje = rifa ? Math.round((numeros.length / rifa.cantidadNumeros) * 100) : 0;
  const ingresos = numeros.length * (rifa?.precioPorNumero || 0);
  const rifaUrl = typeof window !== 'undefined' ? `${window.location.origin}/rifa/${rifaId}` : '';

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(rifaUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleToggleEstado = async () => {
    if (!rifa) return;
    const nuevoEstado = rifa.estado === 'activa' ? 'cerrada' : 'activa';
    if (!confirm(`¿${nuevoEstado === 'cerrada' ? 'Cerrar' : 'Reactivar'} esta rifa?`)) return;
    await actualizarRifa(rifaId, { estado: nuevoEstado });
    setRifa((prev) => prev ? { ...prev, estado: nuevoEstado } : prev);
  };

  const handleSorteo = async () => {
    if (!confirm('¿Realizar el sorteo ahora? Esta acción es irreversible.')) return;
    setSorteando(true);
    try {
      const result = await realizarSorteo(rifaId);
      setGanador(result);
      setShowSorteoModal(true);
      await loadData();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al realizar el sorteo');
    } finally {
      setSorteando(false);
    }
  };

  const filteredNumeros = numeros.filter(
    (n) =>
      n.compradoPor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.contacto.includes(searchQuery) ||
      String(n.numero).padStart(3, '0').includes(searchQuery)
  );

  if (loading || authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🎯</div>
        <div className="spinner" style={{ width: 30, height: 30 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Cargando panel...</p>
      </div>
    );
  }

  if (!rifa) return null;

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.admin}`}>

        {/* Nueva rifa alert */}
        {showNuevaAlert && (
          <div className={styles.nuevaAlert}>
            <span>🎉</span>
            <div>
              <strong>¡Tu rifa fue creada exitosamente!</strong>
              <p>Copia el enlace y compártelo para empezar a vender números.</p>
            </div>
            <button className={styles.nuevaClose} onClick={() => setShowNuevaAlert(false)}>✕</button>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerEmoji} style={{ background: plantilla.gradiente }}>
              {plantilla.emoji}
            </div>
            <div>
              <h1 className={styles.title}>{rifa.nombre}</h1>
              <div className={styles.headerMeta}>
                <span className={`badge ${rifa.estado === 'activa' ? 'badge-success' : rifa.estado === 'cerrada' ? 'badge-warning' : 'badge-primary'}`}>
                  {rifa.estado === 'activa' ? '🟢 Activa' : rifa.estado === 'cerrada' ? '🟡 Cerrada' : '🏆 Sorteada'}
                </span>
                <span className={styles.headerPlantilla}>{plantilla.nombre}</span>
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href={`/rifa/${rifaId}`} className="btn btn-ghost btn-sm" target="_blank">
              👁️ Ver pública
            </Link>
            <Link href="/dashboard" className="btn btn-outline btn-sm">
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Compartir link */}
        <div className={styles.shareCard}>
          <span className={styles.shareLabel}>🔗 Enlace para compartir</span>
          <div className={styles.shareRow}>
            <div className={styles.shareUrl}>{rifaUrl}</div>
            <button
              className={`btn btn-accent btn-sm ${styles.copyBtn}`}
              onClick={handleCopyLink}
            >
              {copySuccess ? '✅ Copiado!' : '📋 Copiar'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎟️</span>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{numeros.length} / {rifa.cantidadNumeros}</span>
              <span className={styles.statLabel}>Números vendidos</span>
            </div>
            <div className={styles.statProgress}>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${porcentaje}%` }} />
              </div>
              <span className={styles.statPct}>{porcentaje}%</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>💰</span>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>${ingresos.toLocaleString('es-CO')}</span>
              <span className={styles.statLabel}>Ingresos (est.)</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>🎯</span>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{rifa.cantidadNumeros - numeros.length}</span>
              <span className={styles.statLabel}>Disponibles</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statIcon}>📅</span>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {new Date(rifa.fechaLimite).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
              </span>
              <span className={styles.statLabel}>Fecha límite</span>
            </div>
          </div>
        </div>

        {/* Ganador banner */}
        {rifa.estado === 'sorteada' && rifa.ganadorNombre && (
          <div className={styles.ganadorBanner}>
            <span className={styles.ganadorTrophy}>🏆</span>
            <div>
              <div className={styles.ganadorTitle}>¡Ganador del sorteo!</div>
              <div className={styles.ganadorInfo}>
                <strong>{rifa.ganadorNombre}</strong> — Número{' '}
                <span className={styles.ganadorNum}>{String(rifa.ganadorNumero).padStart(3, '0')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        {rifa.estado !== 'sorteada' && (
          <div className={styles.actionsCard}>
            <h3 className={styles.actionsTitle}>Acciones</h3>
            <div className={styles.actionsRow}>
              <button
                className={`btn ${rifa.estado === 'activa' ? 'btn-ghost' : 'btn-primary'}`}
                onClick={handleToggleEstado}
              >
                {rifa.estado === 'activa' ? '🔒 Cerrar venta' : '🔓 Reactivar'}
              </button>
              {numeros.length > 0 && (
                <button
                  className="btn btn-accent"
                  onClick={handleSorteo}
                  disabled={sorteando}
                >
                  {sorteando ? <><span className="spinner" /> Sorteando...</> : '🎲 Realizar sorteo'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compradores */}
        <div className={styles.compradoresSection}>
          <div className={styles.compradoresHeader}>
            <div className={styles.tabsRow}>
              <button
                className={`${styles.tab} ${tab === 'grid' ? styles.tabActive : ''}`}
                onClick={() => setTab('grid')}
              >
                🔢 Vista grilla
              </button>
              <button
                className={`${styles.tab} ${tab === 'lista' ? styles.tabActive : ''}`}
                onClick={() => setTab('lista')}
              >
                📋 Lista de compradores ({numeros.length})
              </button>
            </div>
            {tab === 'lista' && (
              <input
                className="form-input"
                style={{ maxWidth: 260 }}
                placeholder="🔍 Buscar nombre, tel, número..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          {tab === 'grid' ? (
            <div className={styles.gridWrapper}>
              <NumeroGrid
                total={rifa.cantidadNumeros}
                numerosVendidos={numeros}
                colorPrimario={plantilla.colorPrimario}
                colorAcento={plantilla.colorAcento}
                readOnly={true}
              />
            </div>
          ) : (
            <div className={styles.listaWrapper}>
              {filteredNumeros.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon">📋</span>
                  <h3>{numeros.length === 0 ? 'Aún no hay compradores' : 'Sin resultados'}</h3>
                  <p>{numeros.length === 0 ? 'Comparte el enlace para empezar a vender' : 'Intenta con otra búsqueda'}</p>
                </div>
              ) : (
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Nombre</th>
                      <th>Contacto</th>
                      <th>Email</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNumeros
                      .sort((a, b) => a.numero - b.numero)
                      .map((n) => (
                        <tr key={n.id}>
                          <td>
                            <span className={styles.numBadge} style={{ background: plantilla.colorPrimario }}>
                              {String(n.numero).padStart(rifa.cantidadNumeros > 99 ? 3 : 2, '0')}
                            </span>
                          </td>
                          <td className={styles.nombreCell}>{n.compradoPor}</td>
                          <td>{n.contacto}</td>
                          <td className={styles.emailCell}>{n.emailComprador || '—'}</td>
                          <td className={styles.fechaCell}>
                            {new Date(n.fechaCompra).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sorteo modal */}
      {showSorteoModal && ganador && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center', maxWidth: 420 }}>
            <div className={styles.sorteoAnim}>🎲</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>¡Tenemos un ganador!</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>El número ganador del sorteo es:</p>
            <div className={styles.sorteoNum} style={{ background: plantilla.gradiente }}>
              {String(ganador.ganadorNumero).padStart(3, '0')}
            </div>
            <div className={styles.sorteoGanador}>
              <span className={styles.sorteoGanadorLabel}>Ganador</span>
              <span className={styles.sorteoGanadorName}>{ganador.ganadorNombre}</span>
            </div>
            <button
              className="btn btn-accent btn-full"
              style={{ marginTop: 24 }}
              onClick={() => setShowSorteoModal(false)}
            >
              🎉 ¡Celebrar!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
