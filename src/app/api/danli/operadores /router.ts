import { NextResponse } from "next/server";
import { DANLI_OPERADORES } from "../../../../lib/danli";

export async function GET() {
  return NextResponse.json({ items: DANLI_OPERADORES }, { status: 200 });
}
