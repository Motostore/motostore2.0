import { NextResponse } from "next/server";

// IMPORTANTE: Ignora errores de certificado SSL del proveedor (necesario para la IP directa)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function POST(req: Request) {
  try {
    // 1. RECIBIMOS LOS DATOS (El monto viene en MONEDA LOCAL desde el frontend)
    const { tipo, numero, monto } = await req.json();

    if (!tipo || !numero || !monto) {
      return NextResponse.json({ ok: false, mensaje: "Datos incompletos" }, { status: 400 });
    }

    // =================================================================================
    // 💰 ZONA DE TESORERÍA: CONFIGURACIÓN DE TASAS
    // =================================================================================
    // Aquí defines las tasas oficiales para convertir la moneda local a Dólares (Wallet)
    
    const TASAS = {
        VENEZUELA: 54.00,   // Tasa Oficial (Bs/USD)
        COLOMBIA: 4100.00,  // Tasa TRM (COP/USD)
        PERU: 3.80,         // Soles (PEN/USD)
        CHILE: 980.00,      // Pesos Chilenos (CLP/USD)
        ECUADOR: 1.00       // Dólar (1:1)
    };

    // =================================================================================
    // 🕵️ DETECCIÓN DE PAÍS Y SELECCIÓN DE TASA
    // =================================================================================

    let tasaAplicada = 0;
    let pais = "";
    let moneda = "";

    // Listas de operadores por país (Códigos de Danli)
    const opsVenezuela = ['movilnet', 'movilnetvip', 'movilnetpos', 'movistar', 'movistarpos', 'digitel', 'digitelpos', 'cantv', 'interpos', 'simpletv'];
    const opsColombia = ['claro', 'movistar_col', 'tigo', 'wom', 'virgin', 'etb', 'directv', 'exito', 'flash'];
    const opsEcuador = ['claro_ec', 'movistar_ec', 'cnt', 'tuenti_ec'];
    const opsPeru = ['claro_pe', 'movistar_pe', 'entel_pe', 'bitel', 'directv_pe'];
    const opsChile = ['claro_cl', 'movistar_cl', 'entel_cl', 'wom_cl', 'vtr', 'mundo'];

    // Lógica de decisión
    if (opsVenezuela.includes(tipo)) {
        pais = "VENEZUELA";
        moneda = "Bs";
        tasaAplicada = TASAS.VENEZUELA;
    } 
    else if (opsColombia.includes(tipo)) {
        pais = "COLOMBIA";
        moneda = "COP";
        tasaAplicada = TASAS.COLOMBIA;
    }
    else if (opsPeru.includes(tipo)) {
        pais = "PERU";
        moneda = "PEN";
        tasaAplicada = TASAS.PERU;
    }
    else if (opsChile.includes(tipo)) {
        pais = "CHILE";
        moneda = "CLP";
        tasaAplicada = TASAS.CHILE;
    }
    else if (opsEcuador.includes(tipo)) {
        pais = "ECUADOR";
        moneda = "USD";
        tasaAplicada = TASAS.ECUADOR;
    }
    else {
        // Fallback de seguridad: Si no reconoce el operador, asume Venezuela
        pais = "DESCONOCIDO (Default VE)";
        moneda = "Bs";
        tasaAplicada = TASAS.VENEZUELA;
    }

    // =================================================================================
    // 🧮 CÁLCULO DE CONVERSIÓN (Descuento Wallet)
    // =================================================================================
    
    const montoLocal = parseFloat(monto);
    
    // FÓRMULA MAESTRA: Monto Local / Tasa = Costo en Dólares
    let costoWalletUSD = montoLocal / tasaAplicada;
    
    // Redondeamos hacia arriba para proteger su margen (2 decimales)
    costoWalletUSD = Math.ceil(costoWalletUSD * 100) / 100;

    console.log(`[MOTO STORE] Procesando recarga:`);
    console.log(`- País: ${pais}`);
    console.log(`- Operador: ${tipo}`);
    console.log(`- Monto Proveedor: ${moneda} ${montoLocal}`);
    console.log(`- Tasa Aplicada: ${tasaAplicada}`);
    console.log(`- A descontar de Wallet: $${costoWalletUSD} USD`);

    // AQUÍ IRÍA LA VALIDACIÓN DE SALDO DE LA BASE DE DATOS (Simulada por ahora)
    // if (usuario.saldo < costoWalletUSD) { throw new Error("Saldo Insuficiente"); }

    // =================================================================================
    // 🚀 EJECUCIÓN CON EL PROVEEDOR (DANLI PAGO)
    // =================================================================================
    
    const BASE_URL = "https://192.142.2.85/service/api";
    const API_KEY = "6286HWW0081794";
    
    // El proveedor recibe la orden en MONEDA LOCAL (Bs, COP, etc), que es lo que él cobra.
    const url = `${BASE_URL}?action=recarga&tipo=${tipo}&numero=${numero}&monto=${monto}&key=${API_KEY}`;

    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text();
    
    let exito = false;
    let mensajeRespuesta = "";

    try {
      const json = JSON.parse(text);
      // El proveedor a veces responde con { mensaje: "Transaccion Exitosa" } o { status: "1" }
      if (json.mensaje === "Transaccion Exitosa" || json.status === "1" || json.ok) {
        exito = true;
        mensajeRespuesta = json.mensaje;
      } else {
        mensajeRespuesta = json.mensaje || "Error desconocido";
      }
    } catch {
      // Si responde texto plano (ej: "Error: Saldo insuficiente en proveedor")
      if (text.toLowerCase().includes("exito") || text.toLowerCase().includes("ok")) {
        exito = true;
        mensajeRespuesta = text;
      } else {
        mensajeRespuesta = text;
      }
    }

    if (exito) {
      // ===========================================================================
      // ✅ ÉXITO: AQUÍ SE DESCUENTA EL SALDO REAL DE LA WALLET (USD)
      // ===========================================================================
      // await db.wallet.decrement({ amount: costoWalletUSD, userId: ... });
      
      return NextResponse.json({ 
        success: true, 
        ok: true,
        mensaje: "Recarga Exitosa",
        detalles: {
          pais: pais,
          descontado_usd: costoWalletUSD,
          recargado_local: `${moneda} ${montoLocal}`,
          tasa_usada: tasaAplicada
        }
      });
    } else {
      return NextResponse.json({ ok: false, success: false, mensaje: `Proveedor: ${mensajeRespuesta}` });
    }

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, mensaje: "Error de sistema: " + e.message }, { status: 500 });
  }
}