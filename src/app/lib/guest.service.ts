// src/app/lib/guest.service.ts

// Productos de ejemplo si la API falla
function getFallbackProducts() {
  return [
    {
      id: 1,
      name: "Recargas internacionales",
      image: null, // ANTES: "icons/recargas.png" (Lo quitamos para evitar error 404)
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
    {
      id: 2,
      name: "Streaming Premium",
      image: null,
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
    {
      id: 3,
      name: "Licencias digitales",
      image: null,
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
    {
      id: 4,
      name: "Marketing Digital",
      image: null,
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
    {
      id: 5,
      name: "Cambio de divisas",
      image: null,
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
    {
      id: 6,
      name: "Pagos y facturación",
      image: null,
      price: null,
      duration: null,
      status: false,
      accounts: 1,
      profiles: 1,
    },
  ];
}

export async function fetchGuestProducts() {
  const API = (process.env.NEXT_PUBLIC_API_FULL || "").replace(/\/$/, "");
  const url = `${API}/guest/products`;

  // Si no tenemos base URL configurada, devolvemos los de ejemplo
  if (!API) {
    return getFallbackProducts();
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return getFallbackProducts();
    }

    const json = await response.json();

    if (!Array.isArray(json)) {
      return getFallbackProducts();
    }

    return json;
  } catch (err) {
    return getFallbackProducts();
  }
}







