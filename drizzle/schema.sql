-- WeddingFlow — esquema completo para D1
-- Cómo usarlo: Cloudflare Dashboard → Storage & Databases → D1 → weddingflow-db → Console
-- Pega este archivo completo y ejecútalo. Es idempotente-friendly gracias a los nombres
-- explícitos; si necesitas volver a ejecutarlo desde cero, borra antes las tablas.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL DEFAULT 'wedding'
    CHECK (event_type IN ('wedding','communion','baptism','birthday','corporate')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  event_date TEXT,
  event_time TEXT,
  ceremony_location_name TEXT,
  ceremony_lat REAL,
  ceremony_lng REAL,
  celebration_location_name TEXT,
  celebration_lat REAL,
  celebration_lng REAL,
  story_text TEXT,
  closing_message TEXT,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
CREATE UNIQUE INDEX events_slug_idx ON events(slug);
CREATE INDEX events_owner_idx ON events(owner_user_id);

CREATE TABLE event_media (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image','video')),
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX event_media_event_idx ON event_media(event_id);

CREATE TABLE event_themes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  theme_preset TEXT NOT NULL DEFAULT 'elegante'
    CHECK (theme_preset IN ('minimalista','elegante','boho','vintage','moderno','luxury','floral','playa','invierno','personalizado')),
  color_primary TEXT NOT NULL DEFAULT '#1c1c1c',
  color_secondary TEXT NOT NULL DEFAULT '#c9a86a',
  color_text TEXT NOT NULL DEFAULT '#1c1c1c',
  color_button TEXT NOT NULL DEFAULT '#1c1c1c',
  color_background TEXT NOT NULL DEFAULT '#faf8f5',
  font_heading TEXT NOT NULL DEFAULT 'Cormorant Garamond',
  font_body TEXT NOT NULL DEFAULT 'Jost'
);
CREATE UNIQUE INDEX event_themes_event_idx ON event_themes(event_id);

CREATE TABLE event_sections (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL
    CHECK (section_key IN ('story','countdown','gallery','video','map','agenda','dress_code','gifts','rsvp','hotels','transport','faq','contact','music','album')),
  is_enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  style_overrides TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX event_sections_event_idx ON event_sections(event_id);
CREATE UNIQUE INDEX event_sections_unique_idx ON event_sections(event_id, section_key);

CREATE TABLE agenda_items (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time TEXT,
  description TEXT,
  location TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX agenda_items_event_idx ON agenda_items(event_id);

CREATE TABLE dress_code (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  description_text TEXT,
  color_1 TEXT,
  color_2 TEXT,
  color_3 TEXT,
  inspiration_gallery_json TEXT DEFAULT '[]'
);
CREATE UNIQUE INDEX dress_code_event_idx ON dress_code(event_id);

CREATE TABLE gift_options (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('iban','bizum','paypal','transfer','amazon_list','custom_list')),
  label TEXT,
  value TEXT,
  message TEXT
);
CREATE INDEX gift_options_event_idx ON gift_options(event_id);

CREATE TABLE hotels (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  price_hint TEXT,
  website_url TEXT,
  phone TEXT,
  lat REAL,
  lng REAL
);
CREATE INDEX hotels_event_idx ON hotels(event_id);

CREATE TABLE transport_options (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bus','parking','taxi','directions')),
  description TEXT,
  details_json TEXT DEFAULT '{}'
);
CREATE INDEX transport_options_event_idx ON transport_options(event_id);

CREATE TABLE faqs (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX faqs_event_idx ON faqs(event_id);

CREATE TABLE rsvp_form_config (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ask_phone INTEGER NOT NULL DEFAULT 1,
  ask_email INTEGER NOT NULL DEFAULT 1,
  ask_companions INTEGER NOT NULL DEFAULT 1,
  ask_dietary INTEGER NOT NULL DEFAULT 1,
  ask_children INTEGER NOT NULL DEFAULT 1,
  ask_message INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX rsvp_form_config_event_idx ON rsvp_form_config(event_id);

CREATE TABLE guest_groups (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL DEFAULT 'individual' CHECK (group_type IN ('family','couple','individual'))
);
CREATE INDEX guest_groups_event_idx ON guest_groups(event_id);

CREATE TABLE tables (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 8,
  color TEXT DEFAULT '#c9a86a',
  pos_x REAL DEFAULT 0,
  pos_y REAL DEFAULT 0
);
CREATE INDEX tables_event_idx ON tables(event_id);

CREATE TABLE guests (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_group_id TEXT REFERENCES guest_groups(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_vip INTEGER NOT NULL DEFAULT 0,
  is_child INTEGER NOT NULL DEFAULT 0,
  max_companions INTEGER NOT NULL DEFAULT 0,
  table_id TEXT REFERENCES tables(id),
  unique_slug TEXT NOT NULL,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending','confirmed','declined')),
  rsvp_companions_count INTEGER DEFAULT 0,
  rsvp_dietary_restrictions TEXT,
  rsvp_message TEXT,
  rsvp_responded_at TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
CREATE INDEX guests_event_idx ON guests(event_id);
CREATE UNIQUE INDEX guests_unique_slug_idx ON guests(unique_slug);

CREATE TABLE song_suggestions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id),
  title TEXT NOT NULL,
  artist TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected'))
);
CREATE INDEX song_suggestions_event_idx ON song_suggestions(event_id);

CREATE TABLE album_photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id TEXT REFERENCES guests(id),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
CREATE INDEX album_photos_event_idx ON album_photos(event_id);

CREATE TABLE collaborators (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('admin','organizer','wedding_planner','collaborator')),
  invited_email TEXT,
  accepted_at TEXT
);
CREATE INDEX collaborators_event_idx ON collaborators(event_id);

CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('visit','rsvp_submit','click_share','download_pdf','download_image')),
  device_type TEXT,
  referrer TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
CREATE INDEX analytics_events_event_idx ON analytics_events(event_id);
CREATE INDEX analytics_events_created_idx ON analytics_events(created_at);
