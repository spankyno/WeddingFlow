-- Ejecuta esto en la consola de tu base D1 (Storage & Databases → weddingflow → Console)
-- SOLO si tu base de datos ya existía antes de añadir el paso 13 del wizard (mensaje final).
-- Si vas a crear la base de datos desde cero, no hace falta: ya está incluido en schema.sql.

ALTER TABLE events ADD COLUMN closing_message TEXT;
