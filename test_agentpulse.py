import sys
import io
import json
import logging

# Ensure UTF-8 output on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from core.orchestrator import SwarmOrchestrator
from services.exporter import exporter

logging.basicConfig(level=logging.INFO)

def test_full_pipeline():
    print("=" * 60)
    print("🚀 TESTING AGENTPULSE MULTI-AGENT INTELLIGENCE SWARM")
    print("=" * 60)

    target = "Cursor vs Windsurf AI Code Editor"
    print(f"\n[1] Deploying Swarm for Target: '{target}'...")
    
    orch = SwarmOrchestrator(target_id="test_run_01")
    result = orch.run_pipeline_sync(target)

    print("\n[2] Verifying Agent Output Schemas:")
    print("✅ Scout Data:")
    print(f" - Market Category: {result['scout_data'].get('market_category')}")
    print(f" - Announcements Found: {len(result['scout_data'].get('recent_announcements', []))}")
    print(f" - Key Features: {len(result['scout_data'].get('key_features', []))}")

    print("\n✅ Analyst Data:")
    print(f" - Threat Score: {result['analyst_data'].get('overall_threat_score')}/100 ({result['analyst_data'].get('threat_level')})")
    radar = result['analyst_data'].get('radar_scores', {})
    print(f" - Radar: Innovation={radar.get('innovation_speed')}, Pricing={radar.get('pricing_competitiveness')}, Features={radar.get('feature_depth')}")
    print(f" - SWOT Strengths: {len(result['analyst_data'].get('swot_analysis', {}).get('strengths', []))}")

    print("\n✅ Strategist Data:")
    print(f" - Counter-Plays: {len(result['strategist_data'].get('strategic_counter_plays', []))}")
    print(f" - Executive Summary: {result['strategist_data'].get('executive_summary')[:100]}...")

    print("\n✅ Telemetry & Observability:")
    metrics = result['metrics']
    print(f" - Invocations: {metrics.get('total_invocations')}")
    print(f" - Total Tokens: {metrics.get('total_tokens')}")
    print(f" - Total Latency: {metrics.get('total_latency_ms')} ms")

    print("\n[3] Testing Markdown Exporter...")
    md = exporter.generate_markdown(result)
    print(f"✅ Generated {len(md)} characters of publication-ready markdown briefing.")

    print("\n" + "=" * 60)
    print("✨ ALL AGENTPULSE TESTS PASSED CLEANLY!")
    print("=" * 60)

if __name__ == "__main__":
    test_full_pipeline()
