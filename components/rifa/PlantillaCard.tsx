'use client';
// components/rifa/PlantillaCard.tsx
import type { Plantilla } from '@/types';
import styles from './PlantillaCard.module.css';

interface Props {
  plantilla: Plantilla;
  selected: boolean;
  onClick: () => void;
}

export default function PlantillaCard({ plantilla, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      aria-label={`Seleccionar plantilla ${plantilla.nombre}`}
    >
      {/* Preview */}
      <div className={styles.preview} style={{ background: plantilla.gradiente }}>
        <span className={styles.emoji}>{plantilla.emoji}</span>
        <div className={styles.previewNums}>
          {[1, 7, 23, 45].map((n) => (
            <span key={n} className={styles.previewNum}>
              {String(n).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{plantilla.nombre}</h3>
        <p className={styles.desc}>{plantilla.descripcion}</p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className={styles.checkmark}>✓</div>
      )}
    </button>
  );
}
