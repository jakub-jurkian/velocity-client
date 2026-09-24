import { m } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const animations = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// `m` rather than `motion`: the animation features come from the LazyMotion
// provider in App, so the full motion bundle is never shipped.
const PageTransition = ({ children }: Props) => (
  <m.div
    variants={animations}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
    style={{ width: "100%" }} // to not break layout
  >
    {children}
  </m.div>
);

export default PageTransition;
