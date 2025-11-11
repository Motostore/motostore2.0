// src/app/lib/wallet.service.ts
export async function fetchWalletBalance() {
  const res = await fetch("/api/wallet/balance", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo obtener el saldo");
  return res.json() as Promise<{ balance: number }>;
}
