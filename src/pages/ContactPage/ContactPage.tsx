import PageTransition from "../../components/common/PageTransition";
import styles from "./ContactPage.module.scss";

const ContactPage = () => {
  return (
    <PageTransition>
      <div className={styles.contactPage}>
        <section className={styles.contactSection}>
          <h2>Get in Touch</h2>
          <p className={styles.contactSubtitle}>
            Have questions about the fleet or business partnerships?
          </p>

          <div className={styles.contactGrid}>
            {/* Address Card */}
            <article className={styles.contactCard}>
              <div className={styles.icon} aria-hidden="true">
                📍
              </div>
              <h3>Visit HQ</h3>
              <p>
                ul. Marszałkowska 1
                <br />
                00-001 Warszawa, PL
              </p>
            </article>

            {/* Phone Card */}
            <article className={styles.contactCard}>
              <div className={styles.icon} aria-hidden="true">
                📞
              </div>
              <h3>Call Us</h3>
              <p>
                <a href="tel:+48123456789">+48 123 456 789</a>
                <br />
                <span className={styles.sub}>Mon-Fri, 9am - 5pm</span>
              </p>
            </article>

            {/* Email Card */}
            <article className={styles.contactCard}>
              <div className={styles.icon} aria-hidden="true">
                ✉️
              </div>
              <h3>Email Us</h3>
              <p>
                <a href="mailto:hello@velocity.com">hello@velocity.com</a>
                <br />
                <span className={styles.sub}>We reply within 24h</span>
              </p>
            </article>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default ContactPage;
