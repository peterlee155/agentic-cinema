"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeftRight, ArrowRight, ArrowUpRight,
  Bell, CandlestickChart, ChevronDown, ChevronRight, CircleHelp, Clock3,
  Command, Compass, CreditCard, Ellipsis, Eye, EyeOff, LayoutDashboard, LineChart,
  Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Star, Wallet,
} from "lucide-react";

type Asset = { symbol: string; name: string; kind: "Crypto" | "Stock"; price: number; change: number; marketCap: string; volume: string; color: string; icon: string; points: number[] };
type TradingStatus = { credentials_configured: boolean; ai_configured: boolean; paper_mode: boolean; live_trading_enabled: boolean };
type TradingAccount = { portfolio_value: string; cash: string; equity: string; buying_power: string; status: string; currency: string };
type TradingAnalysis = { outlook: "BUY" | "SELL" | "HOLD"; confidence: number; summary: string; bull_case: string; bear_case: string; risks: string[]; invalidation: string; model: string; disclaimer: string };
type BrokerPosition = { symbol: string; qty: string; market_value: string; unrealized_plpc: string; avg_entry_price: string };
type BrokerOrder = { id: string; symbol: string; side: string; status: string; created_at: string; notional?: string; filled_avg_price?: string; filled_qty?: string };

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", kind: "Crypto", price: 67428.52, change: 2.84, marketCap: "$1.32T", volume: "$28.4B", color: "#f6a623", icon: "₿", points: [15, 23, 19, 31, 26, 37, 34, 48, 39, 54, 49, 67, 60, 74, 68, 88] },
  { symbol: "ETH", name: "Ethereum", kind: "Crypto", price: 3521.18, change: 1.62, marketCap: "$423.5B", volume: "$12.8B", color: "#8795f7", icon: "◆", points: [14, 24, 21, 28, 35, 31, 45, 40, 51, 46, 58, 64, 58, 76, 72, 88] },
  { symbol: "SOL", name: "Solana", kind: "Crypto", price: 178.43, change: 5.21, marketCap: "$79.2B", volume: "$2.1B", color: "#ac8bfa", icon: "◎", points: [16, 13, 29, 22, 34, 31, 48, 43, 58, 49, 68, 57, 74, 66, 84, 91] },
  { symbol: "AAPL", name: "Apple Inc.", kind: "Stock", price: 213.07, change: 0.84, marketCap: "$3.26T", volume: "$48.2M", color: "#e2e9f0", icon: "●", points: [17, 22, 19, 34, 28, 37, 33, 43, 47, 39, 59, 54, 65, 58, 75, 83] },
  { symbol: "NVDA", name: "NVIDIA Corp.", kind: "Stock", price: 142.62, change: -1.23, marketCap: "$3.49T", volume: "$186.4M", color: "#78bc58", icon: "◈", points: [83, 75, 78, 64, 70, 60, 68, 49, 55, 43, 50, 34, 42, 27, 34, 19] },
  { symbol: "TSLA", name: "Tesla, Inc.", kind: "Stock", price: 248.50, change: 3.17, marketCap: "$795.1B", volume: "$92.7M", color: "#eb625f", icon: "T", points: [12, 26, 17, 36, 30, 42, 35, 50, 45, 58, 51, 71, 64, 77, 73, 91] },
  { symbol: "SOL", name: "Solana", kind: "Crypto", price: 178.43, change: 5.21, marketCap: "$79.2B", volume: "$2.1B", color: "#ac8bfa", icon: "◎", points: [16, 13, 29, 22, 34, 31, 48, 43, 58, 49, 68, 57, 74, 66, 84, 91] },
  { symbol: "MSFT", name: "Microsoft Corp.", kind: "Stock", price: 447.38, change: -0.32, marketCap: "$3.32T", volume: "$18.5M", color: "#63a4f8", icon: "⊞", points: [77, 71, 79, 60, 66, 57, 63, 50, 56, 42, 48, 38, 44, 29, 35, 25] },
];

const holdings = [
  { symbol: "BTC", name: "Bitcoin", quantity: "0.8421 BTC", value: 56767.94, gain: 13.42, color: "#f6a623", icon: "₿" },
  { symbol: "AAPL", name: "Apple Inc.", quantity: "42.00 shares", value: 8948.94, gain: 5.81, color: "#e2e9f0", icon: "●" },
  { symbol: "ETH", name: "Ethereum", quantity: "3.2500 ETH", value: 11443.84, gain: -2.36, color: "#8795f7", icon: "◆" },
];

const money = (n: number, decimals = 2) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

function Sparkline({ points, down = false, large = false }: { points: number[]; down?: boolean; large?: boolean }) {
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * 400},${100 - p}`).join(" ");
  const color = down ? "#ff717d" : "#40d9a0";
  return <svg className={large ? "sparkline sparkline-large" : "sparkline"} viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={large ? "chartFill" : "miniFill"} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={large ? ".2" : ".12"}/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>{large && <polygon points={`0,100 ${coords} 400,100`} fill="url(#chartFill)"/>}<polyline points={coords} fill="none" stroke={color} strokeWidth={large ? "2.1" : "3"} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>{large && <circle cx="400" cy={100 - points[points.length - 1]} r="3.5" fill={color}/>}</svg>;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [assetFilter, setAssetFilter] = useState("All assets");
  const [range, setRange] = useState("1D");
  const [selected, setSelected] = useState("BTC");
  const [tradeSide, setTradeSide] = useState<"Buy" | "Sell">("Buy");
  const [tradeAmount, setTradeAmount] = useState("500");
  const [search, setSearch] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [watchlist, setWatchlist] = useState(["BTC", "ETH", "NVDA"]);
  const [notice, setNotice] = useState("");
  const [watchOnly, setWatchOnly] = useState(false);
  const [period, setPeriod] = useState("Last 30 days");
  const [tradingStatus, setTradingStatus] = useState<TradingStatus | null>(null);
  const [tradingAccount, setTradingAccount] = useState<TradingAccount | null>(null);
  const [brokerPositions, setBrokerPositions] = useState<BrokerPosition[]>([]);
  const [brokerOrders, setBrokerOrders] = useState<BrokerOrder[]>([]);
  const [liveQuote, setLiveQuote] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<TradingAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tradingSetupMessage, setTradingSetupMessage] = useState("");

  const current = assets.find(a => a.symbol === selected) ?? assets[0];
  const currentPrice = liveQuote ?? current.price;
  const displayHoldings = tradingAccount ? brokerPositions.map(position => {
    const asset = assets.find(item => item.symbol === position.symbol) ?? assets[0];
    return { symbol: position.symbol, name: asset.name, quantity: `${position.qty} ${position.symbol}`, value: Number(position.market_value), gain: Number(position.unrealized_plpc) * 100, color: asset.color, icon: asset.icon };
  }) : holdings;
  const displayOrders = brokerOrders.slice(0, 3).map(order => {
    const asset = assets.find(item => item.symbol === order.symbol) ?? assets[0];
    const amount = order.notional ? money(Number(order.notional)) : order.filled_qty ? `${order.filled_qty} @ ${money(Number(order.filled_avg_price || 0))}` : "—";
    return { type: order.side === "buy" ? "Buy" : "Sell", symbol: order.symbol, name: asset.name, date: new Date(order.created_at).toLocaleString(), amount, icon: asset.icon, color: asset.color, status: order.status };
  });
  const filteredAssets = useMemo(() => assets.filter(a => (assetFilter === "All assets" || a.kind === assetFilter) && (a.name.toLowerCase().includes(search.toLowerCase()) || a.symbol.toLowerCase().includes(search.toLowerCase())) && (!watchOnly || watchlist.includes(a.symbol))), [assetFilter, search, watchOnly, watchlist]);
  const qty = Number(tradeAmount || 0) / currentPrice;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/trading/status").then(response => response.ok ? response.json() : null).then(async status => {
      if (!status || cancelled) return;
      setTradingStatus(status);
      if (status.credentials_configured) {
        const [accountResponse, positionsResponse, ordersResponse] = await Promise.all([
          fetch("/api/trading/account"), fetch("/api/trading/positions"), fetch("/api/trading/orders?limit=5"),
        ]);
        if (accountResponse.ok && !cancelled) setTradingAccount(await accountResponse.json());
        if (positionsResponse.ok && !cancelled) setBrokerPositions(await positionsResponse.json());
        if (ordersResponse.ok && !cancelled) setBrokerOrders(await ordersResponse.json());
      }
    }).catch(() => { if (!cancelled) setTradingSetupMessage("Start the trading backend to connect market data and Gemini."); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const assetType = current.kind === "Crypto" ? "crypto" : "stock";
    fetch(`/api/trading/quote/${assetType}/${encodeURIComponent(current.symbol)}`).then(response => response.ok ? response.json() : null).then(data => {
      if (!cancelled && data?.quote) {
        const quote = data.quote;
        const midpoint = (Number(quote.bp || 0) + Number(quote.ap || 0)) / 2;
        setLiveQuote(midpoint || Number(data.bars?.at(-1)?.c) || null);
      }
    }).catch(() => { if (!cancelled) setLiveQuote(null); });
    return () => { cancelled = true; };
  }, [current.kind, current.symbol]);

  function flash(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 3400); }

  async function runAiAnalysis() {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const response = await fetch("/api/trading/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: current.symbol, asset_type: current.kind === "Crypto" ? "crypto" : "stock", horizon: "swing" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "AI analysis could not be completed.");
      setAnalysis(data);
    } catch (error) {
      flash(error instanceof Error ? error.message : "AI analysis could not be completed.");
    } finally { setAnalyzing(false); }
  }

  async function submitPaperOrder() {
    if (!tradingStatus?.credentials_configured || !tradingStatus.paper_mode) {
      flash("Connect Alpaca paper-trading credentials first.");
      return;
    }
    const amount = Number(tradeAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000) {
      flash("Paper orders must be between $0.01 and $1,000.");
      return;
    }
    const confirmed = window.confirm(`Confirm paper ${tradeSide.toLowerCase()} order\n\n${current.name} (${current.symbol})\n${tradeSide} ${money(amount)} USD\n\nThis uses Alpaca paper trading. No real funds are used.`);
    if (!confirmed) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/trading/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: current.symbol, asset_type: current.kind === "Crypto" ? "crypto" : "stock", side: tradeSide.toLowerCase(), notional_usd: amount, confirmed: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "The paper order was rejected.");
      flash(`Paper order ${data.id ? `#${String(data.id).slice(0, 8)}` : "accepted"}. Check order status before relying on its fill.`);
      const accountResponse = await fetch("/api/trading/account");
      if (accountResponse.ok) setTradingAccount(await accountResponse.json());
      const ordersResponse = await fetch("/api/trading/orders?limit=5");
      if (ordersResponse.ok) setBrokerOrders(await ordersResponse.json());
      const positionsResponse = await fetch("/api/trading/positions");
      if (positionsResponse.ok) setBrokerPositions(await positionsResponse.json());
    } catch (error) {
      flash(error instanceof Error ? error.message : "The paper order could not be submitted.");
    } finally { setSubmitting(false); }
  }

  return (
    <main className="trade-app">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setActiveNav("Overview")}><span className="brand-symbol"><CandlestickChart size={21}/></span><span>northstar<span className="brand-dot">.</span></span></a>
        <div className="workspace-pill"><span className="workspace-avatar">J</span><span className="workspace-copy"><strong>Jordan&apos;s account</strong><small>Personal · USD</small></span><ChevronDown size={15}/></div>
        <p className="nav-label">Workspace</p>
        <nav className="nav-group">
          {[{ label: "Overview", icon: LayoutDashboard }, { label: "Markets", icon: Compass }, { label: "Portfolio", icon: Wallet }, { label: "Activity", icon: Activity }].map(({ label, icon: Icon }) => <button key={label} className={`nav-link ${activeNav === label ? "nav-link-active" : ""}`} onClick={() => { setActiveNav(label); if (label === "Markets") document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" }); if (label === "Portfolio") document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" }); if (label === "Activity") document.getElementById("activity")?.scrollIntoView({ behavior: "smooth" }); if (label === "Overview") window.scrollTo({ top: 0, behavior: "smooth" }); }}><Icon size={17}/><span>{label}</span>{label === "Activity" && <span className="nav-count">4</span>}</button>)}
        </nav>
        <p className="nav-label nav-label-spaced">Tools</p>
        <nav className="nav-group"><button className="nav-link" onClick={() => flash("Recurring buys are coming soon.")}><ArrowLeftRight size={17}/><span>Recurring buys</span><span className="soon-tag">SOON</span></button><button className="nav-link" onClick={() => flash("Your tax center is being prepared.")}><CreditCard size={17}/><span>Tax center</span></button><button className="nav-link" onClick={() => flash("Advanced trading tools are coming soon.")}><LineChart size={17}/><span>Advanced trade</span></button></nav>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Sparkles size={16}/></div><strong>Invest with clarity</strong><p>Learn the basics, explore new assets, and make your next move with confidence.</p><button onClick={() => flash("The Northstar guide is coming soon.")}>Explore guide <ArrowRight size={14}/></button></div><button className="nav-link" onClick={() => flash("Preferences will be available soon.")}><Settings2 size={17}/><span>Preferences</span></button><button className="profile-button"><span className="profile-avatar">JD</span><span className="workspace-copy"><strong>Jordan Davis</strong><small>Personal account</small></span><Ellipsis size={19}/></button></div>
      </aside>

      <section className="main-area" id="overview">
        <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>{activeNav}</strong></div><div className="topbar-actions"><span className="market-status"><i/> Sample market data</span><button className="icon-button" aria-label="Search" onClick={() => document.getElementById("market-search")?.focus()}><Search size={17}/><span className="shortcut"><Command size={11}/> K</span></button><button className="icon-button notification-button" aria-label="Notifications" onClick={() => flash("You’re all caught up.")}><Bell size={17}/><i/></button><button className="top-avatar" aria-label="Jordan Davis">JD</button></div></header>

        <div className="content">
          <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> MARKET SNAPSHOT · SAMPLE RANKINGS</div><h1>Your money, in motion<span>.</span></h1><p className="page-subtitle">A clear view of your portfolio, market moves, and what&apos;s next.</p></div><div className="heading-buttons"><button className="button-secondary" onClick={() => setShowBalance(!showBalance)}>{showBalance ? <Eye size={15}/> : <EyeOff size={15}/>} {showBalance ? "Hide balances" : "Show balances"}</button><button className="button-primary" onClick={() => { setSelected("BTC"); document.getElementById("trade-ticket")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><ArrowRight size={15}/> Trade now</button></div></div>

          {!tradingStatus?.credentials_configured ? <section className="connection-banner"><span className="connection-icon"><Wallet size={17}/></span><div className="connection-copy"><strong>{tradingSetupMessage ? "Trading service not connected" : "Connect a paper trading account"}</strong><p>{tradingSetupMessage || "Link Alpaca for real ticket quotes, Gemini analysis, and simulated orders that use virtual funds."}</p><small>Copy the variables in frontend/.env.example into frontend/.env.local, then restart Next.js. Never paste API keys into the browser or chat.</small></div><a className="connect-link" href="https://app.alpaca.markets/paper/dashboard/overview" target="_blank" rel="noreferrer">Open Alpaca <ArrowRight size={14}/></a></section> : <section className="connection-banner connection-ready"><span className="connection-icon"><ShieldCheck size={17}/></span><div className="connection-copy"><strong>Alpaca paper account connected{!tradingStatus.ai_configured && " · Gemini needs setup"}</strong><p>Ticket quotes and orders use your paper account. Every order needs your confirmation.</p></div><span className="paper-badge">PAPER · VIRTUAL FUNDS</span></section>}

          <section className="overview-grid">
            <article className="balance-card"><div className="card-top"><span>Total portfolio value <button className="info-dot" title="Broker account value when connected; otherwise example data">i</button></span><span className="account-badge"><span/> {tradingAccount ? "PAPER ACCOUNT" : "SAMPLE DATA"}</span></div><div className="balance-amount">{showBalance ? tradingAccount ? money(Number(tradingAccount.portfolio_value)) : <>$84,293<span className="cents">.67</span></> : "••••••••"}</div>{showBalance && <div className="balance-cents">USD</div>}<div className="balance-change">{tradingAccount ? <><span>Account equity</span><span className="change-muted">from Alpaca paper account</span></> : <><span className="change-pill"><ArrowUpRight size={14}/> 2.84%</span><span>+$2,331.18</span><span className="change-muted">sample change</span></>}</div><div className="balance-spark"><Sparkline points={[17,21,18,26,23,34,28,42,39,45,42,59,53,61,55,74,69,80,73,91]}/></div><div className="balance-footer"><span><span className="legend-dot mint"/>Invested <strong>{showBalance && tradingAccount ? money(Number(tradingAccount.portfolio_value) - Number(tradingAccount.cash)) : "$76,410.22"}</strong></span><span><span className="legend-dot blue"/>Buying power <strong>{showBalance && tradingAccount ? money(Number(tradingAccount.buying_power)) : "$7,883.45"}</strong></span></div></article>
            <article className="metric-card"><div className="metric-head"><span>Today&apos;s return · sample</span><span className="metric-icon mint-icon"><ArrowUpRight size={17}/></span></div><div className="metric-value">{showBalance ? "+$1,842.60" : "••••••"}</div><div className="metric-foot"><span className="positive-text">+2.23%</span><span>example data</span><span className="metric-mini"><Sparkline points={[28,26,39,34,48,39,52,45,66,58,75,68,86]}/></span></div></article>
            <article className="metric-card"><div className="metric-head"><span>Asset allocation · sample</span><span className="metric-icon blue-icon"><Wallet size={16}/></span></div><div className="metric-value">{showBalance ? "$76,410" : "••••••"}</div><div className="metric-foot"><span className="metric-note"><span className="legend-dot mint"/> Crypto 58%</span><span className="metric-note"><span className="legend-dot blue"/> Stocks 42%</span></div><div className="allocation-bar"><i/><i/></div></article>
          </section>

          <section className="market-card" id="markets">
            <div className="section-heading market-heading"><div><div className="section-kicker">REFERENCE LIST · SAMPLE VALUES</div><h2>Market overview</h2></div><button className="button-quiet" onClick={() => setAssetFilter(assetFilter === "All assets" ? "Crypto" : "All assets")}>View markets <ArrowRight size={15}/></button></div>
            <div className="market-toolbar"><div className="filter-tabs">{["All assets", "Crypto", "Stocks"].map(tab => <button key={tab} className={assetFilter === tab ? "filter-active" : ""} onClick={() => setAssetFilter(tab)}>{tab}</button>)}</div><div className="market-controls"><button className={`filter-button ${watchOnly ? "filter-button-active" : ""}`} onClick={() => setWatchOnly(!watchOnly)}><Star size={14}/>{watchOnly ? "Watchlist" : "All assets"}<ChevronDown size={13}/></button><label className="search-field"><Search size={14}/><input id="market-search" placeholder="Search assets" value={search} onChange={e => setSearch(e.target.value)}/><kbd>/</kbd></label><button className="filter-icon" aria-label="Market filters" onClick={() => { setSearch(""); setAssetFilter("All assets"); setWatchOnly(false); }}><SlidersHorizontal size={15}/></button></div></div>
            <div className="asset-table-wrap"><table className="asset-table"><thead><tr><th>Asset</th><th>Price</th><th>24h change</th><th>Market cap</th><th>24h volume</th><th>Last 7 days</th><th/></tr></thead><tbody>{filteredAssets.length ? filteredAssets.map((asset, i) => <tr key={`${asset.symbol}-${i}`} className={selected === asset.symbol ? "selected-row" : ""} onClick={() => { setSelected(asset.symbol); document.getElementById("trade-ticket")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><td><div className="asset-name"><span className="asset-icon" style={{ color: asset.color }}>{asset.icon}</span><span><strong>{asset.name}</strong><small>{asset.symbol}<i>·</i>{asset.kind}</small></span></div></td><td className="price-cell">{money(asset.price, asset.price < 1000 ? 2 : 0)}</td><td><span className={`percent ${asset.change > 0 ? "positive-text" : "negative-text"}`}>{asset.change > 0 ? "+" : ""}{asset.change.toFixed(2)}%</span></td><td className="muted-cell">{asset.marketCap}</td><td className="muted-cell">{asset.volume}</td><td className="spark-cell"><Sparkline points={asset.points} down={asset.change < 0}/></td><td><button className={`star-button ${watchlist.includes(asset.symbol) ? "starred" : ""}`} aria-label={`${watchlist.includes(asset.symbol) ? "Remove" : "Add"} ${asset.name} ${watchlist.includes(asset.symbol) ? "from" : "to"} watchlist`} onClick={e => { e.stopPropagation(); setWatchlist(watchlist.includes(asset.symbol) ? watchlist.filter(s => s !== asset.symbol) : [...watchlist, asset.symbol]); }}>{watchlist.includes(asset.symbol) ? "★" : "☆"}</button></td></tr>) : <tr><td colSpan={7} className="empty-state">No assets match “{search}”. Try another search.</td></tr>}</tbody></table></div>
            <div className="table-footer"><span>Showing <strong>{filteredAssets.length}</strong> of 1,248 assets</span><button onClick={() => { setAssetFilter("All assets"); setSearch(""); setWatchOnly(false); }}>View all assets <ArrowRight size={14}/></button></div>
          </section>

          <section className="lower-grid" id="portfolio">
            <article className="portfolio-card"><div className="section-heading"><div><div className="section-kicker">YOUR INVESTMENTS</div><h2>Portfolio</h2></div><button className="period-button" onClick={() => setPeriod(period === "Last 30 days" ? "Year to date" : "Last 30 days")}>{period}<ChevronDown size={14}/></button></div><div className="portfolio-summary"><div><small>Illustrative performance · sample data</small><div className="portfolio-total">+$8,284.21 <span>+12.7%</span></div></div><div className="portfolio-legend"><span><i className="legend-dot mint"/> Crypto</span><span><i className="legend-dot blue"/> Stocks</span></div></div><div className="portfolio-chart"><div className="chart-y-labels"><span>$90k</span><span>$85k</span><span>$80k</span><span>$75k</span><span>$70k</span></div><div className="chart-plot"><div className="chart-gridlines"><i/><i/><i/><i/><i/></div><Sparkline large points={[13,17,15,27,22,34,31,29,42,38,34,48,43,53,46,59,55,52,63,56,68,61,72,66,79,70,82,75,88,83,94]}/><div className="chart-x-labels">{(period === "Last 30 days" ? ["May 19", "May 26", "Jun 2", "Jun 9", "Jun 17"] : ["Jan", "Mar", "May", "Jul", "Today"]).map(m => <span key={m}>{m}</span>)}</div></div></div><div className="range-selector">{["1D", "1W", "1M", "3M", "1Y", "ALL"].map(r => <button key={r} className={range === r ? "range-active" : ""} onClick={() => setRange(r)}>{r}</button>)}<span className="chart-updated"><Clock3 size={12}/> Illustrative chart</span></div><div className="holdings-head"><span>{tradingAccount ? "PAPER ACCOUNT POSITIONS" : "SAMPLE HOLDINGS"}</span><button onClick={() => flash(tradingAccount ? "Showing your current Alpaca paper positions." : "Showing example holdings.")}>See all <ArrowRight size={13}/></button></div>{displayHoldings.length === 0 ? <div className="holding-row empty-state">No open paper positions yet.</div> : displayHoldings.map((h, index) => <div className="holding-row" key={`${h.symbol}-${index}`}><span className="asset-icon holding-icon" style={{ color: h.color }}>{h.icon}</span><div className="holding-label"><strong>{h.name}</strong><small>{h.quantity}</small></div><div className="holding-price"><strong>{money(h.value)}</strong><small className={h.gain > 0 ? "positive-text" : "negative-text"}>{h.gain > 0 ? "+" : ""}{h.gain.toFixed(2)}%</small></div><button className="holding-arrow" aria-label={`View ${h.name}`} onClick={() => { setSelected(h.symbol); document.getElementById("trade-ticket")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><ChevronRight size={16}/></button></div>)}</article>

            <div className="right-column"><article className="trade-ticket" id="trade-ticket"><div className="ticket-heading"><div><div className="section-kicker">QUICK TRADE</div><h2>Place an order</h2></div><button className="ticket-settings" aria-label="Order settings" onClick={() => flash("Paper market orders use the broker's next available execution price.")}><Settings2 size={16}/></button></div><div className="trade-tabs"><button onClick={() => setTradeSide("Buy")} className={tradeSide === "Buy" ? "trade-tab-active" : ""}>Buy</button><button onClick={() => setTradeSide("Sell")} className={tradeSide === "Sell" ? "trade-tab-sell-active" : ""}>Sell</button></div><label className="field-label">You {tradeSide.toLowerCase()}</label><button className="asset-selector" onClick={() => { const next = assets[(assets.findIndex(a => a.symbol === selected) + 1) % assets.length]; setSelected(next.symbol); }}><span className="asset-icon ticket-asset-icon" style={{ color: current.color }}>{current.icon}</span><span className="selector-name"><strong>{current.name}</strong><small>{current.symbol}</small></span><span className="selector-price">{money(currentPrice, currentPrice < 1000 ? 2 : 0)}</span><ChevronDown size={15}/></button><div className="amount-field"><span>$</span><input type="number" min="1" value={tradeAmount} onChange={e => setTradeAmount(e.target.value)} aria-label="Order amount in dollars"/><button onClick={() => setTradeAmount(String(Math.min(Number(tradingAccount?.buying_power || 1000), 1000)))}>USD <ChevronDown size={12}/></button></div><div className="amount-helper"><span>≈ {qty.toFixed(6)} {current.symbol} · {liveQuote ? "Alpaca quote" : "example quote"}</span><button onClick={() => setTradeAmount(String(Math.min(Number(tradingAccount?.buying_power || 1000), 1000)))}>Max</button></div><div className="order-details"><span>Order type <strong>Market order <ChevronDown size={12}/></strong></span><span>Estimated fee <strong>Broker fees may apply <button className="info-dot" title="Fees are determined by the broker and asset class">i</button></strong></span><span>Buying power <strong>{money(Number(tradingAccount?.buying_power || 0))}</strong></span></div><button className="ai-analysis-button" disabled={!tradingStatus?.ai_configured || analyzing} onClick={runAiAnalysis}><Sparkles size={14}/>{analyzing ? "Gemini is analyzing…" : "Analyze with Gemini"}</button>{analysis && <div className="analysis-result"><div className="analysis-result-head"><span className={`analysis-outlook outlook-${analysis.outlook.toLowerCase()}`}>{analysis.outlook}</span><span>AI confidence {analysis.confidence}%</span><span>{analysis.model}</span></div><p>{analysis.summary}</p><div className="analysis-cases"><span><strong>Bull case</strong>{analysis.bull_case}</span><span><strong>Bear case</strong>{analysis.bear_case}</span></div><strong className="analysis-risk-title">Risks to consider</strong><ul>{analysis.risks.map((risk, index) => <li key={index}>{risk}</li>)}</ul><div className="analysis-invalidation"><strong>What would change this view</strong>{analysis.invalidation}</div><small>{analysis.disclaimer}</small></div>}<button className={`execute-button ${tradeSide === "Sell" ? "execute-sell" : ""}`} disabled={!tradingStatus?.credentials_configured || submitting} onClick={submitPaperOrder}>{submitting ? "Sending to paper account…" : tradingStatus?.credentials_configured ? `Review ${tradeSide} paper order` : "Connect paper account to trade"} <ArrowRight size={15}/></button><div className="secure-note"><ShieldCheck size={13}/> Paper account only · Confirm every order</div></article>
            <article className="watchlist-card"><div className="watchlist-head"><div><div className="section-kicker">KEEP AN EYE ON IT</div><h3>Your watchlist</h3></div><button className="round-plus" aria-label="Add BTC to watchlist" onClick={() => setWatchlist(watchlist.includes("BTC") ? watchlist : [...watchlist, "BTC"])}><Plus size={15}/></button></div>{assets.filter(a => watchlist.includes(a.symbol)).slice(0, 4).map((a, index) => <button className="watch-row" key={`${a.symbol}-${index}`} onClick={() => { setSelected(a.symbol); document.getElementById("trade-ticket")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}><span className="asset-icon watch-asset-icon" style={{ color: a.color }}>{a.icon}</span><span className="watch-asset-name"><strong>{a.symbol}</strong><small>{a.name}</small></span><Sparkline points={a.points} down={a.change < 0}/><span className={a.change > 0 ? "positive-text" : "negative-text"}>{a.change > 0 ? "+" : ""}{a.change.toFixed(2)}%</span></button>)}{watchlist.length === 0 && <p className="empty-watchlist">Your list is ready for the assets you want to follow.</p>}<button className="watchlist-link" onClick={() => { setWatchOnly(true); document.getElementById("markets")?.scrollIntoView({ behavior: "smooth" }); }}>Manage watchlist <ArrowRight size={13}/></button></article>
            </div>
          </section>

          <section className="activity-card" id="activity"><div className="section-heading"><div><div className="section-kicker">RECENTLY IN YOUR ACCOUNT</div><h2>Recent activity</h2></div><button className="button-quiet" onClick={() => flash("You’re viewing your most recent transactions.")}>See all activity <ArrowRight size={15}/></button></div><div className="activity-table"><div className="activity-table-head"><span>TRANSACTION</span><span>DATE</span><span>STATUS</span><span>AMOUNT</span></div>{tradingAccount ? displayOrders.map((x, index) => <div className="activity-row" key={x.id || `${x.symbol}-${index}`}><span className="activity-transaction"><span className="activity-icon" style={{ color: x.color }}>{x.icon}</span><span><strong>{x.type} {x.symbol}</strong><small>{x.name}</small></span></span><span>{x.date}</span><span><i className="status-dot"/> {x.status}</span><strong>{x.amount}</strong></div>) : [{ type: "Buy", symbol: "BTC", name: "Example order", date: "Sample activity", amount: "$250.00", icon: "₿", color: "#f6a623" }, { type: "Buy", symbol: "AAPL", name: "Example order", date: "Sample activity", amount: "$500.00", icon: "●", color: "#e2e9f0" }, { type: "Deposit", symbol: "USD", name: "Example bank transfer", date: "Sample activity", amount: "+$2,000.00", icon: "↙", color: "#40d9a0" }].map((x, index) => <div className="activity-row" key={`${x.symbol}-${index}`}><span className="activity-transaction"><span className="activity-icon" style={{ color: x.color }}>{x.icon}</span><span><strong>{x.type} {x.symbol}</strong><small>{x.name}</small></span></span><span>{x.date}</span><span><i className="status-dot"/> Example only</span><strong>{x.amount}</strong></div>)}</div></section>

          <footer className="footer"><span>© 2024 Northstar Financial, Inc.</span><span><ShieldCheck size={13}/> Your assets are protected with bank-level security</span><button onClick={() => flash("Help center coming soon.")}><CircleHelp size={13}/> Help center</button><span className="demo-disclaimer">Demo experience · Not financial advice</span></footer>
        </div>
      </section>
      {notice && <div className="toast"><span className="toast-check">✓</span>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
      <div className="disclaimer-ribbon"><span><ShieldCheck size={13}/> PAPER TRADING ONLY</span><span>Orders use virtual funds after confirmation. Market rankings and charts contain sample data; no live-money orders are enabled.</span></div>
    </main>
  );
}
