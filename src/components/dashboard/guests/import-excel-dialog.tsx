"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Dialog } from "@/components/ui/dialog";
import {
  createGuestSchema,
  GUEST_COLUMN_ALIASES,
  type CreateGuestInput,
} from "@/lib/validators/guest";
import { useImportGuests } from "@/hooks/use-guests";

type TargetField = keyof CreateGuestInput;
type RawRow = Record<string, unknown>;

const FIELD_LABELS: Record<TargetField, string> = {
  fullName: "Nombre completo *",
  email: "Email",
  phone: "Teléfono",
  isVip: "VIP",
  isChild: "Es un niño",
  maxCompanions: "Acompañantes",
  groupName: "Grupo / familia",
};

const TRUTHY_VALUES = new Set(["si", "sí", "true", "1", "x", "yes", "vip"]);

function normalizeHeader(header: string) {
  return header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function autoDetectMapping(headers: string[]): Record<TargetField, string | null> {
  const mapping: Record<TargetField, string | null> = {
    fullName: null,
    email: null,
    phone: null,
    isVip: null,
    isChild: null,
    maxCompanions: null,
    groupName: null,
  };
  for (const field of Object.keys(GUEST_COLUMN_ALIASES) as TargetField[]) {
    const aliases = GUEST_COLUMN_ALIASES[field];
    const match = headers.find((h) => aliases.includes(normalizeHeader(h)));
    if (match) mapping[field] = match;
  }
  return mapping;
}

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null) return false;
  return TRUTHY_VALUES.has(String(value).toLowerCase().trim());
}

function normalizeRow(row: RawRow, mapping: Record<TargetField, string | null>): CreateGuestInput {
  return {
    fullName: mapping.fullName ? String(row[mapping.fullName] ?? "").trim() : "",
    email: mapping.email ? String(row[mapping.email] ?? "").trim() : "",
    phone: mapping.phone ? String(row[mapping.phone] ?? "").trim() : "",
    isVip: mapping.isVip ? toBoolean(row[mapping.isVip]) : false,
    isChild: mapping.isChild ? toBoolean(row[mapping.isChild]) : false,
    maxCompanions: mapping.maxCompanions ? Number(row[mapping.maxCompanions] ?? 0) || 0 : 0,
    groupName: mapping.groupName ? String(row[mapping.groupName] ?? "").trim() : "",
  };
}

export function ImportExcelDialog({
  eventId,
  open,
  onClose,
}: {
  eventId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [rawRows, setRawRows] = useState<RawRow[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<TargetField, string | null> | null>(null);
  const [fileName, setFileName] = useState("");
  const { mutateAsync, isPending } = useImportGuests(eventId);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const { validRows, invalidCount } = useMemo(() => {
    if (!rawRows || !mapping) return { validRows: [] as CreateGuestInput[], invalidCount: 0 };
    let invalid = 0;
    const valid: CreateGuestInput[] = [];
    for (const row of rawRows) {
      const normalized = normalizeRow(row, mapping);
      const parsed = createGuestSchema.safeParse(normalized);
      if (parsed.success) valid.push(parsed.data);
      else invalid++;
    }
    return { validRows: valid, invalidCount: invalid };
  }, [rawRows, mapping]);

  function reset() {
    setRawRows(null);
    setHeaders([]);
    setMapping(null);
    setFileName("");
    setImportedCount(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]!];
    const rows = XLSX.utils.sheet_to_json<RawRow>(firstSheet, { defval: "" });

    if (rows.length === 0) return;
    const detectedHeaders = Object.keys(rows[0]!);
    setHeaders(detectedHeaders);
    setMapping(autoDetectMapping(detectedHeaders));
    setRawRows(rows);
  }

  async function handleConfirmImport() {
    // El endpoint acepta hasta 500 filas por petición; se trocea el lote si hace falta.
    const chunkSize = 500;
    let total = 0;
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize);
      const result = await mutateAsync(chunk);
      total += result.inserted;
    }
    setImportedCount(total);
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Importar invitados desde Excel" maxWidthClassName="max-w-3xl">
      {importedCount !== null ? (
        <div className="py-6 text-center">
          <p className="font-display text-3xl">¡Listo!</p>
          <p className="mt-2 text-ink/60">Se han importado {importedCount} invitados.</p>
          <button
            onClick={handleClose}
            className="mt-8 rounded-full bg-ink px-8 py-3 font-body text-sm uppercase tracking-widest text-parchment hover:bg-gold-dark"
          >
            Cerrar
          </button>
        </div>
      ) : !rawRows ? (
        <div>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-ink/25 px-8 py-16 text-center transition-colors hover:border-gold-dark">
            <span className="font-display text-xl">Arrastra o selecciona tu archivo</span>
            <span className="text-sm text-ink/50">Formatos admitidos: .xlsx, .xls, .csv</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
          <p className="mt-4 text-xs text-ink/40">
            Consejo: incluye columnas como "Nombre", "Email", "Teléfono", "Acompañantes" y
            "Grupo" — se detectan automáticamente.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-ink/60">
            {fileName} · {rawRows.length} filas detectadas
          </p>

          <div className="mt-6">
            <p className="font-body text-xs uppercase tracking-widest text-ink/50">
              Mapeo de columnas
            </p>
            <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
              {(Object.keys(FIELD_LABELS) as TargetField[]).map((field) => (
                <div key={field}>
                  <label className="text-xs text-ink/50">{FIELD_LABELS[field]}</label>
                  <select
                    value={mapping?.[field] ?? ""}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev!, [field]: e.target.value || null }))
                    }
                    className="mt-1 w-full rounded-sm border border-ink/20 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-gold-dark"
                  >
                    <option value="">— No mapear —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-6 rounded-sm bg-ink/[0.03] px-5 py-3 text-sm">
            <span>
              <strong>{validRows.length}</strong> filas válidas
            </span>
            {invalidCount > 0 && (
              <span className="text-red-600">
                <strong>{invalidCount}</strong> filas con errores (se omitirán)
              </span>
            )}
          </div>

          {validRows.length > 0 && (
            <div className="mt-4 max-h-64 overflow-y-auto rounded-sm border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-parchment">
                  <tr className="border-b border-ink/10 text-xs uppercase tracking-widest text-ink/50">
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Teléfono</th>
                    <th className="px-3 py-2">Grupo</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.slice(0, 20).map((row, i) => (
                    <tr key={i} className="border-b border-ink/5 last:border-0">
                      <td className="px-3 py-2">{row.fullName}</td>
                      <td className="px-3 py-2 text-ink/60">{row.email || "—"}</td>
                      <td className="px-3 py-2 text-ink/60">{row.phone || "—"}</td>
                      <td className="px-3 py-2 text-ink/60">{row.groupName || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 20 && (
                <p className="px-3 py-2 text-xs text-ink/40">
                  … y {validRows.length - 20} filas más
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={reset}
              className="rounded-full border border-ink/20 px-6 py-3 font-body text-sm uppercase tracking-widest text-ink/70 transition-colors hover:border-ink"
            >
              Elegir otro archivo
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={validRows.length === 0 || isPending}
              className="rounded-full bg-ink px-8 py-3 font-body text-sm uppercase tracking-widest text-parchment transition-colors hover:bg-gold-dark disabled:opacity-50"
            >
              {isPending ? "Importando…" : `Importar ${validRows.length} invitados`}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
