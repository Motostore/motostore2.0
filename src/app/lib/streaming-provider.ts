import { getSession } from "next-auth/react";

const ITEMS_PER_PAGE = 10;

export async function fetchProvidersForTransaction() {
  try {
    const session = await getSession();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_FULL}/streaming/available`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    // Parseo seguro del body
    const text = await response.text();
    if (!text || !text.trim()) {
      // body vacío (ej: 204 o 200 sin contenido)
      return [];
    }

    try {
      const json = JSON.parse(text);
      return json;
    } catch (err) {
      console.error(
        "Error parseando JSON en fetchProvidersForTransaction:",
        err,
        text
      );
      return [];
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch streamings data.");
  }
}

export async function fetchAllProviders(query: string, page: number) {
  const session = await getSession();
  const params = new URLSearchParams({
    query,
    page: (page - 1).toString(),
    elements: ITEMS_PER_PAGE.toString(),
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_FULL}/streaming?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    // También aquí parseo seguro (por si acaso)
    const text = await response.text();
    if (!text || !text.trim()) {
      return [];
    }

    try {
      const json = JSON.parse(text);
      return json;
    } catch (err) {
      console.error(
        "Error parseando JSON en fetchAllProviders:",
        err,
        text
      );
      return [];
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch streamings data.");
  }
}

export async function fetchCreateProvider(body: string) {
  try {
    const session = await getSession();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_FULL}/streaming`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body,
      }
    );

    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch streamings data.");
  }
}

export async function fetchUpdateProvider(id: number | string, body: string) {
  const session = await getSession();

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_FULL}/streaming/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body,
      }
    );

    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch streamings data.");
  }
}

export async function fetchDeleteProvider(id: number | string) {
  try {
    const session = await getSession();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_FULL}/streaming/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch streamings data.");
  }
}
