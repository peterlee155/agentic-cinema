import sys
import json
from core.agents import DirectorAgent, ActorAgent, ActressAgent

def main():
    print("==========================================================================")
    print("=== STANDALONE PERFORMANCE ENGINE: DIRECTOR, LEAD ACTOR & LEAD ACTRESS ===")
    print("==========================================================================")
    
    idea = "In 2089, a reclusive audio archivist and a cryptography specialist discover an unindexed 44 kHz living frequency before the syndicate erases it."
    if len(sys.argv) > 1:
        idea = " ".join(sys.argv[1:])

    print(f"\n[!] Movie Pitch: '{idea}'\n")

    # 1. Initialize Agents
    director = DirectorAgent()
    actor = ActorAgent()
    actress = ActressAgent()

    print(f"[OK] Loaded {director.name} ({director.role})")
    print(f"[OK] Loaded {actor.name} ({actor.role})")
    print(f"[OK] Loaded {actress.name} ({actress.role})\n")

    # 2. Run Directorial Trio Orchestration
    res = director.run_directorial_trio(idea)

    vision = res["director_vision"]
    actor_perf = res["lead_actor_performance"]
    actress_perf = res["lead_actress_performance"]

    print("--------------------------------------------------------------------------")
    print("1. DIRECTOR'S VISION (BOSS DIRECTOR)")
    print("--------------------------------------------------------------------------")
    print(f"• Visual Style:    {vision['visual_style']}")
    print(f"• Camera Package:  {vision['camera_package']}")
    print(f"• Directorial Note: {vision['directorial_note']}\n")

    print("--------------------------------------------------------------------------")
    print("2. LEAD ACTOR PERFORMANCE (LEO THORNE)")
    print("--------------------------------------------------------------------------")
    print(f"• Actor Name:       {actor_perf['actor_name']}")
    print(f"• Archetype:        {actor_perf['archetype']}")
    print(f"• Vocal Cadence:    {actor_perf['vocal_cadence']}")
    print(f"• Scene Objective:  {actor_perf['scene_objective']}")
    print(f"• Screen Time:      {actor_perf['screen_time_seconds']}s (Guaranteed >= 120s)")
    print("• Subtext Notes:")
    for note in actor_perf["subtext_breakdown"]:
        print(f"    - {note}")
    print("• Sample Screenplay Lines:")
    for line in actor_perf["dialogue_lines"]:
        print(f"    {line}")
    print()

    print("--------------------------------------------------------------------------")
    print("3. LEAD ACTRESS PERFORMANCE (LYRA STERLING)")
    print("--------------------------------------------------------------------------")
    print(f"• Actress Name:     {actress_perf['actress_name']}")
    print(f"• Archetype:        {actress_perf['archetype']}")
    print(f"• Vocal Cadence:    {actress_perf['vocal_cadence']}")
    print(f"• Scene Objective:  {actress_perf['scene_objective']}")
    print(f"• Screen Time:      {actress_perf['screen_time_seconds']}s (Guaranteed >= 120s)")
    print("• Subtext Notes:")
    for note in actress_perf["subtext_breakdown"]:
        print(f"    - {note}")
    print("• Sample Screenplay Lines:")
    for line in actress_perf["dialogue_lines"]:
        print(f"    {line}")
    print()

    print("==========================================================================")
    print("=== TRIO PERFORMANCE EXECUTION COMPLETED SUCCESSFULLY! ===")
    print("==========================================================================")

if __name__ == "__main__":
    main()
