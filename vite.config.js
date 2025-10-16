import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [
      "02ec3218-4c01-4546-a21b-f6c1a35952f8-00-10qi5ei6iijo1.picard.replit.dev",
    ],
  },
});
