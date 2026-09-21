import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  /*
   * Fail the production build when VITE_API_URL is missing.
   *
   * Vite replaces `import.meta.env.VITE_API_URL` at build time, so an unset
   * variable does not throw — it inlines the literal `undefined`, and
   * `` `${undefined}/api/v1/...` `` becomes the relative path
   * "undefined/api/v1/...". That resolves against the site's own origin, the
   * SPA rewrite answers it, and the app reports a plausible-looking HTTP error
   * instead of a misconfiguration. It is far cheaper to stop here than to
   * diagnose it from a deployed bundle.
   *
   * Dev is exempt: `vite` should start without a .env so the UI can be worked
   * on with no API running.
   */
  if (command === "build" && !env.VITE_API_URL) {
    throw new Error(
      "VITE_API_URL is not set. The production build needs the API's origin " +
        "(e.g. https://api.example.com) — set it in the host's environment " +
        "variables, or in .env for a local build.",
    );
  }

  return {
    plugins: [react()],
  };
});
