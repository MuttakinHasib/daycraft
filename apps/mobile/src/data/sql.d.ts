// Drizzle's migrations import .sql files as strings (bundled by babel-plugin-inline-import).
declare module '*.sql' {
  const sql: string;
  export default sql;
}
