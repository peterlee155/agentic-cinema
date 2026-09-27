import { jsonError, quoteAndBars, TradingApiError, validSymbol } from "@/lib/trading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, assetType } = validSymbol(body.symbol, body.asset_type);
    const horizon = ["intraday", "swing", "long-term"].includes(body.horizon) ? body.horizon : "swing";
    const apiKey = process.env.TRADING_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new TradingApiError("Gemini is not configured. Add TRADING_GEMINI_API_KEY to frontend/.env.local and restart Next.js.", 503);

    const { quote, bars } = await quoteAndBars(symbol, assetType);
    const closes = bars.map((bar: { c?: number }) => Number(bar.c)).filter((price: number) => Number.isFinite(price) && price > 0);
    if (!quote || closes.length < 5) throw new TradingApiError("Alpaca returned too little market data to analyze this asset.");
    const bid = Number(quote.bp || 0);
    const ask = Number(quote.ap || 0);
    const snapshot = {
      symbol,
      asset_type: assetType,
      horizon,
      bid,
      ask,
      midpoint: bid && ask ? (bid + ask) / 2 : closes.at(-1),
      last_30_daily_closes: closes.slice(-30),
      daily_percent_change_30d: Number((((closes.at(-1)! / closes[0]) - 1) * 100).toFixed(3)),
      recent_five_day_change_pct: Number((((closes.at(-1)! / closes.at(-6)!) - 1) * 100).toFixed(3)),
      quote_timestamp: quote.t || null,
      data_source: "Alpaca",
    };

    const model = process.env.TRADING_AI_MODEL || "gemini-3.8-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are a cautious market research assistant. Separate observed data from uncertain interpretation. Never imply certainty, promise returns, or claim news or facts that are not included in the supplied data." }] },
        contents: [{ role: "user", parts: [{ text: `Analyze only the supplied market snapshot for an educational ${horizon} outlook. This is not financial advice. Use HOLD if evidence is mixed. Do not place or imply an order. Return only JSON with keys: outlook (BUY, SELL, or HOLD), confidence (integer 0-100), summary (two concise sentences), bull_case (string), bear_case (string), risks (array of strings), invalidation (string).\n\n${JSON.stringify(snapshot)}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 700 },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    }).catch(() => { throw new TradingApiError("Could not reach Gemini. Check the API key and try again."); });

    const generated = await response.json().catch(() => ({}));
    if (!response.ok) throw new TradingApiError(generated.error?.message || "Gemini could not analyze this asset.", response.status < 500 ? response.status : 502);
    const text = generated.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") || "";
    let result: Record<string, unknown>;
    try { result = JSON.parse(text); }
    catch { throw new TradingApiError("Gemini returned an unreadable analysis. Please try again."); }
    const outlook = String(result.outlook || "HOLD").toUpperCase();
    return Response.json({
      outlook: ["BUY", "SELL", "HOLD"].includes(outlook) ? outlook : "HOLD",
      confidence: Math.max(0, Math.min(100, Number(result.confidence) || 0)),
      summary: String(result.summary || "No summary returned."),
      bull_case: String(result.bull_case || "Not provided."),
      bear_case: String(result.bear_case || "Not provided."),
      risks: Array.isArray(result.risks) ? result.risks.map(String).slice(0, 8) : [],
      invalidation: String(result.invalidation || "Not provided."),
      symbol,
      asset_type: assetType,
      horizon,
      model,
      snapshot,
      disclaimer: "AI-generated analysis can be wrong. This is not financial advice and does not place an order.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return jsonError(error); }
}
