import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    nitro({ defaultPreset: "cloudflare-module" }),
  ],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul")) return "vendor-ui";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("zod") || id.includes("@hookform")) return "vendor-forms";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
