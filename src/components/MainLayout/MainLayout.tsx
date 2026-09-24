import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { cx } from "../../utils/cx";
import PageLoader from "../ui/PageLoader";
import SkipLink, { MAIN_CONTENT_ID } from "../ui/SkipLink";
import Footer from "./Footer/Footer";
import { Navbar } from "./Navbar/Navbar";
import styles from "./MainLayout.module.scss";

const MainLayout = () => (
  <div className={styles.layout}>
    <div className={styles.orbs} aria-hidden="true">
      <div className={cx(styles.orb, styles.orbRight)} />
      <div className={cx(styles.orb, styles.orbLeft)} />
    </div>

    <div className={styles.content}>
      <SkipLink />
      <Navbar />
      {/* Focusable, so the skip link can land here. */}
      <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
        {/* Lazy pages load here, with the navbar and footer staying put. */}
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  </div>
);

export default MainLayout;
