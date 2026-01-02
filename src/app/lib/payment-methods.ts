// src/app/lib/payment-methods.ts

export async function fetchPaymentMethods() {
  return fetch("/api/payment-methods", { cache: "no-store" });
}

export async function fetchPaymentMethod(type: string) {
  return fetch(`/api/payment-methods/${type}`, { cache: "no-store" });
}

// 👇 Esta faltaba y es la que te piden los componentes:
export async function fetchPaymentMethodById(id: string) {
  // Ajusta la ruta si tu API usa otra (por ejemplo /api/transactions/...)
  return fetch(`/api/payment-methods/${id}`, { cache: "no-store" });
}








