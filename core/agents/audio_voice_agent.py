import json
import logging
from typing import Dict, Any, List, Optional
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("AudioVoiceAgent")

class AudioVoiceAgent(BaseAgent):
    """
    Audio & Voice Agent (Gemini 3.1 Flash TTS Table Read Orchestrator)
    Role: Voice Director & Table Read Assistant

    Orchestrates character table-reads using Gemini 3.1 Flash TTS:
    1. Identifies the primary emotional tone for each line (frantic, whispering, authoritative, etc.)
    2. Annotates SSML or speech markers (<prosody>, <break>, <emphasis>) for pitch, pauses, and cadence
    3. Ensures seamless transitions between different speakers while preserving theatrical dramatic timing
    """
    def __init__(self):
        super().__init__(
            name="Audio & Voice Agent",
            role="Voice Director & Table Read Assistant",
            system_prompt="""You are a voice direction AI orchestrating a character table-read using Gemini 3.1 Flash TTS.
Analyze the provided character dialogue block and output the exact dialogue formatted for multi-speaker text-to-speech synthesis.

Instructions:
1. Identify the primary emotional tone for each line (e.g., frantic, whispering, authoritative, sardonic, trembling).
2. Annotate SSML or speech markers where necessary for emphasis, pauses, or pitch control.
3. Ensure seamless transitions between different speakers while preserving theatrical dramatic timing."""
        )

    def format_table_read(self, dialogue_text: str, cast_profiles: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Direct helper to format any arbitrary dialogue block for Gemini TTS table read."""
        return self._process("temp_project", dialogue_text, {"dialogue_text": dialogue_text, "cast_profiles": cast_profiles or []})

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        scenes = context.get("scenes", []) or context.get("screenplay", [])
        dialogue_text = context.get("dialogue_text", "")
        cast = context.get("cast_profiles", []) or context.get("characters", [])

        schema_instruction = """{
  "project_id": "string",
  "voice_casting": [
    {
      "character": "CHARACTER NAME",
      "voice_profile": "e.g., Aoede (Deep, warm female alto) or Puck (Gruff, gravelly baritone)",
      "base_pitch": "e.g., -2st",
      "base_rate": "e.g., 95%",
      "archetype": "Lead Hero / Antagonist / Child Scavenger"
    }
  ],
  "table_read_lines": [
    {
      "scene_number": 1,
      "speaker": "CHARACTER NAME",
      "emotional_tone": "Primary emotional tone (e.g., frantic, whispering, authoritative)",
      "raw_text": "Spoken dialogue line",
      "ssml": "<speak><voice name=\\"...\\"><prosody pitch=\\"...\\" rate=\\"...\\">Dialogue with <break time=\\"300ms\\"/> markers</prosody></voice></speak>",
      "pause_after_ms": 400,
      "director_cue": "Theatrical timing or breath instruction"
    }
  ],
  "full_multi_speaker_ssml": "<speak>Entire seamless multi-speaker SSML block</speak>"
}"""

        gemini_prompt = f"Format this character dialogue into a theatrical Gemini 3.1 Flash TTS multi-speaker table read:\n"
        if dialogue_text:
            gemini_prompt += f"DIALOGUE BLOCK:\n{dialogue_text[:4000]}"
        elif scenes:
            extracted_dialogues = []
            for sc in scenes[:3]:
                if sc.get("dialogue"):
                    extracted_dialogues.append(f"SCENE {sc.get('sceneNumber', 1)}:\n{sc.get('dialogue')}")
            gemini_prompt += "\n\n".join(extracted_dialogues)
        else:
            gemini_prompt += f"CONTEXT:\n{prompt}"

        raw = self.call_gemini(gemini_prompt, schema_instruction)
        parsed = self.parse_gemini_json(raw)

        if isinstance(parsed, dict) and "table_read_lines" in parsed:
            return parsed

        # Dynamic fallback table read built from actual project characters and scenes
        characters_ctx = context.get("characters") or []
        castings = []
        voice_pool = [
            ("Puck", "Baritone with dramatic resonance", "-2st", "94%"),
            ("Aoede", "Clear, empathetic alto", "+0st", "92%"),
            ("Fenrir", "Articulate, measured tenor", "+1st", "98%"),
            ("Kore", "Warm, expressive soprano", "+2st", "102%")
        ]
        for idx, char in enumerate(characters_ctx[:4]):
            c_name = char.get("name") if isinstance(char, dict) else str(char)
            vp = voice_pool[idx % len(voice_pool)]
            castings.append({
                "character": c_name,
                "voice_profile": f"{vp[0]} ({vp[1]})",
                "base_pitch": vp[2],
                "base_rate": vp[3],
                "archetype": char.get("role", "Cast Role") if isinstance(char, dict) else "Cast Role"
            })
        if not castings:
            castings = [
                {"character": "Lead Protagonist", "voice_profile": "Puck (Resonant Baritone)", "base_pitch": "-2st", "base_rate": "95%", "archetype": "Lead"},
                {"character": "Supporting Guide", "voice_profile": "Aoede (Empathetic Alto)", "base_pitch": "+0st", "base_rate": "92%", "archetype": "Guide"}
            ]

        sample_lines = []
        for sc in (scenes or [])[:3]:
            diag = sc.get("dialogue", "")
            if diag:
                for line in diag.split("\n\n")[:2]:
                    if line.strip():
                        parts = line.strip().split("\n", 1)
                        spk = parts[0].strip()
                        txt = parts[1].strip() if len(parts) > 1 else parts[0].strip()
                        sample_lines.append({
                            "scene_number": sc.get("sceneNumber", 1),
                            "speaker": spk,
                            "emotional_tone": "Cinematic & Grounded",
                            "raw_text": txt[:140],
                            "ssml": f'<voice name="Puck"><prosody rate="95%">{txt[:140]}</prosody></voice>',
                            "pause_after_ms": 600,
                            "director_cue": "Grounded dramatic delivery."
                        })
        if not sample_lines:
            sample_lines = [
                {
                    "scene_number": 1,
                    "speaker": castings[0]["character"],
                    "emotional_tone": "Focused & Resolute",
                    "raw_text": "We are ready. Let's move forward and complete this journey.",
                    "ssml": '<voice name="Puck"><prosody rate="95%">We are ready. Let\'s move forward and complete this journey.</prosody></voice>',
                    "pause_after_ms": 600,
                    "director_cue": "Firm, quiet determination."
                }
            ]

        return {
            "project_id": project_id,
            "voice_casting": castings,
            "table_read_lines": sample_lines,
            "full_multi_speaker_ssml": "<speak>" + "".join([l["ssml"] for l in sample_lines]) + "</speak>"
        }

# Aliases
TableReadAgent = AudioVoiceAgent
VoiceDirectorAgent = AudioVoiceAgent
