import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { agendaItems, dressCode, giftOptions, hotels, transportOptions, faqs } from "@drizzle/schema";
import type {
  CreateAgendaItemInput,
  ReorderAgendaItemsInput,
  UpdateDressCodeInput,
  CreateGiftOptionInput,
  CreateHotelInput,
  CreateTransportOptionInput,
  CreateFaqInput,
  ReorderFaqsInput,
} from "@/lib/validators/wizard-extras";
import { nanoid } from "@/lib/utils";

/* -------------------------------------- Agenda -------------------------------------- */

export async function listAgendaItems(eventId: string) {
  const db = getDb();
  return db
    .select()
    .from(agendaItems)
    .where(eq(agendaItems.eventId, eventId))
    .orderBy(agendaItems.sortOrder)
    .all();
}

export async function createAgendaItem(eventId: string, input: CreateAgendaItemInput) {
  const db = getDb();
  const current = await listAgendaItems(eventId);
  const id = nanoid();
  await db.insert(agendaItems).values({
    id,
    eventId,
    title: input.title,
    time: input.time || null,
    description: input.description || null,
    location: input.location || null,
    sortOrder: current.length,
  });
  return { id };
}

export async function deleteAgendaItem(itemId: string) {
  const db = getDb();
  await db.delete(agendaItems).where(eq(agendaItems.id, itemId));
}

export async function reorderAgendaItems(input: ReorderAgendaItemsInput) {
  const db = getDb();
  for (const item of input.items) {
    await db.update(agendaItems).set({ sortOrder: item.sortOrder }).where(eq(agendaItems.id, item.id));
  }
}

export async function getAgendaItemById(itemId: string) {
  const db = getDb();
  return db.select().from(agendaItems).where(eq(agendaItems.id, itemId)).get();
}

/* ------------------------------------ Dress code ------------------------------------ */
// dress_code se crea siempre junto con el evento (ver createEvent), así que aquí solo
// hace falta UPDATE.

export async function getDressCodeForEvent(eventId: string) {
  const db = getDb();
  return db.select().from(dressCode).where(eq(dressCode.eventId, eventId)).get();
}

export async function updateDressCode(eventId: string, input: UpdateDressCodeInput) {
  const db = getDb();
  const existing = await getDressCodeForEvent(eventId);

  const values = {
    descriptionText: input.descriptionText || null,
    color1: input.color1 || null,
    color2: input.color2 || null,
    color3: input.color3 || null,
  };

  if (existing) {
    await db.update(dressCode).set(values).where(eq(dressCode.eventId, eventId));
  } else {
    // Cubre eventos creados antes de que dress_code se insertara por defecto al crear el evento.
    await db.insert(dressCode).values({ id: nanoid(), eventId, ...values });
  }
}

/* ---------------------------------- Lista de regalos --------------------------------- */

export async function listGiftOptions(eventId: string) {
  const db = getDb();
  return db.select().from(giftOptions).where(eq(giftOptions.eventId, eventId)).all();
}

export async function createGiftOption(eventId: string, input: CreateGiftOptionInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(giftOptions).values({
    id,
    eventId,
    method: input.method,
    label: input.label || null,
    value: input.value || null,
    message: input.message || null,
  });
  return { id };
}

export async function deleteGiftOption(giftId: string) {
  const db = getDb();
  await db.delete(giftOptions).where(eq(giftOptions.id, giftId));
}

export async function getGiftOptionById(giftId: string) {
  const db = getDb();
  return db.select().from(giftOptions).where(eq(giftOptions.id, giftId)).get();
}

/* --------------------------------------- Hoteles -------------------------------------- */

export async function listHotels(eventId: string) {
  const db = getDb();
  return db.select().from(hotels).where(eq(hotels.eventId, eventId)).all();
}

export async function createHotel(eventId: string, input: CreateHotelInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(hotels).values({
    id,
    eventId,
    name: input.name,
    address: input.address || null,
    priceHint: input.priceHint || null,
    websiteUrl: input.websiteUrl || null,
    phone: input.phone || null,
  });
  return { id };
}

export async function deleteHotel(hotelId: string) {
  const db = getDb();
  await db.delete(hotels).where(eq(hotels.id, hotelId));
}

export async function getHotelById(hotelId: string) {
  const db = getDb();
  return db.select().from(hotels).where(eq(hotels.id, hotelId)).get();
}

/* -------------------------------------- Transporte ------------------------------------- */

export async function listTransportOptions(eventId: string) {
  const db = getDb();
  return db.select().from(transportOptions).where(eq(transportOptions.eventId, eventId)).all();
}

export async function createTransportOption(eventId: string, input: CreateTransportOptionInput) {
  const db = getDb();
  const id = nanoid();
  await db.insert(transportOptions).values({
    id,
    eventId,
    type: input.type,
    description: input.description || null,
  });
  return { id };
}

export async function deleteTransportOption(optionId: string) {
  const db = getDb();
  await db.delete(transportOptions).where(eq(transportOptions.id, optionId));
}

export async function getTransportOptionById(optionId: string) {
  const db = getDb();
  return db.select().from(transportOptions).where(eq(transportOptions.id, optionId)).get();
}

/* ------------------------------------------ FAQ ----------------------------------------- */

export async function listFaqs(eventId: string) {
  const db = getDb();
  return db.select().from(faqs).where(eq(faqs.eventId, eventId)).orderBy(faqs.sortOrder).all();
}

export async function createFaq(eventId: string, input: CreateFaqInput) {
  const db = getDb();
  const current = await listFaqs(eventId);
  const id = nanoid();
  await db.insert(faqs).values({
    id,
    eventId,
    question: input.question,
    answer: input.answer,
    sortOrder: current.length,
  });
  return { id };
}

export async function deleteFaq(faqId: string) {
  const db = getDb();
  await db.delete(faqs).where(eq(faqs.id, faqId));
}

export async function reorderFaqs(input: ReorderFaqsInput) {
  const db = getDb();
  for (const item of input.items) {
    await db.update(faqs).set({ sortOrder: item.sortOrder }).where(eq(faqs.id, item.id));
  }
}

export async function getFaqById(faqId: string) {
  const db = getDb();
  return db.select().from(faqs).where(eq(faqs.id, faqId)).get();
}
