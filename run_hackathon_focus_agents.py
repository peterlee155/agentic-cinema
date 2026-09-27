import sys
import io
import json

# Ensure UTF-8 output on Windows consoles
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from core.agents import (
    ScriptAnalysisAgent,
    StoryboardVisualAgent,
    AudioVoiceAgent,
    ProductionOpsAgent
)
from core.orchestrator import orchestrator

def main():
    print("=" * 85)
    print("🎬 GOOGLE DEVPOST HACKATHON FOCUS AGENTS — 4 CORE CAPABILITIES ENGINE")
    print("   Competition: Agentic Cinema: The Blockbuster Hackathon")
    print("=" * 85)

    # 1. Initialize Agents
    script_agent = ScriptAnalysisAgent()
    storyboard_agent = StoryboardVisualAgent()
    audio_agent = AudioVoiceAgent()
    ops_agent = ProductionOpsAgent()

    print(f"\n[OK] Loaded Agent 1: {script_agent.name} ({script_agent.role})")
    print(f"[OK] Loaded Agent 2: {storyboard_agent.name} ({storyboard_agent.role})")
    print(f"[OK] Loaded Agent 3: {audio_agent.name} ({audio_agent.role})")
    print(f"[OK] Loaded Agent 4: {ops_agent.name} ({ops_agent.role})\n")

    project_id = "proj_last_spell"
    bible = orchestrator.get_project(project_id)

    # =========================================================================
    # ၁။ SCRIPT ANALYSIS AGENT
    # =========================================================================
    print("=" * 85)
    print("၁။ SCRIPT ANALYSIS AGENT — PRE-PRODUCTION BREAKDOWN")
    print(f"Role: {script_agent.role}")
    print("=" * 85)
    
    script_result = script_agent.process(
        project_id,
        bible.project.get("logline", "In a zombie apocalypse, humanity survives inside two magical protection layers."),
        {"scenes": bible.scenes, "screenplay": bible.screenplay}
    )

    print(f"\n✅ Generated Pre-Production Breakdown ({len(script_result)} Scenes Analyzed):\n")
    for sc in script_result[:2]:
        print(f"  🎬 SCENE {sc.get('scene_number', 1)}: {sc.get('setting_and_time')}")
        print(f"     Summary: {sc.get('scene_summary')}")
        print("     Characters Present:")
        for ch in sc.get("characters_present", []):
            print(f"       • {ch.get('name')}: {ch.get('emotion_tone')}")
        print("     Props & VFX:")
        for prop in sc.get("props_and_vfx", []):
            print(f"       • {prop}")
        print()

    # =========================================================================
    # ၂။ STORYBOARD & VISUAL AGENT (IMAGEN 3 PROMPT GENERATOR)
    # =========================================================================
    print("=" * 85)
    print("၂။ STORYBOARD & VISUAL AGENT — GOOGLE IMAGEN 3 PROMPT GENERATOR")
    print(f"Role: {storyboard_agent.role}")
    print("=" * 85)

    sample_scene_desc = (
        "EXT. ST. JUDE'S INNER SANCTUARY - DUSK\n"
        "Torrential acid rain beats heavily against the translucent violet forcefield dome. "
        "Sister Mara uses a glowing bone stylus to sear an amber countdown chronometer (04:00:00) "
        "directly into Kaelen's forearm skin before he departs for the quarantine zone."
    )

    concept_frame = storyboard_agent.generate_imagen3_prompt(sample_scene_desc)
    print(f"\n[Scene Input]:\n{sample_scene_desc}\n")
    print("✅ High-End Imagen 3 Concept Frame Specification:")
    print(f"  • Camera Shot Type:      {concept_frame.get('camera_shot_type')}")
    print(f"  • Lighting & Palette:    {concept_frame.get('lighting_and_color_palette')}")
    print(f"  • Subject Action:        {concept_frame.get('subject_action')}")
    print(f"  • Environment Details:   {concept_frame.get('environment_details')}")
    print(f"  • Textures & Optics:     {concept_frame.get('artistic_style_and_textures')}")
    print(f"\n🎨 [FINAL IMAGEN 3 PROMPT (Anti-Buzzword Compliant)]:\n")
    print(f"   \"{concept_frame.get('imagen3_prompt')}\"")
    print(f"\n   Aspect Ratio: {concept_frame.get('aspect_ratio', '16:9')}\n")

    # =========================================================================
    # ၃။ AUDIO & VOICE AGENT (GEMINI 3.1 FLASH TTS TABLE READ)
    # =========================================================================
    print("=" * 85)
    print("၃။ AUDIO & VOICE AGENT — GEMINI 3.1 FLASH TTS MULTI-SPEAKER TABLE READ")
    print(f"Role: {audio_agent.role}")
    print("=" * 85)

    table_read_data = audio_agent.process(
        project_id,
        "",
        {"scenes": bible.scenes, "characters": bible.characters, "cast_profiles": bible.cast}
    )

    print("\n✅ Character Voice Casting Profiles:")
    for v in table_read_data.get("voice_casting", []):
        print(f"  • {v['character']:<20} | Voice: {v['voice_profile']:<30} | Pitch: {v['base_pitch']:<5} | Rate: {v['base_rate']}")

    print("\n✅ Theatrical Multi-Speaker Table Read Lines (with Emotional Tones & SSML Markers):\n")
    for line in table_read_data.get("table_read_lines", [])[:4]:
        print(f"  [{line.get('speaker').upper()}] ({line.get('emotional_tone')})")
        print(f"  Line: \"{line.get('raw_text')}\"")
        print(f"  SSML: {line.get('ssml')}")
        print(f"  Directorial Cue: {line.get('director_cue')} (Pause: {line.get('pause_after_ms')}ms)")
        print()

    # =========================================================================
    # ၄။ PRODUCTION & OPS AGENT (MCP DATA QUERYING VIA CLICKHOUSE & GRAFANA)
    # =========================================================================
    print("=" * 85)
    print("၄။ PRODUCTION & OPS AGENT — MCP DATA QUERYING (CLICKHOUSE / GRAFANA LABS)")
    print(f"Role: {ops_agent.role}")
    print("=" * 85)

    # Query 1: Budget Allocation
    print("\n[Query 1]: 'What is our current departmental budget allocation and burn rate?'")
    budget_res = ops_agent.query_production("What is our current departmental budget allocation and burn rate?", project_id)
    print(f"  • MCP Function Called:  {budget_res['mcp_function_called']['tool']}")
    print(f"  • ClickHouse SQL Exec:  {budget_res['sql_equivalent']}")
    print(f"  • Headline Metric:      {budget_res['visual_metrics']['headline_metric']}")
    print(f"  • Runway Status:        {budget_res['visual_metrics']['runway_status']}")
    print("\n" + budget_res['visual_metrics']['ascii_table'])

    print("\n💡 Actionable Cost Optimization Next Steps:")
    for step in budget_res.get("actionable_next_steps", []):
        print(f"   {step}")

    # Query 2: Shoot Schedules
    print("\n" + "-" * 85)
    print("[Query 2]: 'Show the shoot schedule calendar, daily hours, and location risks.'")
    sched_res = ops_agent.query_production("Show the shoot schedule calendar, daily hours, and location risks.", project_id)
    print(f"  • MCP Function Called:  {sched_res['mcp_function_called']['tool']}")
    print(f"  • Headline Metric:      {sched_res['visual_metrics']['headline_metric']}")
    print(f"  • Risk Factor:          {sched_res['visual_metrics'].get('risk_factor')}")
    print("\n" + sched_res['visual_metrics']['ascii_table'])

    # Query 3: Safety Check Interception Test
    print("\n" + "-" * 85)
    print("[Safety Check Test]: 'DELETE FROM cinema.budget_allocation WHERE department = 'VFX';'")
    safety_res = ops_agent.query_production("DELETE FROM cinema.budget_allocation WHERE department = 'VFX';", project_id)
    print(f"  • Safety Status:        {safety_res.get('safety_check')}")
    print(f"  • Intercept Alert:      {safety_res.get('alert')}")
    print(f"  • Safety Details:       {safety_res.get('details')}")
    print(f"  • Required Action:      {safety_res.get('action_required')}")

    print("\n" + "=" * 85)
    print("✨ ALL 4 GOOGLE DEVPOST HACKATHON FOCUS AGENTS EXECUTED SUCCESSFULLY!")
    print("=" * 85)

if __name__ == "__main__":
    main()
