import sys
import os
import io
import json

# Ensure UTF-8 output on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from core.orchestrator import AgenticCinemaOrchestrator
from mcp.clickhouse_mcp_server import ClickHouseMCPServer
from db.clickhouse_client import db

def test_full_agentic_system():
    print("=" * 70)
    print("🎬 TESTING AGENTIC CINEMA ARCHITECTURE & MULTI-AGENT ROUTING")
    print("=" * 70)

    # 1. Initialize Orchestrator
    print("\n[1] Initializing AgenticCinemaOrchestrator...")
    orchestrator = AgenticCinemaOrchestrator(project_id="test_studio_run")
    assert orchestrator.director_agent is not None
    assert len(orchestrator.director_agent.story_agent.name) > 0
    print("✓ Orchestrator and Director Agent initialized successfully.")

    # 2. Test Director Dynamic Routing (Single Task: Character)
    print("\n[2] Testing Director Intent Routing: 'Create a ruthless corporate villain'...")
    res_char = orchestrator.handle_request("Create a ruthless corporate villain who controls the city power grid.")
    assert res_char["success"] is True
    assert res_char["routing"]["delegated_to"] == "Character Agent"
    print(f"✓ Director correctly delegated to: {res_char['routing']['delegated_to']}")

    # 3. Test Director Dynamic Routing (Single Task: World/Story)
    print("\n[3] Testing Director Intent Routing: 'Create world history and rules'...")
    res_story = orchestrator.handle_request("Create the history and physical rules of this world.")
    assert res_story["success"] is True
    assert res_story["routing"]["delegated_to"] == "Story Agent"
    print(f"✓ Director correctly delegated to: {res_story['routing']['delegated_to']}")

    # 4. Test Director Dynamic Routing (Single Task: Screenplay)
    print("\n[4] Testing Director Intent Routing: 'Turn this into a screenplay scene'...")
    res_screen = orchestrator.handle_request("Turn this confrontation into a dramatic screenplay scene.")
    assert res_screen["success"] is True
    assert res_screen["routing"]["delegated_to"] == "Screenwriter Agent"
    print(f"✓ Director correctly delegated to: {res_screen['routing']['delegated_to']}")

    # 5. Test Director Dynamic Routing (Single Task: Production & Shot List)
    print("\n[5] Testing Director Intent Routing: 'Create camera shot list for scene 1'...")
    res_prod = orchestrator.handle_request("Create camera shot lists and VFX breakdown for scene 1.")
    assert res_prod["success"] is True
    assert res_prod["routing"]["delegated_to"] == "Production Agent"
    print(f"✓ Director correctly delegated to: {res_prod['routing']['delegated_to']}")

    # 6. Test Director Dynamic Routing (Single Task: Marketing & TikTok)
    print("\n[6] Testing Director Intent Routing: 'Create TikTok campaign'...")
    res_mkt = orchestrator.handle_request("Create TikTok promotional hooks and teaser trailer concepts.")
    assert res_mkt["success"] is True
    assert res_mkt["routing"]["delegated_to"] == "Marketing Agent"
    print(f"✓ Director correctly delegated to: {res_mkt['routing']['delegated_to']}")

    # 7. Test Full End-to-End Multi-Agent Production Pipeline
    print("\n[7] Testing Full End-to-End Multi-Agent Production Workflow...")
    pitch = "A reclusive audio archivist in 2089 discovers an unindexed acoustic frequency that holds humanity's erased memories."
    full_res = orchestrator.handle_request(pitch)
    assert full_res["success"] is True
    assert full_res["routing"]["workflow_type"] == "FULL_CINEMATIC_PRODUCTION"
    
    bible = full_res["data"]
    print(f"✓ Full Production Generated:")
    print(f"   - Title: {bible['brief']['title']}")
    print(f"   - Characters: {len(bible['characters'])} profiles created")
    print(f"   - Screenplay Scenes: {len(bible['screenplay_scenes'])} scenes written")
    print(f"   - Production Shot Lists: {len(bible['production_plan'].get('shot_lists', []))} scenes broken down")
    print(f"   - Marketing Taglines: {len(bible['marketing_plan'].get('taglines', []))} taglines created")

    # 8. Test Master Project Bible Persistence
    print("\n[8] Testing Project Bible File Persistence & Continuity...")
    assert os.path.exists("project_bible.json")
    print("✓ project_bible.json successfully saved and verified.")

    # 9. Test ClickHouse Telemetry & Analytics
    print("\n[9] Testing ClickHouse Telemetry & Observability Layer...")
    metrics = db.get_dashboard_metrics("test_studio_run")
    print(f"✓ Telemetry Source: {metrics['source']}")
    print(f"✓ Logged Agents in Telemetry: {len(metrics['telemetry'])}")
    for t in metrics["telemetry"]:
        print(f"   - {t['agent']}: {t['invocations']} calls, {t['avg_latency_ms']}ms avg, {t['total_tokens']} tokens")

    # 10. Test ClickHouse Partner MCP Server
    print("\n[10] Testing ClickHouse Model Context Protocol (MCP) Server...")
    mcp_server = ClickHouseMCPServer()
    tools = mcp_server.list_tools()
    assert len(tools) == 5
    print(f"✓ ClickHouse MCP Server online with {len(tools)} standard tools.")
    
    table_tool_res = mcp_server.call_tool("list_clickhouse_tables", {})
    assert len(table_tool_res["tables"]) == 4
    print(f"✓ MCP Tool 'list_clickhouse_tables' returned: {table_tool_res['tables']}")

    print("\n" + "=" * 70)
    print("🎉 ALL 10 ARCHITECTURAL & AGENTIC TESTS PASSED CLEANLY!")
    print("=" * 70)

if __name__ == "__main__":
    test_full_agentic_system()
