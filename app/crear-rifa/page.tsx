'use client';
// app/crear-rifa/page.tsx
import { useState } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { crearRifa } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import PlantillaCard from '@/components/rifa/PlantillaCard';
import { PLANTILLAS, CANTIDADES_NUMEROS, type PlantillaId } from '@/types';
import styles from './crear-rifa.module.css';

const STEPS = ['Plantilla', 'Detalles', 'Números', 'Publicar'];

interface FormData {
  plantillaId: PlantillaId;
  nombre: string;
  descripcion: string;
  premio: string;
  precioPorNumero: string;
  cantidadNumeros: number;
  fechaLimite: string;
}

const DEFAULT: FormData = {
  plantillaId: 'clasica',
  nombre: '',
  descripcion: '',
  premio: '',
  precioPorNumero: '',
  cantidadNumeros: 100,
  fechaLimite: '',
};

export default function CrearRifaPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(DEFAULT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const plantilla = PLANTILLAS.find((p) => p.id === form.plantillaId)!;

  const set = (k: keyof FormData, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // Validation per step
  const validate = (): string => {
    if (step === 1) {
      if (!form.nombre.trim()) return 'El nombre de la rifa es obligatorio';
      if (!form.premio.trim()) return 'El premio es obligatorio';
      if (!form.precioPorNumero || Number(form.precioPorNumero) <= 0) return 'El precio debe ser mayor a 0';
      if (!form.fechaLimite) return 'La fecha límite es obligatoria';
      if (new Date(form.fechaLimite) <= new Date()) return 'La fecha límite debe ser futura';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  const handlePublish = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      const id = await crearRifa({
        organizadorId: user.uid,
        organizadorEmail: user.email!,
        organizadorNombre: user.displayName || user.email!,
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        premio: form.premio.trim(),
        precioPorNumero: Number(form.precioPorNumero),
        cantidadNumeros: form.cantidadNumeros,
        plantillaId: form.plantillaId,
        fechaLimite: new Date(form.fechaLimite),
        estado: 'activa',
        ganadorNumero: null,
        ganadorNombre: null,
      });
      router.push(`/rifa/${id}/admin?nueva=1`);
    } catch (e) {
      setError('Error al crear la rifa. Inténtalo de nuevo.');
      setSaving(false);
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

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className={`container ${styles.wrapper}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Nueva Rifa</h1>
          <p className={styles.subtitle}>Sigue los pasos para configurar tu rifa perfecta</p>
        </div>

        {/* Step indicator */}
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`step ${i < step ? 'completed' : ''} ${i === step ? 'active' : ''}`} style={{ width: `${100 / STEPS.length}%` }}>
              <div className="step-number">{i < step ? '✓' : i + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.content}>
          {/* ===== STEP 0: Plantilla ===== */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Elige tu plantilla</h2>
              <p className={styles.stepDesc}>La plantilla define el diseño visual de tu página de rifa</p>
              <div className={styles.plantillasGrid}>
                {PLANTILLAS.map((p) => (
                  <PlantillaCard
                    key={p.id}
                    plantilla={p}
                    selected={form.plantillaId === p.id}
                    onClick={() => set('plantillaId', p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ===== STEP 1: Detalles ===== */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Detalles de la rifa</h2>
              <p className={styles.stepDesc}>Cuéntale a los participantes qué estás rifando</p>
              <div className={styles.formGrid}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Nombre de la rifa *</label>
                  <input
                    id="rifa-nombre"
                    className="form-input"
                    placeholder="Ej: Rifa del BMW 2024"
                    value={form.nombre}
                    onChange={(e) => set('nombre', e.target.value)}
                    maxLength={80}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Premio principal *</label>
                  <input
                    id="rifa-premio"
                    className="form-input"
                    placeholder="Ej: BMW Serie 3 2024, Viaje a Cartagena, etc."
                    value={form.premio}
                    onChange={(e) => set('premio', e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio por número (COP) *</label>
                  <input
                    id="rifa-precio"
                    className="form-input"
                    type="number"
                    placeholder="Ej: 10000"
                    value={form.precioPorNumero}
                    onChange={(e) => set('precioPorNumero', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fecha límite *</label>
                  <input
                    id="rifa-fecha"
                    className="form-input"
                    type="date"
                    value={form.fechaLimite}
                    onChange={(e) => set('fechaLimite', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Descripción (opcional)</label>
                  <textarea
                    id="rifa-descripcion"
                    className="form-textarea"
                    placeholder="Describe tu rifa, condiciones, información adicional..."
                    value={form.descripcion}
                    onChange={(e) => set('descripcion', e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                    {form.descripcion.length}/500
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2: Cantidad ===== */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Cantidad de números</h2>
              <p className={styles.stepDesc}>¿Cuántos boletos quieres poner a la venta?</p>
              <div className={styles.cantidadesGrid}>
                {CANTIDADES_NUMEROS.map((c) => {
                  const ingresos = c * Number(form.precioPorNumero || 0);
                  return (
                    <button
                      key={c}
                      type="button"
                      className={`${styles.cantidadCard} ${form.cantidadNumeros === c ? styles.cantidadSelected : ''}`}
                      onClick={() => set('cantidadNumeros', c)}
                    >
                      <span className={styles.cantidadNum}>{c}</span>
                      <span className={styles.cantidadLabel}>números</span>
                      {Number(form.precioPorNumero) > 0 && (
                        <span className={styles.cantidadIngresos}>
                          ≈ ${ingresos.toLocaleString('es-CO')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className={styles.cantidadPreview}>
                <div className={styles.cantidadPreviewGrid}>
                  {Array.from({ length: Math.min(form.cantidadNumeros, 20) }, (_, i) => (
                    <div key={i} className={styles.cantidadPreviewNum} style={{ background: plantilla.colorPrimario }}>
                      {String(i + 1).padStart(form.cantidadNumeros > 99 ? 3 : 2, '0')}
                    </div>
                  ))}
                  {form.cantidadNumeros > 20 && (
                    <div className={styles.cantidadPreviewMore}>
                      +{form.cantidadNumeros - 20} más
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3: Preview ===== */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h2 className={styles.stepTitle}>Resumen de tu rifa</h2>
              <p className={styles.stepDesc}>Verifica los datos antes de publicar</p>
              <div className={styles.preview} style={{ background: plantilla.gradiente }}>
                <span className={styles.previewEmoji}>{plantilla.emoji}</span>
                <h3 className={styles.previewNombre}>{form.nombre}</h3>
                <p className={styles.previewPremio}>🏆 {form.premio}</p>
                <div className={styles.previewBadges}>
                  <span>💰 ${Number(form.precioPorNumero).toLocaleString('es-CO')}</span>
                  <span>🔢 {form.cantidadNumeros} números</span>
                  <span>📅 {new Date(form.fechaLimite).toLocaleDateString('es-CO')}</span>
                </div>
                <div className={styles.previewPlantilla}>Plantilla: {plantilla.nombre}</div>
              </div>

              <div className={styles.ingresoEstimado}>
                <div className={styles.ingresoCard}>
                  <span>💰</span>
                  <div>
                    <div className={styles.ingresoTitle}>Ingreso estimado (100% vendido)</div>
                    <div className={styles.ingresoValue}>
                      ${(form.cantidadNumeros * Number(form.precioPorNumero)).toLocaleString('es-CO')} COP
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          {/* Navigation */}
          <div className={styles.navButtons}>
            {step > 0 && (
              <button className="btn btn-ghost" onClick={back}>
                ← Anterior
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={next}>
                Siguiente →
              </button>
            ) : (
              <button className="btn btn-accent btn-lg" onClick={handlePublish} disabled={saving}>
                {saving ? (
                  <><span className="spinner" /> Publicando...</>
                ) : (
                  '🚀 Publicar Rifa'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
