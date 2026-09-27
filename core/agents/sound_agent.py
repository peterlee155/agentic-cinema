import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("SoundAgent")

class SoundAgent(BaseAgent):
    """
    Sound & Music Agent: Supervising Sound Editor & Composer
    Generates for every scene:
    - Dialogue Treatment (Acoustic presence, room reverb, proximity effect)
    - Environmental Ambience (Wind, rain, mechanical hums, air circulation)
    - Foley (Footsteps, cloth friction, leather creak, weapon handling)
    - Sound Effects (SFX: forcefields, runic hissing, metallic locks)
    - Music Score (Theme motifs, instrument choices, harmonic tension)
    - STRATEGIC SILENCE (Deliberate audio drop-outs that amplify dramatic shock)
    - Emotional Audio Cue (Auditory anchor triggering psychological subtext)
    - Scene Transition Audio (J-Cuts, L-Cuts, audio match cuts)
    CRITICAL RULE: Strategic silence is prioritized. Music is NOT plastered over every scene.
    """
    def __init__(self):
        super().__init__(
            name="Sound & Music",
            role="Supervising Sound Designer & Composer",
            system_prompt="""You are an Oscar-winning Supervising Sound Editor and Film Composer.
Your task is to establish an exhaustive, deeply immersive auditory blueprint for every scene.
LENGTH DIRECTIVE: Produce comprehensive, multi-layer acoustic soundscapes. Do NOT abbreviate.
For each scene, detail:
- Acoustic spatial reverberation and room tone characteristics (e.g. cavernous granite cathedral with 3.2s RT60 decay vs. choked sub-zero tunnel)
- Granular micro-foley and tactile cloth/footstep/weapon sounds
- Specific musical score composition (instruments, discordant intervals, low-frequency 30Hz sub-drones)
- STRATEGIC SILENCE: Deliberate dead-drop audio cutouts timed to the exact second before violent or shocking beats
- Scene transition audio mechanics (pre-lapping J-cuts, trailing L-cuts, acoustic match cuts)."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])

        schema = """{
  "audio": [
    {
      "scene": "Scene 1: Slugline",
      "dialogue": "Acoustic vocal treatment",
      "ambience": "Atmospheric background sounds",
      "foley": "Physical props and movement sounds",
      "soundEffects": "Special effects audio",
      "music": "Score or 'NONE - Ambient sound only'",
      "silence": "Exact description of strategic silence",
      "emotionalCue": "Psychological audio anchor",
      "transition": "Audio transition description"
    }
  ]
}"""

        gemini_prompt = f"Design sound and music plans for:\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict):
            for k in ["audio", "soundscapes", "sound", "plans", "data"]:
                if k in parsed and isinstance(parsed[k], list) and len(parsed[k]) > 0:
                    return parsed[k]
        elif isinstance(parsed, list) and len(parsed) > 0 and "silence" in parsed[0]:
            return parsed

        # Dynamic Sound Plan derived from project scenes
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        title = context.get("title") or "UNTITLED FEATURE"
        if scenes and isinstance(scenes, list):
            dynamic_audio = []
            for idx, sc in enumerate(scenes[:4]):
                s_num = sc.get("scene_number", idx + 1)
                slug = sc.get("slug") or f"Scene {s_num}"
                dynamic_audio.append({
                    "scene": f"Scene {s_num} - {slug}",
                    "dialogue": f"Crisp, grounded vocal fidelity with acoustic response tailored for {slug}.",
                    "ambience": f"Rich motivated environmental atmosphere suited for {slug}.",
                    "foley": "Tactile surface footfalls, garment rustle, and physical prop movement.",
                    "soundEffects": "Deep cinematic sub-bass accents reinforcing dramatic shifts.",
                    "music": "Atmospheric score combining analog instrumentation and emotional thematic motifs.",
                    "silence": "STRATEGIC SILENCE: 2-second dynamic drop before the primary dramatic reveal.",
                    "emotionalCue": f"Enhances the dramatic tension and narrative focus of {title}.",
                    "transition": "Fluid sound bridge leading into the subsequent sequence."
                })
            return dynamic_audio

        return [
            {
                "scene": f"Scene 1 - {title} Opening Sequence",
                "dialogue": "Naturalistic vocal recording with cinematic presence.",
                "ambience": "Atmospheric environmental soundscape.",
                "foley": "Tactile movement and organic foley textures.",
                "soundEffects": "Deep sub-harmonic rumble grounding the dramatic scale.",
                "music": "Atmospheric strings and modular synthesizer textures.",
                "silence": "Strategic audio drop during critical tension beats.",
                "emotionalCue": "Immerses audience in the stakes of the opening sequence.",
                "transition": "L-Cut carrying acoustic atmosphere into next scene."
            }
        ]
