# 🎬 AGENTIC CINEMA — Autonomous AI Filmmaking Studio
*Built for the Google "Agentic Cinema: The Blockbuster Hackathon" (Devpost).*

[![Google Gemini](https://img.shields.io/badge/Google_Cloud-Gemini_3.7_Flash-4285F4?logo=google)](https://cloud.google.com/)
[![Partner MCP](https://img.shields.io/badge/Partner_MCP-ClickHouse-FFDF00?logo=clickhouse)](https://clickhouse.com/)
[![Monetization](https://img.shields.io/badge/Monetization-RevenueCat_Ready-E85D04)](https://www.revenuecat.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 1. Executive Summary: What It Does
**Agentic Cinema** is a professional AI filmmaking studio where a creator provides a high-level movie idea and an autonomous team of 10 specialized AI agents transforms it into a complete, Hollywood-grade cinematic production package.

The user acts as the **Executive Producer / Director**, directing an intelligent creative film crew that shares a canonical project bible, respects unbreakable universe rules, enforces "Show, Don't Tell" screenplay standards, and logs production telemetry into an official **ClickHouse MCP Server**.

---

## 🎯 2. The Primary Filmmaking Problem
Transforming an initial film concept into an actionable production package currently requires coordinating dozens of disparate creative disciplines—screenwriting, directorial shot design, character costume styling, lighting plans, sound design, editing pace, and viral promotion. Traditional chat interfaces produce fragmented text snippets with zero continuity, broken character appearances, and contradictory world lore.

**Agentic Cinema Solves This Primary Problem:**
It provides a single, deterministic multi-agent production pipeline where specialized agents receive structured data handoffs, maintain locked-in universe facts, audit cross-scene continuity, and assemble publication-grade production deliverables in seconds.

---

## 🏗️ 3. The Core Experience & Swarm Architecture

```
USER IDEA
   ↓
PRODUCER AGENT (Logline, World, 3-Act Structure, Stakes, Risks)
   ↓
SCREENWRITER AGENT (Show-Don't-Tell Structured Scenes & Dialogue)
   ↓
DIRECTOR AGENT (Camera Positions, Movements, Lenses, Blocking, Pacing)
   ↓
ART DIRECTOR AGENT (Character Visual Evolution, Wardrobes, Locations)
   ↓
CINEMATOGRAPHER AGENT (35mm Anamorphic Optical Plans & Lighting)
   ↓
STORYBOARD AGENT (Google Imagen 3 8K Stills & Google Veo 24fps Motion Prompts)
   ↓
SOUND & MUSIC AGENT (Dialogue Acoustics, Ambience & Strategic Silence)
   ↓
EDITOR AGENT (Accelerating Pacing Curves, Cut Timing, Match Cuts)
   ↓
FINAL PRODUCTION PACKAGE (Hollywood Master Bible PDF, Fountain Script)
   ↓
SOCIAL & VIRAL AGENT (Google Veo 9:16 Teaser Videos, Google Imagen 3 Theatrical Key Art, TikTok Hooks)
   ↓
DANCE AGENT (4-Part Viral Beat Choreography: Hook, Main, Signature, Pose)
```

---

## 🚀 4. Google Cloud & Gemini Integration
* **SDKs:** `@google/genai` (v0.1.1) and `google.generativeai` (v0.8.0).
* **Models:** **Gemini 3.7 Flash** (default for sub-second agent reasoning handoffs) and **Gemini 3.5 Pro** (for deep narrative density).
* **Runtime Verification:** Google Gemini is invoked dynamically by each agent via `call_gemini()`, passing structured system prompts and JSON schemas. In offline environments, an autonomous heuristic engine ensures 100% demo resilience without crashing.
* **No Prohibited Frameworks:** Built cleanly with native Python and Google Cloud SDKs. Zero dependencies on OpenAI, Anthropic, LangChain, CrewAI, or AutoGen.

---

## ⚡ 5. Partner MCP: ClickHouse Analytics Engine
Agentic Cinema actively integrates **ClickHouse** as the official Hackathon Partner via the Model Context Protocol:
* **Server:** `mcp/clickhouse_mcp_server.py` implementing MCP protocol specification.
* **Storage Engine:** Columnar `MergeTree()` tables in the `cinema` database:
  * `production_telemetry`: Agent latency, prompt/completion tokens, execution status.
  * `character_analytics`: Dialogue lines, word counts, sentiment trajectory, screen-time.
  * `scene_metrics`: Shot count, VFX complexity scores (1-10), estimated budget tier.
* **Active Tools:**
  * `run_clickhouse_query`: Live SQL query execution from the Settings & Architecture panel.
  * `get_production_telemetry`: Aggregated latency and token usage metrics.
  * `get_character_analytics`: Dialogue distribution and screen-time breakdowns.
  * `get_scene_metrics`: Scene complexity and shot statistics.
* **Zero Fake Integrations:** Dual-mode architecture seamlessly connects to ClickHouse Cloud or self-hosted clusters, with an instant local columnar buffer fallback for evaluation stability.

---

## 💳 6. RevenueCat-Ready Monetization Layer
* **Pattern:** Adapter pattern separating monetization (`services/revenuecat.js` and `services/revenuecat_service.py`).
* **Adapters:**
  * `RevenueCatAdapter`: Production web Purchases SDK integration.
  * `RevenueCatMockAdapter`: Secure evaluation mode clearly labeled **DEMO / MOCK**.
* **Tiers:** `FREE` (50 Credits), `CREATOR` (150 Credits), `PRO` (500 Credits), `STUDIO` (2,500 Credits).
* **AI Credit System:** Pre-action usage dialogs confirm credit deductions (Script: 2, Storyboard: 5, Image: 8, Video: 20, Render: 30), triggering paywalls and instant demo upgrades when limits are reached.

---

## 🎬 7. Default Demo Movie: THE LAST SPELL
Agentic Cinema includes **"THE LAST SPELL"** as a rich, pre-populated default demo project:
* **World:** A zombie apocalypse where humanity survives inside two magical protection layers. The outer barrier can be entered by zombies. The inner sanctuary cannot be entered by zombies. Zombies outside behave and speak like ordinary humans. Humans need a limited countdown spell when leaving to scavenge.
* **Core Hook:** The infected look completely normal; human protection operates on a burning wrist countdown clock.
* **Status:** Ready for instant evaluation in 60 seconds without typing.

---

## 🛠️ 8. Quickstart & Tested Spin-Up Guide

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* (Optional) Google Gemini API Key or Google Cloud Vertex AI credentials
* (Optional) Local ClickHouse (port 8123) or ClickHouse Cloud (port 8443)

### 1. Backend Setup & Launch (Port 9000)
```bash
# In repository root:
pip install -r requirements.txt

# (Optional) Configure environment
cp .env.example .env
# Set GEMINI_API_KEY or GOOGLE_APPLICATION_CREDENTIALS in .env

# Launch FastAPI Backend on port 9000:
python run.py 9000
```
Backend API will be live on **`http://localhost:9000`** with OpenAPI docs at `http://localhost:9000/docs`.

### 2. Frontend Studio Launch (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser. Next.js proxies all `/api/*` requests directly to `http://127.0.0.1:9000`.

### 3. Verification & Health Check
* Open **`http://localhost:3000`** to access the 1-Click Kid-Friendly & Pro Studio.
* Check **`http://localhost:9000/api/health`** to verify system telemetry, Google Cloud Gemini/Vertex AI, multi-agent swarm status, and ClickHouse MCP connectivity.

---

## 🌐 9. API & MCP Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Main Studio Web UI |
| `/api/health` | `GET` | Judge transparency health (Gemini, MCP, RevenueCat) |
| `/api/projects` | `GET` | List all film projects in workspace |
| `/api/projects/create` | `POST` | Project Creation Wizard factory |
| `/api/pipeline/run` | `POST` | Central Production Swarm execution |
| `/api/pipeline/retry-agent` | `POST` | Retry single failed or specific agent |
| `/api/mcp/tools` | `GET` | List ClickHouse MCP server tools |
| `/api/mcp/call` | `POST` | Execute ClickHouse MCP tool dynamically |
| `/api/telemetry` | `GET` | Query live ClickHouse production metrics |
| `/api/continuity/audit` | `GET` | Run Continuity Engine audit against project bible |
| `/api/monetization/upgrade` | `POST` | Demo upgrade subscription plan |
| `/api/export/pdf-html` | `GET` | Render publication-grade Hollywood Master Bible |
| `/api/export/fountain` | `GET` | Export screenplay in Fountain format |

---

## 📜 License
MIT License. Built for the Google Agentic Cinema Blockbuster Hackathon 2026.
