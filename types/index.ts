// types/index.ts
export interface Usuario {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

export interface Rifa {
  id?: string;
  organizadorId: string;
  organizadorEmail: string;
  organizadorNombre: string;
  telefonoOrganizador?: string;
  nombre: string;
  descripcion: string;
  premio: string;
  precioPorNumero: number;
  cantidadNumeros: number;
  plantillaId: PlantillaId;
  fechaLimite: Date;
  estado: 'activa' | 'cerrada' | 'sorteada';
  ganadorNumero?: number | null;
  ganadorNombre?: string | null;
  createdAt: Date;
  numerosVendidos: number;
}

export interface Numero {
  id?: string;
  rifaId: string;
  numero: number;
  compradoPor: string;
  contacto: string;
  emailComprador: string;
  estado: 'reservado' | 'pagado';
  fechaCompra: Date;
}

export type PlantillaId = 'clasica' | 'navidad' | 'deporte' | 'premium' | 'tropical' | 'romantica';

export interface Plantilla {
  id: PlantillaId;
  nombre: string;
  descripcion: string;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  gradiente: string;
  emoji: string;
  patron: string;
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'clasica',
    nombre: 'Clásica',
    descripcion: 'Elegante y versátil para cualquier tipo de rifa',
    colorPrimario: '#1a237e',
    colorSecundario: '#283593',
    colorAcento: '#ffd700',
    gradiente: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%)',
    emoji: '🎯',
    patron: 'clasica',
  },
  {
    id: 'navidad',
    nombre: 'Navidad',
    descripcion: 'Perfecta para rifas navideñas y de temporada',
    colorPrimario: '#b71c1c',
    colorSecundario: '#1b5e20',
    colorAcento: '#ffd700',
    gradiente: 'linear-gradient(135deg, #b71c1c 0%, #1b5e20 100%)',
    emoji: '🎄',
    patron: 'navidad',
  },
  {
    id: 'deporte',
    nombre: 'Deportiva',
    descripcion: 'Ideal para rifas de equipos y eventos deportivos',
    colorPrimario: '#1b5e20',
    colorSecundario: '#212121',
    colorAcento: '#76ff03',
    gradiente: 'linear-gradient(135deg, #1b5e20 0%, #212121 100%)',
    emoji: '⚽',
    patron: 'deporte',
  },
  {
    id: 'premium',
    nombre: 'Premium',
    descripcion: 'Lujosa para rifas de autos, joyas y premios grandes',
    colorPrimario: '#212121',
    colorSecundario: '#37474f',
    colorAcento: '#ffd700',
    gradiente: 'linear-gradient(135deg, #212121 0%, #37474f 50%, #212121 100%)',
    emoji: '💎',
    patron: 'premium',
  },
  {
    id: 'tropical',
    nombre: 'Tropical',
    descripcion: 'Vibrante para rifas de viajes y experiencias',
    colorPrimario: '#e65100',
    colorSecundario: '#f57f17',
    colorAcento: '#00bcd4',
    gradiente: 'linear-gradient(135deg, #e65100 0%, #f57f17 50%, #ffeb3b 100%)',
    emoji: '🌴',
    patron: 'tropical',
  },
  {
    id: 'romantica',
    nombre: 'Romántica',
    descripcion: 'Para rifas de San Valentín, bodas y celebraciones',
    colorPrimario: '#880e4f',
    colorSecundario: '#6a1b9a',
    colorAcento: '#f48fb1',
    gradiente: 'linear-gradient(135deg, #880e4f 0%, #6a1b9a 100%)',
    emoji: '💖',
    patron: 'romantica',
  },
];

export const CANTIDADES_NUMEROS = [50, 100, 200, 300, 500, 1000];
