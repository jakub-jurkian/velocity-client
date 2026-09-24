import PageTransition from "../../components/common/PageTransition";
import IconCard from "../../components/ui/IconCard";
import PageHeader from "../../components/ui/PageHeader";
import styles from "./ContactPage.module.scss";

const ContactPage = () => (
  <PageTransition>
    <PageHeader
      align="center"
      title="Get in Touch"
      subtitle="Have questions about the fleet or business partnerships?"
    />

    <div className={styles.grid}>
      <IconCard icon="📍" title="Visit HQ" headingLevel={2}>
        ul. Marszałkowska 1
        <br />
        00-001 Warszawa, PL
      </IconCard>

      <IconCard icon="📞" title="Call Us" headingLevel={2}>
        <a href="tel:+48123456789">+48 123 456 789</a>
        <span className={styles.sub}>Mon-Fri, 9am - 5pm</span>
      </IconCard>

      <IconCard icon="✉️" title="Email Us" headingLevel={2}>
        <a href="mailto:hello@velocity.com">hello@velocity.com</a>
        <span className={styles.sub}>We reply within 24h</span>
      </IconCard>
    </div>
  </PageTransition>
);

export default ContactPage;
