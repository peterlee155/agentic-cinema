import { randomUUID } from "node:crypto";
import { alpaca, jsonError, TradingApiError, validSymbol } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("limit") || 20)));
    return Response.json(await alpaca(`/v2/orders?status=all&limit=${limit}&direction=desc`), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.confirmed !== true) throw new TradingApiError("Review the exact order and confirm it before submission.", 400);
    const { symbol, assetType } = validSymbol(body.symbol, body.asset_type);
    const side = body.side === "buy" || body.side === "sell" ? body.side : null;
    if (!side) throw new TradingApiError("Order side must be buy or sell.", 422);
    const notional = Number(body.notional_usd);
    const maxNotional = Math.max(1, Number(process.env.TRADING_MAX_ORDER_USD || 1000));
    if (!Number.isFinite(notional) || notional <= 0 || notional > maxNotional) {
      throw new TradingApiError(`Paper order must be greater than $0 and no more than $${maxNotional.toLocaleString()} per order.`, 422);
    }
    const asset = await alpaca(`/v2/assets/${encodeURIComponent(symbol)}`);
    if (!asset.tradable) throw new TradingApiError(`${symbol} is not tradable in this Alpaca account.`, 422);
    const result = await alpaca("/v2/orders", {
      method: "POST",
      body: {
        symbol,
        notional: notional.toFixed(2),
        side,
        type: "market",
        time_in_force: assetType === "crypto" ? "gtc" : "day",
        client_order_id: `northstar-${randomUUID()}`,
      },
    });
    return Response.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}
