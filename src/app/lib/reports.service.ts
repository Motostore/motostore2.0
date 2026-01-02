// src/app/lib/reports.service.ts
export async function fetchUtilities(params?: { from?: string; to?: string }) {
  const qs = new URLSearchParams();
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);

  const url = `/api/reports/utilities${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener utilidades");
  return res.json();
}
