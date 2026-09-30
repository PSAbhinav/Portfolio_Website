// The single query interface every server module uses. Neon's tagged
// template already has this shape; the local PGlite adapter implements it so
// routes and tests never care which database is behind it.
export type Sql = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;
