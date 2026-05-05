'use client';
// app/page.tsx - Landing Page
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

const FEATURES = [
  { icon: '📧', title: 'Registro con Gmail', desc: 'Inicia sesión en un clic con tu cuenta de Google. Sin formularios complicados.' },
  { icon: '🎨', title: '6 Plantillas Premium', desc: 'Elige entre plantillas hermosas: Clásica, Navidad, Deportiva, Premium, Tropical y Romántica.' },
  { icon: '🔢', title: 'Números Personalizados', desc: 'Define la cantidad exacta que necesitas: 50, 100, 200, 300, 500 o 1000 números.' },
  { icon: '📤', title: 'Comparte Fácil', desc: 'Obtén un enlace único para compartir tu rifa por WhatsApp, redes sociales o email.' },
  { icon: '📱', title: 'Compra en Segundos', desc: 'Los participantes eligen su número favorito y dejan sus datos en segundos.' },
  { icon: '📊', title: 'Dashboard Completo', desc: 'Sigue el progreso de tus rifas, ve quién compró cada número y haz el sorteo.' },
];

const STEPS = [
  { num: '01', title: 'Regístrate con Gmail', desc: 'Un clic y ya estás dentro. Usamos Google para máxima seguridad.' },
  { num: '02', title: 'Crea tu Rifa', desc: 'Elige tu plantilla favorita, define el premio y el precio por número.' },
  { num: '03', title: 'Comparte el Link', desc: 'Envía el enlace único a tus amigos, familia o grupo de WhatsApp.' },
  { num: '04', title: '¡Sortea y Celebra!', desc: 'Cuando estén listos, haz el sorteo automático desde tu panel.' },
];

export default function HomePage() {
  const { user, signInWithGoogle } = useAuthContext();
  const router = useRouter();

  const handleCTA = async () => {
    if (user) { router.push('/dashboard'); return; }
    try { await signInWithGoogle(); router.push('/dashboard'); } catch { /* err */ }
  };

  return (
    <main className={styles.main}>
      {/* ==================== HERO ==================== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgOrb1} />
          <div className={styles.heroBgOrb2} />
          <div className={styles.heroBgGrid} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span>✨</span> La plataforma #1 para rifas en Colombia
          </div>

          <h1 className={styles.heroTitle}>
            Organiza tu rifa<br />
            <span className={styles.heroTitleAccent}>de forma profesional</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Regístrate con Gmail, elige una plantilla hermosa, personaliza los números
            y empieza a vender en menos de 5 minutos.
          </p>

          <div className={styles.heroCTAs}>
            <button className="btn btn-accent btn-lg" onClick={handleCTA}>
              🎯 {user ? 'Ir al Dashboard' : 'Empezar Gratis con Gmail'}
            </button>
            <Link href="#como-funciona" className="btn btn-outline btn-lg">
              ¿Cómo funciona?
            </Link>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>500+</span>
              <span className={styles.heroStatLabel}>Rifas creadas</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>10K+</span>
              <span className={styles.heroStatLabel}>Números vendidos</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>100%</span>
              <span className={styles.heroStatLabel}>Gratis para organizar</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todo lo que necesitas para tu rifa</h2>
            <p className={styles.sectionSubtitle}>Herramientas poderosas, interfaz simple</p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className={styles.section} id="como-funciona">
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¿Cómo funciona?</h2>
            <p className={styles.sectionSubtitle}>En 4 pasos simples tienes tu rifa lista</p>
          </div>

          <div className={styles.stepsGrid}>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.num}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
                {i < STEPS.length - 1 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section className={styles.ctaSection}>
        <div className={`container ${styles.ctaContent}`}>
          <div className={styles.ctaBg} />
          <h2 className={styles.ctaTitle}>¿Listo para crear tu primera rifa?</h2>
          <p className={styles.ctaSubtitle}>Es gratis, rápido y sin complicaciones</p>
          <button className="btn btn-accent btn-lg" onClick={handleCTA}>
            🚀 {user ? 'Ir a mi Dashboard' : 'Crear mi primera rifa'}
          </button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerLogo}>
              <span>🎯</span> RifasApp
            </div>
            <p className={styles.footerText}>© 2025 RifasApp. Hecho con ❤️ para Colombia.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
