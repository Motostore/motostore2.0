import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { adminCreateProduct, type AdminProduct } from "@/app/lib/admin.products";

const LEGION_API_URL = "https://legionsmm.com/api/v2";
// 🔥 CORRECCIÓN: Leemos la clave con el nombre que definiste
const LEGION_SMM_API_KEY_ENV = process.env.LEGION_SMM_API_KEY; 
const BACKEND_URL = process.env.NEXT_PUBLIC_API_FULL || "http://localhost:8080/api/v1"; 

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || !user || !['superuser', 'admin'].includes(user.role.toLowerCase())) {
    return NextResponse.json({ error: "Acceso denegado: Se requiere un rol administrativo." }, { status: 403 });
  }

  // 1. CHEQUEO DE LA CLAVE DE LEGION
  if (!LEGION_SMM_API_KEY_ENV || LEGION_SMM_API_KEY_ENV.length < 10) {
    return NextResponse.json({ error: "Error Crítico: Falta configurar LEGION_SMM_API_KEY en .env.local" }, { status: 500 });
  }
  
  if (!user.token) {
      return NextResponse.json({ error: "Error de Sesión: Token de usuario no encontrado." }, { status: 401 });
  }

  try {
    console.log("🔄 Iniciando sincronización con LegionSMM...");

    // 2. CONEXIÓN CON LEGIONSMM
    const formData = new URLSearchParams();
    formData.append('key', LEGION_SMM_API_KEY_ENV); // Usamos la clave corregida
    formData.append('action', 'services');

    const apiResponse = await fetch(LEGION_API_URL, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
        },
        body: formData.toString(),
        cache: 'no-store'
    });

    if (!apiResponse.ok) {
        throw new Error(`Fallo de conexión externa con LegionSMM (HTTP ${apiResponse.status})`);
    }

    const data = await apiResponse.json();

    if (data.error) {
      throw new Error(`Error de LegionSMM: ${data.error}. (La clave es incorrecta o estás bloqueado).`);
    }

    const services = Array.isArray(data) ? data : [];
    
    if (services.length === 0) {
      return NextResponse.json({ message: "No se encontraron servicios en el proveedor, o la API Key es incorrecta." });
    }

    // 3. PROCESAMIENTO Y GUARDADO
    let successCount = 0;
    let failCount = 0;
    
    // Iteramos sobre los servicios para guardarlos
    for (const s of services.slice(0, 50)) { 
      try {
        const cost = parseFloat(s.rate);
        const sellPrice = (cost * 1.30).toFixed(2); 

        const newProduct: AdminProduct = {
          name: `[${s.category}] ${s.name}`,
          price: parseFloat(sellPrice),
          active: true,
          source: 'marketing',
          externalId: s.service, 
          rate: cost,
          min: Number(s.min),
          max: Number(s.max)
        } as any; 
        
        // La función adminCreateProduct usa NEXT_PUBLIC_API_FULL (puerto 8000)
        await adminCreateProduct(newProduct, user.token); 
        successCount++;
      } catch (err) {
        failCount++;
        // console.error(`❌ Falló al guardar:`, (err as Error).message);
      }
    }

    if (successCount === 0 && services.length > 0) {
         throw new Error(`Error Fatal: No se pudo guardar NINGÚN producto en tu Backend (${BACKEND_URL}). Revisa tu servidor de Python.`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sincronización finalizada. ${successCount} productos guardados.`,
      stats: {
        imported: successCount,
        failed: failCount,
        total_found: services.length
      }
    });

  } catch (error: any) {
    console.error("🔥 Error crítico en Sync:", error);
    return NextResponse.json({ error: error.message || "Error interno de sincronización desconocido" }, { status: 500 });
  }
}