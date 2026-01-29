import { NextResponse } from 'next/server';

export async function GET() {
  const services = [
    { service: "NFLX-1", name: "Netflix Premium (1 Pantalla)", category: "Streaming", rate: 2.50 },
    { service: "DSNY-1", name: "Disney+ Premium (Completa)", category: "Streaming", rate: 5.00 },
    { service: "AMZN-1", name: "Amazon Prime Video (6 Meses)", category: "Streaming", rate: 3.50 },
    { service: "freefire", name: "FreeFire 100 Diamantes", category: "Juegos", rate: 1.10 }
  ];
  return NextResponse.json(services);
}
