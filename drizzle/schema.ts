import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
};

/* ---------------------------------- users --------------------------------- */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // = Clerk user id
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

/* ------------------------------ organizations ------------------------------ */
// Permite el rol "Wedding Planner": varios eventos, distintos clientes.

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

/* ---------------------------------- events --------------------------------- */
// "event" es el concepto genérico: boda / comunión / bautizo / cumpleaños / corporativo.
// Una boda es simplemente un event con eventType = 'wedding'. Esto es lo que permite
// reutilizar el mismo motor para todos los tipos de celebración sin duplicar esquema.

export const eventTypeEnum = ["wedding", "communion", "baptism", "birthday", "corporate"] as const;
export const eventStatusEnum = ["draft", "published", "archived"] as const;

export const events = sqliteTable(
  "events",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").references(() => organizations.id),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id),
    eventType: text("event_type", { enum: eventTypeEnum }).notNull().default("wedding"),
    slug: text("slug").notNull(),
    title: text("title").notNull(), // ej. "Laura & Marcos"
    eventDate: text("event_date"),
    eventTime: text("event_time"),
    ceremonyLocationName: text("ceremony_location_name"),
    ceremonyLat: real("ceremony_lat"),
    ceremonyLng: real("ceremony_lng"),
    celebrationLocationName: text("celebration_location_name"),
    celebrationLat: real("celebration_lat"),
    celebrationLng: real("celebration_lng"),
    storyText: text("story_text"),
    closingMessage: text("closing_message"),
    coverImageUrl: text("cover_image_url"),
    status: text("status", { enum: eventStatusEnum }).notNull().default("draft"),
    ...timestamps,
  },
  (table) => ({
    slugIdx: uniqueIndex("events_slug_idx").on(table.slug),
    ownerIdx: index("events_owner_idx").on(table.ownerUserId),
  })
);

/* ------------------------------- event_media ------------------------------- */

export const eventMedia = sqliteTable(
  "event_media",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["image", "video"] }).notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({ eventIdx: index("event_media_event_idx").on(table.eventId) })
);

/* ------------------------------ event_themes ------------------------------- */

export const themePresetEnum = [
  "minimalista",
  "elegante",
  "boho",
  "vintage",
  "moderno",
  "luxury",
  "floral",
  "playa",
  "invierno",
  "personalizado",
] as const;

export const eventThemes = sqliteTable(
  "event_themes",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    themePreset: text("theme_preset", { enum: themePresetEnum }).notNull().default("elegante"),
    colorPrimary: text("color_primary").notNull().default("#1c1c1c"),
    colorSecondary: text("color_secondary").notNull().default("#c9a86a"),
    colorText: text("color_text").notNull().default("#1c1c1c"),
    colorButton: text("color_button").notNull().default("#1c1c1c"),
    colorBackground: text("color_background").notNull().default("#faf8f5"),
    fontHeading: text("font_heading").notNull().default("Cormorant Garamond"),
    fontBody: text("font_body").notNull().default("Jost"),
  },
  (table) => ({ eventIdx: uniqueIndex("event_themes_event_idx").on(table.eventId) })
);

/* ----------------------------- event_sections ------------------------------ */

export const sectionKeyEnum = [
  "story",
  "countdown",
  "gallery",
  "video",
  "map",
  "agenda",
  "dress_code",
  "gifts",
  "rsvp",
  "hotels",
  "transport",
  "faq",
  "contact",
  "music",
  "album",
] as const;

export const eventSections = sqliteTable(
  "event_sections",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    sectionKey: text("section_key", { enum: sectionKeyEnum }).notNull(),
    isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({
    eventIdx: index("event_sections_event_idx").on(table.eventId),
    uniquePerEvent: uniqueIndex("event_sections_unique_idx").on(table.eventId, table.sectionKey),
  })
);

/* ------------------------------- agenda_items ------------------------------ */

export const agendaItems = sqliteTable(
  "agenda_items",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    time: text("time"),
    description: text("description"),
    location: text("location"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({ eventIdx: index("agenda_items_event_idx").on(table.eventId) })
);

/* -------------------------------- dress_code -------------------------------- */

export const dressCode = sqliteTable(
  "dress_code",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    descriptionText: text("description_text"),
    color1: text("color_1"),
    color2: text("color_2"),
    color3: text("color_3"),
    inspirationGalleryJson: text("inspiration_gallery_json").default("[]"),
  },
  (table) => ({ eventIdx: uniqueIndex("dress_code_event_idx").on(table.eventId) })
);

/* ------------------------------- gift_options ------------------------------- */

export const giftMethodEnum = ["iban", "bizum", "paypal", "transfer", "amazon_list", "custom_list"] as const;

export const giftOptions = sqliteTable(
  "gift_options",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    method: text("method", { enum: giftMethodEnum }).notNull(),
    label: text("label"),
    value: text("value"), // IBAN, número bizum, link paypal.me, link de lista...
    message: text("message"),
  },
  (table) => ({ eventIdx: index("gift_options_event_idx").on(table.eventId) })
);

/* ---------------------------------- hotels ---------------------------------- */

export const hotels = sqliteTable(
  "hotels",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address"),
    priceHint: text("price_hint"),
    websiteUrl: text("website_url"),
    phone: text("phone"),
    lat: real("lat"),
    lng: real("lng"),
  },
  (table) => ({ eventIdx: index("hotels_event_idx").on(table.eventId) })
);

/* ----------------------------- transport_options ----------------------------- */

export const transportOptions = sqliteTable(
  "transport_options",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["bus", "parking", "taxi", "directions"] }).notNull(),
    description: text("description"),
    detailsJson: text("details_json").default("{}"),
  },
  (table) => ({ eventIdx: index("transport_options_event_idx").on(table.eventId) })
);

/* ------------------------------------ faqs ----------------------------------- */

export const faqs = sqliteTable(
  "faqs",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => ({ eventIdx: index("faqs_event_idx").on(table.eventId) })
);

/* -------------------------------- rsvp_form_config ---------------------------- */

export const rsvpFormConfig = sqliteTable(
  "rsvp_form_config",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    askPhone: integer("ask_phone", { mode: "boolean" }).notNull().default(true),
    askEmail: integer("ask_email", { mode: "boolean" }).notNull().default(true),
    askCompanions: integer("ask_companions", { mode: "boolean" }).notNull().default(true),
    askDietary: integer("ask_dietary", { mode: "boolean" }).notNull().default(true),
    askChildren: integer("ask_children", { mode: "boolean" }).notNull().default(true),
    askMessage: integer("ask_message", { mode: "boolean" }).notNull().default(true),
  },
  (table) => ({ eventIdx: uniqueIndex("rsvp_form_config_event_idx").on(table.eventId) })
);

/* -------------------------------- guest_groups -------------------------------- */

export const guestGroups = sqliteTable(
  "guest_groups",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    groupType: text("group_type", { enum: ["family", "couple", "individual"] })
      .notNull()
      .default("individual"),
  },
  (table) => ({ eventIdx: index("guest_groups_event_idx").on(table.eventId) })
);

/* ----------------------------------- tables ------------------------------------ */

export const tables = sqliteTable(
  "tables",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    capacity: integer("capacity").notNull().default(8),
    color: text("color").default("#c9a86a"),
    posX: real("pos_x").default(0),
    posY: real("pos_y").default(0),
  },
  (table) => ({ eventIdx: index("tables_event_idx").on(table.eventId) })
);

/* ----------------------------------- guests ------------------------------------- */

export const rsvpStatusEnum = ["pending", "confirmed", "declined"] as const;

export const guests = sqliteTable(
  "guests",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    guestGroupId: text("guest_group_id").references(() => guestGroups.id),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    isVip: integer("is_vip", { mode: "boolean" }).notNull().default(false),
    isChild: integer("is_child", { mode: "boolean" }).notNull().default(false),
    maxCompanions: integer("max_companions").notNull().default(0),
    tableId: text("table_id").references(() => tables.id),
    uniqueSlug: text("unique_slug").notNull(),
    rsvpStatus: text("rsvp_status", { enum: rsvpStatusEnum }).notNull().default("pending"),
    rsvpCompanionsCount: integer("rsvp_companions_count").default(0),
    rsvpDietaryRestrictions: text("rsvp_dietary_restrictions"),
    rsvpMessage: text("rsvp_message"),
    rsvpRespondedAt: text("rsvp_responded_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    eventIdx: index("guests_event_idx").on(table.eventId),
    slugIdx: uniqueIndex("guests_unique_slug_idx").on(table.uniqueSlug),
  })
);

/* ------------------------------- song_suggestions -------------------------------- */

export const songSuggestions = sqliteTable(
  "song_suggestions",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    guestId: text("guest_id").references(() => guests.id),
    title: text("title").notNull(),
    artist: text("artist"),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
  },
  (table) => ({ eventIdx: index("song_suggestions_event_idx").on(table.eventId) })
);

/* -------------------------------- album_photos ----------------------------------- */

export const albumPhotos = sqliteTable(
  "album_photos",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    guestId: text("guest_id").references(() => guests.id),
    url: text("url").notNull(),
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({ eventIdx: index("album_photos_event_idx").on(table.eventId) })
);

/* -------------------------------- collaborators ----------------------------------- */

export const collaborators = sqliteTable(
  "collaborators",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id),
    role: text("role", { enum: ["admin", "organizer", "wedding_planner", "collaborator"] }).notNull(),
    invitedEmail: text("invited_email"),
    acceptedAt: text("accepted_at"),
  },
  (table) => ({ eventIdx: index("collaborators_event_idx").on(table.eventId) })
);

/* -------------------------------- analytics_events --------------------------------- */

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["visit", "rsvp_submit", "click_share", "download_pdf", "download_image"],
    }).notNull(),
    deviceType: text("device_type"),
    referrer: text("referrer"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    eventIdx: index("analytics_events_event_idx").on(table.eventId),
    createdIdx: index("analytics_events_created_idx").on(table.createdAt),
  })
);
