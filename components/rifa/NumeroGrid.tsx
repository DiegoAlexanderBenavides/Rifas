'use client';
// components/rifa/NumeroGrid.tsx
import { useMemo } from 'react';
import type { Numero } from '@/types';
import styles from './NumeroGrid.module.css';

interface Props {
  total: number;
  numerosVendidos: Numero[];
  selectedNum?: number | null;
  onSelect?: (n: number) => void;
  colorPrimario?: string;
  colorAcento?: string;
  readOnly?: boolean;
}

export default function NumeroGrid({
  total,
  numerosVendidos,
  selectedNum,
  onSelect,
  colorPrimario = '#1a237e',
  colorAcento = '#ffd700',
  readOnly = false,
}: Props) {
  const vendidosSet = useMemo(
    () => new Set(numerosVendidos.map((n) => n.numero)),
    [numerosVendidos]
  );

  return (
    <div
      className={styles.grid}
      style={{ '--color-primary': colorPrimario, '--color-acento': colorAcento } as React.CSSProperties}
    >
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const vendido = vendidosSet.has(num);
        const seleccionado = selectedNum === num;
        const comprador = vendido ? numerosVendidos.find((n) => n.numero === num) : null;

        return (
          <button
            key={num}
            type="button"
            className={`${styles.num} ${vendido ? styles.vendido : ''} ${seleccionado ? styles.seleccionado : ''}`}
            onClick={() => !vendido && !readOnly && onSelect?.(num)}
            disabled={vendido || readOnly}
            title={vendido ? `Comprado por: ${comprador?.compradoPor}` : `Seleccionar número ${String(num).padStart(3, '0')}`}
            aria-label={`Número ${num} ${vendido ? 'vendido' : 'disponible'}`}
          >
            {String(num).padStart(total > 99 ? 3 : 2, '0')}
          </button>
        );
      })}
    </div>
  );
}
