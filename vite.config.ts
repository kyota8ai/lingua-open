/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

/*
 * The API key lives in localStorage, so any injected script would be able to
 * read it. `connect-src` is the control that matters: even with script
 * execution, there is nowhere to send the key except the two AI providers.
 * `blob:` in script-src/worker-src is required by the Gemini AudioWorklet.
 * Served as a real header too (public/_headers) for hosts that support it;
 * the meta tag covers static hosts that do not.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' blob:",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self' blob: mediastream:",
  "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com wss://generativelanguage.googleapis.com",
].join("; ");

/** Injected only in builds: Vite's dev server needs inline scripts for HMR. */
const cspMeta = {
  name: "csp-meta",
  apply: "build" as const,
  transformIndexHtml(html: string) {
    return html.replace(
      "<head>",
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    );
  },
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cspMeta,
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "lingua-open",
        short_name: "lingua-open",
        description:
          "Privacy-first AI language speaking practice. Your key, your data, no servers.",
        theme_color: "#f6fafd",
        background_color: "#f6fafd",
        display: "standalone",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell + assets only. All user data lives in IndexedDB; API
        // calls go to the user's provider and are never cached.
        globPatterns: ["**/*.{js,css,html,woff,woff2,png,svg}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
