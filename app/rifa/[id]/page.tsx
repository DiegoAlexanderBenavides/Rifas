'use client';
// app/rifa/[id]/page.tsx  — Página pública de la rifa
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { obtenerRifa, obtenerNumerosDeRifa, comprarNumero } from '@/lib/firestore';
import NumeroGrid from '@/components/rifa/NumeroGrid';
import { PLANTILLAS } from '@/types';
import type { Rifa, Numero } from '@/types';
import styles from './rifa.module.css';

interface CompraForm {
  nombre: string;
  contacto: string;
  email: string;
}

export default function RifaPublicaPage() {
  const params = useParams();
  const rifaId = params.id as string;

  const [rifa, setRifa] = useState<Rifa | null>(null);
  const [numeros, setNumeros] = useState<Numero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [form, setForm] = useState<CompraForm>({ nombre: '', contacto: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    Promise.all([obtenerRifa(rifaId), obtenerNumerosDeRifa(rifaId)])
      .then(([r, n]) => {
        setRifa(r);
        setNumeros(n);
      })
      .finally(() => setLoading(false));
  }, [rifaId]);

  const plantilla = PLANTILLAS.find((p) => p.id === rifa?.plantillaId) || PLANTILLAS[0];
  const disponibles = (rifa?.cantidadNumeros || 0) - numeros.length;
  const porcentaje = rifa ? Math.round((numeros.length / rifa.cantidadNumeros) * 100) : 0;

  const handleSelectNum = (n: number) => {
    setSelectedNum(n);
    setShowModal(true);
    setError('');
    setSuccess(false);
    setForm({ nombre: '', contacto: '', email: '' });
  };

  const handleComprar = async () => {
    if (!form.nombre.trim()) { setError('Tu nombre es obligatorio'); return; }
    if (!form.contacto.trim()) { setError('Tu número de contacto es obligatorio'); return; }
    if (!selectedNum || !rifa) return;

    setSubmitting(true);
    setError('');
    try {
      await comprarNumero(rifaId, {
        numero: selectedNum,
        compradoPor: form.nombre.trim(),
        contacto: form.contacto.trim(),
        emailComprador: form.email.trim(),
      });

      // Reload numeros
      const updatedNumeros = await obtenerNumerosDeRifa(rifaId);
      setNumeros(updatedNumeros);

      // Send email notification to organizer
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toEmail: rifa.organizadorEmail,
            organizadorNombre: rifa.organizadorNombre,
            rifaNombre: rifa.nombre,
            compradorNombre: form.nombre.trim(),
            compradorContacto: form.contacto.trim(),
            compradorEmail: form.email.trim(),
            numero: selectedNum,
          }),
        });
      } catch {
        // Email failure is non-critical
      }

      setSuccess(true);
      setSelectedNum(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al reservar el número';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNum(null);
    setError('');
    setSuccess(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">🎯</div>
        <div className="spinner" style={{ width: 30, height: 30 }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Cargando rifa...</p>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="loading-screen">
        <span style={{ fontSize: 64 }}>😕</span>
        <h2>Rifa no encontrada</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Esta rifa no existe o fue eliminada</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Hero Header con la plantilla */}
      <div className={styles.hero} style={{ background: plantilla.gradiente }}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <span className={styles.heroEmoji}>{plantilla.emoji}</span>
          <h1 className={styles.heroTitle}>{rifa.nombre}</h1>
          <p className={styles.heroPremio}>🏆 {rifa.premio}</p>
          <div className={styles.heroBadges}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>💰</span>
              <div>
                <div className={styles.badgeLabel}>Por número</div>
                <div className={styles.badgeValue}>${rifa.precioPorNumero.toLocaleString('es-CO')}</div>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>🎟️</span>
              <div>
                <div className={styles.badgeLabel}>Disponibles</div>
                <div className={styles.badgeValue}>{disponibles}</div>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>📅</span>
              <div>
                <div className={styles.badgeLabel}>Fecha límite</div>
                <div className={styles.badgeValue}>
                  {new Date(rifa.fechaLimite).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.main}`}>
        {/* Progress */}
        <div className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <div>
              <span className={styles.progressLabel}>Progreso de la rifa</span>
              <span className={styles.progressSub}>{numeros.length} de {rifa.cantidadNumeros} números vendidos</span>
            </div>
            <span className={styles.progressPct}>{porcentaje}%</span>
          </div>
          <div className="progress-bar-container" style={{ height: 12 }}>
            <div className="progress-bar" style={{ width: `${porcentaje}%` }} />
          </div>
          <div className={styles.progressLegend}>
            <span className={styles.legendDot} style={{ background: 'rgba(255,215,0,0.7)' }} /> Disponible
            <span className={styles.legendDot} style={{ background: 'rgba(255,255,255,0.1)', marginLeft: 16 }} /> Vendido
          </div>
        </div>

        {/* Estado banner */}
        {rifa.estado !== 'activa' && (
          <div className={`alert ${rifa.estado === 'sorteada' ? 'alert-warning' : 'alert-danger'}`}>
            {rifa.estado === 'cerrada' ? '🔒 Esta rifa está cerrada' : `🏆 ¡Rifa sorteada! Ganador: ${rifa.ganadorNombre} — Número ${String(rifa.ganadorNumero).padStart(3,'0')}`}
          </div>
        )}

        {/* Descripción */}
        {rifa.descripcion && (
          <div className={styles.descripcion}>
            <p>{rifa.descripcion}</p>
          </div>
        )}

        {/* Grid de números */}
        <div className={styles.gridSection}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>Selecciona tu número</h2>
            <p className={styles.gridSubtitle}>Haz clic en un número disponible para reservarlo</p>
          </div>
          <div className={styles.gridWrapper}>
            <NumeroGrid
              total={rifa.cantidadNumeros}
              numerosVendidos={numeros}
              selectedNum={selectedNum}
              onSelect={rifa.estado === 'activa' ? handleSelectNum : undefined}
              colorPrimario={plantilla.colorPrimario}
              colorAcento={plantilla.colorAcento}
              readOnly={rifa.estado !== 'activa'}
            />
          </div>
        </div>

        {/* Organizador */}
        <div className={styles.orgCard}>
          <span className={styles.orgIcon}>👤</span>
          <div>
            <div className={styles.orgLabel}>Organizado por</div>
            <div className={styles.orgName}>{rifa.organizadorNombre}</div>
          </div>
        </div>
      </div>

      {/* Modal de compra */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {success ? (
              <div className={styles.successModal}>
                <span className={styles.successIcon}>🎉</span>
                <h2>¡Número reservado!</h2>
                <div className={styles.numReservado} style={{ background: plantilla.gradiente }}>
                  {String(selectedNum || 0).padStart(rifa.cantidadNumeros > 99 ? 3 : 2, '0')}
                </div>
                <p>Tu número fue reservado exitosamente. El organizador se comunicará contigo para confirmar el pago.</p>
                <button className="btn btn-accent btn-full" onClick={closeModal}>¡Perfecto!</button>
              </div>
            ) : (
              <>
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>Reservar número</h2>
                  <div className={styles.modalNum} style={{ background: plantilla.gradiente }}>
                    {String(selectedNum || 0).padStart(rifa.cantidadNumeros > 99 ? 3 : 2, '0')}
                  </div>
                </div>

                <div className={styles.modalPrice}>
                  <span>💰</span>
                  <span>${rifa.precioPorNumero.toLocaleString('es-CO')} COP</span>
                </div>

                <div className={styles.modalForm}>
                  <div className="form-group">
                    <label className="form-label">Nombre completo *</label>
                    <input
                      id="compra-nombre"
                      className="form-input"
                      placeholder="Tu nombre completo"
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">WhatsApp / Teléfono *</label>
                    <input
                      id="compra-contacto"
                      className="form-input"
                      placeholder="Ej: 3001234567"
                      value={form.contacto}
                      onChange={(e) => setForm((f) => ({ ...f, contacto: e.target.value }))}
                      type="tel"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email (opcional)</label>
                    <input
                      id="compra-email"
                      className="form-input"
                      placeholder="tu@email.com"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      type="email"
                    />
                  </div>
                </div>

                {error && <div className="alert alert-danger">⚠️ {error}</div>}

                <div className={styles.modalNote}>
                  ℹ️ Tu número quedará <strong>reservado</strong>. El organizador confirmará el pago contigo directamente.
                </div>

                <div className={styles.modalActions}>
                  <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                  <button
                    id="btn-confirmar-compra"
                    className="btn btn-accent"
                    style={{ flex: 1 }}
                    onClick={handleComprar}
                    disabled={submitting}
                  >
                    {submitting ? <><span className="spinner" /> Reservando...</> : '✅ Confirmar reserva'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
