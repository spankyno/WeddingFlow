import { GUEST_COLUMN_ALIASES, type ImportGuestRowInput } from "@/lib/validators/guest";

export type TargetField = keyof ImportGuestRowInput;
export type RawRow = Record<string, unknown>;

const TRUTHY_VALUES = new Set(["si", "sí", "true", "1", "x", "yes", "vip"]);

export function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function autoDetectMapping(headers: string[]): Record<TargetField, string | null> {
  const mapping: Record<TargetField, string | null> = {
    fullName: null,
    email: null,
    phone: null,
    isVip: null,
    isChild: null,
    maxCompanions: null,
    groupName: null,
    tableName: null,
  };
  for (const field of Object.keys(GUEST_COLUMN_ALIASES) as TargetField[]) {
    const aliases = GUEST_COLUMN_ALIASES[field];
    const match = headers.find((h) => aliases.includes(normalizeHeader(h)));
    if (match) mapping[field] = match;
  }
  return mapping;
}

export function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null) return false;
  return TRUTHY_VALUES.has(String(value).toLowerCase().trim());
}

export function normalizeRow(
  row: RawRow,
  mapping: Record<TargetField, string | null>
): ImportGuestRowInput {
  return {
    fullName: mapping.fullName ? String(row[mapping.fullName] ?? "").trim() : "",
    email: mapping.email ? String(row[mapping.email] ?? "").trim() : "",
    phone: mapping.phone ? String(row[mapping.phone] ?? "").trim() : "",
    isVip: mapping.isVip ? toBoolean(row[mapping.isVip]) : false,
    isChild: mapping.isChild ? toBoolean(row[mapping.isChild]) : false,
    maxCompanions: mapping.maxCompanions ? Number(row[mapping.maxCompanions] ?? 0) || 0 : 0,
    groupName: mapping.groupName ? String(row[mapping.groupName] ?? "").trim() : "",
    tableName: mapping.tableName ? String(row[mapping.tableName] ?? "").trim() : "",
  };
}
