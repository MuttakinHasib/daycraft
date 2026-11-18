import { defineConfig } from 'drizzle-kit';

// `bunx drizzle-kit generate` writes numbered migrations to ./drizzle; the app applies them at startup.
export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: './src/data/schema.ts',
  out: './drizzle',
});
