import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = (process.env.GITHUB_REPOSITORY || 'Liredro/Liana_Webstie').split('/')[1];
const projectBase = repository.toLowerCase().endsWith('.github.io') ? '/' : `/${repository}/`;

// GitHub Pages serves project repositories under /<repository>/.
// Keeping Vite's base correct ensures CSS, JS, and images resolve on Pages.
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'production-csp',
      enforce: 'post',
      transformIndexHtml(html, context) {
        if (context.server) return html;
        const policy = [
          "default-src 'self'",
          "script-src 'self' https://static.cloudflareinsights.com https://cloud.umami.is",
          "style-src 'self' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data:",
          "connect-src 'self' https://cloudflareinsights.com https://gateway.umami.is https://cloud.umami.is",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          "frame-src 'none'"
        ].join('; ');
        return html.replace(
          '<head>',
          `<head>\n  <meta http-equiv="Content-Security-Policy" content="${policy}">`
        );
      }
    }
  ],
  base: process.env.GITHUB_ACTIONS === 'true' ? projectBase : '/',
  build: { outDir: 'dist' }
});
