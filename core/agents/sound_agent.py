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

        schema = """[
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
]"""

        gemini_prompt = f"Design sound and music plans for:\nScenes: {str(scenes)[:1500]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, list) and len(parsed) > 0 and "silence" in parsed[0]:
            return parsed
        elif isinstance(parsed, dict) and "audio" in parsed:
            return parsed["audio"]

        # Default Sound Plan
        return [
            {
                "scene": "Scene 1 - Sanctuary Spell Inscription",
                "dialogue": "Crisp, dry, close-mic vocal presence with subtle stone cathedral reverb.",
                "ambience": "Heavy torrential rain pounding against the protective forcefield like ocean surf.",
                "foley": "Sizzling skin, leather creak of holster, bone stylus grinding on stone.",
                "soundEffects": "Deep sub-bass hum (40 Hz) pulsing continuously from the Keystone Wardstone.",
                "music": "Sparse mournful solo cello over low drone synthesizers.",
                "silence": "STRATEGIC SILENCE: 3 full seconds of total drop-out right before the stylus touches flesh.",
                "emotionalCue": "The sudden quiet magnifies the agony and gravity of the sacrifice.",
                "transition": "Sudden sharp metallic snap transitioning into the market noise."
            },
            {
                "scene": "Scene 2 - Limbo Bazaar Encounter",
                "dialogue": "Intimate, low-register dialogue. Elias's voice is unnervingly smooth and devoid of breath sounds.",
                "ambience": "Distant vendor cries, sizzling griddles, dripping rainwater into corrugated tin barrels.",
                "foley": "Wet combat boot sloshes, fabric friction of duster coat, umbrella fabric snapping in wind.",
                "soundEffects": "Faint high-pitched metallic ping emitted by Kaelen's wrist chronometer every 60 seconds.",
                "music": "NO MUSIC. Ambient market buzz only, heightening the raw psychological unease.",
                "silence": "Sound dips into near-vacuum whenever Elias locks eyes directly with Kaelen.",
                "emotionalCue": "Auditory representation of predatory focus.",
                "transition": "L-Cut: Rain sounds continue into the subterranean tunnel."
            },
            {
                "scene": "Scene 3 - Metro Vault Extraction",
                "dialogue": "Whispered, tense, breathy sibilants bouncing off subterranean tile.",
                "ambience": "Deep reverberant cavern drip, distant electrical hum from rotting transformers.",
                "foley": "Crowbar grinding against rusted hydraulic steel hatch; splashing footfalls.",
                "soundEffects": "High-pitched polite whistling echoing from 300 yards down the subway tracks.",
                "music": "Low sub-harmonic pulse that slowly syncs with Nia's tin music box melody.",
                "silence": "Music box suddenly stops ticking; 5 seconds of absolute silence before the hatch breaks.",
                "emotionalCue": "Vulnerability of childhood innocence confronted with cold mimic calculation.",
                "transition": "J-Cut: Heavy water rush heard before cutting to exterior transit yard."
            },
            {
                "scene": "Scene 4 - Bridge Escape",
                "dialogue": "Shouted through raging rain and panting breath.",
                "ambience": "Gale-force crosswinds, creaking railway bridge cables, splashing floodwater.",
                "foley": "Heavy combat boots hitting iron decking, spent brass shell casings hitting water.",
                "soundEffects": "Furious rapid beeping from wrist timer entering single-digit seconds.",
                "music": "Aggressive, relentless industrial percussion and distorted analog bass synthesizer.",
                "silence": "No silence: maximum auditory chaos and sensory overload.",
                "emotionalCue": "The unyielding terror of time running out.",
                "transition": "Match Cut: Alarm pitch matches the hydraulic hiss of the cathedral airlock."
            }
        ]
