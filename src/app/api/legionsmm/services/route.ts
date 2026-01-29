import { NextResponse } from 'next/server';

export async function GET() {
  const services = [
    { service: "101", name: "Instagram Followers [Max 100K]", category: "Instagram", rate: 0.50 },
    { service: "102", name: "Instagram Likes [Real]", category: "Instagram", rate: 0.10 },
    { service: "205", name: "TikTok Views [Instant]", category: "TikTok", rate: 0.05 },
    { service: "300", name: "YouTube Subscribers", category: "YouTube", rate: 12.00 }
  ];
  return NextResponse.json(services);
}
