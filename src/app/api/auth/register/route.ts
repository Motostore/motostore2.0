import { NextResponse } from 'next/server';
// import { sendEmail } from '@/app/lib/email'; // Descomentar cuando configures email

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, username, password, phone, cedula } = body;

    // 1. VALIDACIÓN ESTRICTA
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Faltan datos obligatorios" }, 
        { status: 400 }
      );
    }

    // 2. MONITOREO DE SEGURIDAD (IP & PAÍS)
    // Obtenemos la IP real del usuario (Render/Vercel usan x-forwarded-for)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : "127.0.0.1";
    
    // Intentamos obtener el país del header (Cloudflare/Vercel) o inferimos
    // Si estás en Render, quizás necesites una API externa de IP-to-Geo si no te da el header.
    // Por defecto ponemos 'XX' si no se detecta.
    const countryCode = req.headers.get("x-vercel-ip-country") || 
                        req.headers.get("cf-ipcountry") || 
                        "XX"; 

    const userAgent = req.headers.get("user-agent") || "Desconocido";

    // 3. REGLAS DE NEGOCIO
    // - Rol: Siempre CLIENTE.
    // - Disabled: TRUE (Requiere aprobación del admin).
    const defaultRole = 'CLIENT'; 
    const requireApproval = true; 

    // 4. LÓGICA MOCK DE CREACIÓN (Aquí guardarías en tu BD real)
    // Importante: Guarda 'ip_address', 'country_code' y 'last_login_ip' en tu modelo de Usuario.
    const newUserMock = {
      id: Math.floor(Math.random() * 1000),
      username,
      email,
      role: defaultRole,
      balance: 0,
      disabled: requireApproval, // El usuario nace bloqueado
      cedula: cedula || "S/C",
      
      // DATOS DE AUDITORÍA
      ip_address: ip,
      country_code: countryCode, 
      device_fingerprint: userAgent, // Guardamos el navegador/dispositivo
      
      createdAt: new Date().toISOString()
    };

    console.log(`🚨 NUEVO REGISTRO DETECTADO:`);
    console.log(`   Usuario: ${username} (${email})`);
    console.log(`   IP: ${ip} | País: ${countryCode}`);
    console.log(`   Dispositivo: ${userAgent}`);

    // NOTIFICACIÓN AL ADMIN (Simulada)
    // await sendAdminNotification(`Nuevo registro desde ${countryCode}: ${username}`);

    return NextResponse.json({ 
      success: true, 
      message: "Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.",
      user: newUserMock 
    }, { status: 201 });

  } catch (error) {
    console.error("Error crítico en registro:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" }, 
      { status: 500 }
    );
  }
}