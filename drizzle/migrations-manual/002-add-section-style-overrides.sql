-- Ejecuta esto en la consola de tu base D1 (Storage & Databases → weddingflow → Console)
-- Añade el soporte para personalizar color/tipografía por sección individual (editor visual).

ALTER TABLE event_sections ADD COLUMN style_overrides TEXT NOT NULL DEFAULT '{}';
