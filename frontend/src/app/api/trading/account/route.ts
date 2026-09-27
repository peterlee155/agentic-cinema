import { alpaca, jsonError } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try { return Response.json(await alpaca("/v2/account"), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return jsonError(error); }
}
