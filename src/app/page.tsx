import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const metrics = [
  { value: "01", label: "Single-screen billing flow" },
  { value: "24/7", label: "Operational visibility" },
  { value: "v2.6", label: "Current platform release" },
];

export default function WelcomePage() {
  return (
    <main className={styles.page}>
      <div className={styles.backdrop} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.glow} />
      </div>

      <section className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark} aria-label="MARGROS home">
            <div className={styles.markFrame}>
              <Image
                src="/logo.png"
                alt="MARGROS logo"
                width={40}
                height={40}
                className={styles.headerLogo}
                priority
              />
            </div>
            <div>
              <p className={styles.brand}>MARGROS</p>
              <p className={styles.brandSub}>POS Platform</p>
            </div>
          </Link>

          <div className={styles.headerActions}>
            <Link href="/auth/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </header>

        <div className={styles.hero}>
          <div className={styles.copy}>
            <p className="eyebrow">Restaurant Intelligence</p>
            <h1 className={styles.title}>
              Smart billing, menu control, and restaurant operations in one{" "}
              <span>editorial-grade workspace.</span>
            </h1>

            <div className={styles.ctas}>
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Start Free
              </Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg">
                Continue to Sign In
              </Link>
            </div>
          </div>

          <aside className={styles.panel}>
            <div className={`card card-padded ${styles.brandCard}`}>
              <div className={styles.logoHalo} aria-hidden="true" />
              <div className={styles.logoWrap}>
                <Image
                  src="/logo.png"
                  alt="MARGROS POS logo"
                  width={140}
                  height={140}
                  className={styles.logo}
                  priority
                />
              </div>

              <div className={styles.panelCopy}>
                <p className="eyebrow">MARGROS POS</p>
                <h2 className={styles.panelTitle}>Smart Billing for Smart Restaurants</h2>
                <p className={styles.panelText}>
                  The welcome experience now follows the same visual system as the
                  dashboard, auth flow, and reporting surfaces.
                </p>
              </div>
            </div>

            <div className={styles.metrics}>
              {metrics.map((metric) => (
                <div key={metric.label} className={`card card-padded ${styles.metricCard}`}>
                  <p className={styles.metricValue}>{metric.value}</p>
                  <p className={styles.metricLabel}>{metric.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <footer className={styles.footer}>
          <p>© 2026 Margros Technologies</p>
          <p>Smart. Fast. Reliable.</p>
        </footer>
      </section>
    </main>
  );
}
