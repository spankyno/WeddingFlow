import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";
import * as schema from "@drizzle/schema";

/**
 * Devuelve un cliente Drizzle atado al binding D1 de la request actual.
 * En Cloudflare Pages, el binding solo existe dentro del contexto de una request,
 * por eso esta función se llama en cada handler/route en vez de crear un cliente global.
 */
export function getDb() {
  const { env } = getRequestContext<{ DB: D1Database }>();
  return drizzle(env.DB, { schema });
}
