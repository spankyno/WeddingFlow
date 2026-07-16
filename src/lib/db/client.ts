import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "@drizzle/schema";

/**
 * Devuelve un cliente Drizzle atado al binding D1 de la request actual.
 * El binding solo existe dentro del contexto de una request (o de `next dev` gracias a
 * initOpenNextCloudflareForDev en next.config.js), por eso esta función se llama en cada
 * handler/route en vez de crear un cliente global a nivel de módulo.
 */
export function getDb() {
  const { env } = getCloudflareContext<{ DB: D1Database }>();
  return drizzle(env.DB, { schema });
}
