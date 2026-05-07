// lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Rifa, Numero } from '@/types';

// ==================== RIFAS ====================

export async function crearRifa(rifa: Omit<Rifa, 'id' | 'createdAt' | 'numerosVendidos'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'rifas'), {
    ...rifa,
    fechaLimite: Timestamp.fromDate(rifa.fechaLimite),
    createdAt: Timestamp.now(),
    numerosVendidos: 0,
    estado: 'activa',
  });
  return docRef.id;
}

export async function obtenerRifa(id: string): Promise<Rifa | null> {
  const docRef = doc(db, 'rifas', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    fechaLimite: data.fechaLimite.toDate(),
    createdAt: data.createdAt.toDate(),
  } as Rifa;
}

export async function obtenerRifasDeUsuario(uid: string): Promise<Rifa[]> {
  const q = query(
    collection(db, 'rifas'),
    where('organizadorId', '==', uid)
    // Nota: sin orderBy para evitar requerir índice compuesto en Firestore
  );
  const snapshot = await getDocs(q);
  const rifas = snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    fechaLimite: d.data().fechaLimite.toDate(),
    createdAt: d.data().createdAt.toDate(),
  })) as Rifa[];
  // Ordenar por fecha de creación descendente en el cliente
  return rifas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function obtenerRifasPublicas(): Promise<Rifa[]> {
  const q = query(
    collection(db, 'rifas'),
    where('estado', '==', 'activa')
    // Sin orderBy para evitar índice compuesto
  );
  const snapshot = await getDocs(q);
  const rifas = snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    fechaLimite: d.data().fechaLimite.toDate(),
    createdAt: d.data().createdAt.toDate(),
  })) as Rifa[];
  return rifas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function actualizarRifa(id: string, data: Partial<Rifa>): Promise<void> {
  const docRef = doc(db, 'rifas', id);
  await updateDoc(docRef, data);
}

export async function eliminarRifa(id: string): Promise<void> {
  await deleteDoc(doc(db, 'rifas', id));
}

export async function realizarSorteo(rifaId: string): Promise<{ ganadorNumero: number; ganadorNombre: string }> {
  const numerosSnap = await getDocs(
    query(collection(db, 'rifas', rifaId, 'numeros'), where('estado', 'in', ['reservado', 'pagado']))
  );
  if (numerosSnap.empty) throw new Error('No hay números vendidos para sortear');
  const numeros = numerosSnap.docs.map((d) => d.data() as Numero);
  const ganador = numeros[Math.floor(Math.random() * numeros.length)];
  await updateDoc(doc(db, 'rifas', rifaId), {
    estado: 'sorteada',
    ganadorNumero: ganador.numero,
    ganadorNombre: ganador.compradoPor,
  });
  return { ganadorNumero: ganador.numero, ganadorNombre: ganador.compradoPor };
}

// ==================== NÚMEROS ====================

export async function comprarNumero(
  rifaId: string,
  numero: Omit<Numero, 'id' | 'rifaId' | 'fechaCompra' | 'estado'>
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    const rifaRef = doc(db, 'rifas', rifaId);
    const numeroRef = doc(db, 'rifas', rifaId, 'numeros', numero.numero.toString());
    const numeroSnap = await transaction.get(numeroRef);
    if (numeroSnap.exists()) throw new Error('Este número ya fue comprado');
    transaction.set(numeroRef, {
      ...numero,
      rifaId,
      estado: 'reservado',
      fechaCompra: Timestamp.now(),
    });
    transaction.update(rifaRef, { numerosVendidos: increment(1) });
  });
}

export async function obtenerNumerosDeRifa(rifaId: string): Promise<Numero[]> {
  const snapshot = await getDocs(collection(db, 'rifas', rifaId, 'numeros'));
  return snapshot.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    fechaCompra: d.data().fechaCompra.toDate(),
  })) as Numero[];
}
