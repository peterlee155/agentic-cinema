import { tradingStatus } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(tradingStatus(), { headers: { "Cache-Control": "no-store" } });
}
