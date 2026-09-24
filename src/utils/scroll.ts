// Brings the viewport back to the top, e.g. after moving to another page of a
// list, so the new rows are read from the first one rather than from wherever
// the pagination controls left the user.

export const scrollToTop = () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
};
