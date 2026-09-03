import os
import sys
import io
import json
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from core.orchestrator import orchestrator
from core.pdf_renderer import render_beautiful_production_pdf_html

def run_swarm_testing():
    print("=" * 80)
    print("🎬 AGENTIC CINEMA — MASTER MULTI-AGENT SWARM PIPELINE RUNNER")
    print("=" * 80)

    test_idea = (
        "In a subterranean neon metropolis where human speech is outlawed, "
        "a renegade frequency technician uncovers an ancient vocal resonance "
        "capable of destabilizing the central sound barrier."
    )

    print(f"\n[0] 💡 USER IDEA:\n    \"{test_idea}\"")
    print("-" * 80)

    # 1. Initialize Bible
    bible = orchestrator.create_project(
        title="THE VOCAL RESONANCE",
        logline=test_idea,
        genre="Sci-Fi Dystopian Cyber-Thriller",
        tone="Visceral, Claustrophobic, High-Stakes",
        visual_style="35mm Anamorphic, High-Contrast Neon Haze",
        target_duration="115 Minutes",
        language="English"
    )
    project_id = bible.project_id
    print(f"[*] Initialized Project Bible: '{bible.project['title']}' (ID: {project_id})")

    # Run Master Multi-Agent Production Pipeline
    print("\n🚀 LAUNCHING 10-AGENT CINEMATIC PIPELINE...")
    res = orchestrator.run_production(project_id, test_idea, force_regenerate=True)

    print("\n" + "=" * 80)
    print("📊 MULTI-AGENT EXECUTION LOG & DELIVERABLES:")
    print("=" * 80)

    for item in res.get("pipeline_log", []):
        agent = item.get("agent")
        status = item.get("status")
        summary = item.get("summary")
        print(f"  [{status}] {agent.upper()}: {summary}")

    updated_bible = orchestrator.get_project(project_id)

    print("\n" + "-" * 80)
    print("📦 FINAL PRODUCTION PACKAGE ARTIFACTS:")
    print("-" * 80)
    print(f"  🎬 Title: {updated_bible.project.get('title')}")
    print(f"  📜 Screenplay Scenes: {len(updated_bible.scenes)} Scenes Written")
    if updated_bible.scenes:
        for sc in updated_bible.scenes[:2]:
            print(f"     - SCENE {sc.get('sceneNumber')}: {sc.get('heading')}")
            print(f"       Dialogue lines: {len(sc.get('dialogue', []))}")
    print(f"  🎭 Characters: {len(updated_bible.characters)} Profiles Created")
    print(f"  🎥 Camera Shots: {len(updated_bible.shots)} Staging Setups")
    print(f"  📽️ Cinematography Plans: {len(updated_bible.cinematography)} Optical Blueprints")
    print(f"  🖼️ Storyboard Frames: {len(updated_bible.storyboard)} 8K Keyframe Prompts")
    print(f"  🎵 Soundscapes: {len(updated_bible.audio)} Acoustic Layers with Strategic Silence")
    print(f"  ✂️ Editorial Plan: {updated_bible.editPlan.get('pacingStrategy', 'Dynamic Accelerando')}")
    print(f"  📱 Social & Viral Hooks: {len(updated_bible.socialContent.get('tiktok_reels_shorts', []))} Formats")
    print(f"  💃 Dance Choreography: {len(updated_bible.danceConcepts)} 4-Beat Concepts")

    # Render Production Package Document
    md_text = updated_bible.to_markdown() if hasattr(updated_bible, 'to_markdown') else f"# {updated_bible.project.get('title')}\n\n{updated_bible.project.get('logline')}"
    export_html = render_beautiful_production_pdf_html(md_text, updated_bible.project)
    
    export_dir = os.path.join(orchestrator.root_dir, "static", "exports")
    os.makedirs(export_dir, exist_ok=True)
    export_path = os.path.join(export_dir, f"{project_id}_production_bible.html")
    with open(export_path, "w", encoding="utf-8") as f:
        f.write(export_html)
    print(f"  📄 Master Production Bible HTML: {export_path}")

    # Also clean up the temporary test project from disk so it doesn't clutter library
    test_json = os.path.join(orchestrator.storage_dir, f"{project_id}.json")
    if os.path.exists(test_json):
        os.remove(test_json)

    print("\n" + "=" * 80)
    print("🎉 FULL 10-AGENT SWARM PIPELINE COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_swarm_testing()
