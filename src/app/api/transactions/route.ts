// app/api/transactions/route.ts
import { NextResponse } from "next/server";

// Ejemplo de usuarios ficticios con roles
const users = [
  { id: 1, name: "Juan", role: "superuser" },
  { id: 2, name: "Maria", role: "cliente" },
];

// Ejemplo de transacciones ficticias
const transactions = [
  { id: 101, userId: 1, description: "Pago de servicio", amount: 500 },
  { id: 102, userId: 2, description: "Compra online", amount: 300 },
  { id: 103, userId: 1, description: "Transferencia", amount: 1000 },
];

export async function GET(req: Request) {
  // Simulamos que obtenemos el usuario logueado (en tu caso usarías JWT o sesión real)
  const loggedUser = users[1]; // 👈 ejemplo: cambiar entre 0 o 1

  let result;

  if (loggedUser.role === "superuser") {
    result = transactions; // ve todo
  } else {
    result = transactions.filter((t) => t.userId === loggedUser.id); // solo las suyas
  }

  return NextResponse.json(result);
}
