import { jsonError, quoteAndBars, TradingApiError } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ assetType: string; symbol: string }> }) {
  try {
    const { assetType, symbol } = await context.params;
    if (assetType !== "stock" && assetType !== "crypto") throw new TradingApiError("Choose stock or crypto.", 422);
    const market = await quoteAndBars(symbol, assetType);
    return Response.json({ ...market, asset_type: assetType, source: "Alpaca market data" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}
