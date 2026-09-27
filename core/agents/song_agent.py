import logging
from typing import Dict, Any
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("SongAgent")

class SongMusicAgent(BaseAgent):
    """
    Song / Music Agent: Soundtrack Songwriter
    Composes original movie theme songs, lyrics, and emotional musical cues for pivotal film scenes.
    """
    def __init__(self):
        super().__init__(
            name="Song / Music Agent",
            role="Original Soundtrack Songwriter & Composer",
            system_prompt="You are the Songwriter. Write one original song for a key emotional moment in the movie — lyrics plus a description of the mood/instruments. Make it fit the scene like a song from a real movie soundtrack."
        )

    def _normalize_gemini_output(self, raw: Any, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if isinstance(raw, dict) and "song_title" in raw:
            return raw
        return self._process("", prompt, context)

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        brief = context.get("brief", {})
        title = brief.get("title") or context.get("title") or prompt or "UNTITLED FILM"
        genre = brief.get("genre", "Cinematic Drama")
        logline = brief.get("logline", "")

        schema = """{
  "song_title": "string",
  "scene_placement": "string",
  "tempo_and_key": "string",
  "mood_and_instrumentation": "string",
  "lyrics": {
    "verse_1": "string",
    "chorus": "string",
    "verse_2": "string",
    "bridge": "string",
    "outro": "string"
  },
  "production_notes": "string"
}"""

        gemini_prompt = f"Compose an original feature film theme song and soundtrack lyrics for '{title}'.\nGenre: {genre}\nLogline: {logline}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if isinstance(parsed, dict) and "song_title" in parsed:
            return parsed
        
        return {
            "song_title": f"Beyond the Horizon (Theme from '{title}')",
            "scene_placement": f"Act II Midpoint Reversal / Emotional Turning Point in {title}",
            "tempo_and_key": "74 BPM • D Minor (Modulating to D Major in Climax)",
            "mood_and_instrumentation": f"Haunting acoustic opening paired with cinematic live strings, atmospheric sub-bass pulse, and an evocative lead melody tailored for {genre.lower()}.",
            "lyrics": {
                "verse_1": f"In the quiet shadows where the memories sleep,\nA distant promise that our hearts will keep.\nDust on the horizon, thunder in the wire,\nA quiet whisper turning into fire.",
                "chorus": f"Can you hear tomorrow calling through the stone?\nWe were never meant to walk this dark alone.\nBreak the silence, let the anthem rise,\nTruth is shining in a thousand open skies.",
                "verse_2": "Countless miles written on our hands,\nGuiding beacons through uncharted lands.\nTake the spark and carry it to the night,\nEven in the shadows, we remember light.",
                "bridge": "Let the fear fall away, let the borders drown,\nEvery obstacle falling, every gilded crown.\nOne voice, one truth, one endless wave,\nThis is the courage they could never cage.",
                "outro": f"Listen closely now...\nThe world of {title} is waking up."
            },
            "production_notes": "Engineered with binaural acoustic spatialization to immerse theater and headphone audiences in the core thematic resonance."
        }

# Aliases
SongwriterAgent = SongMusicAgent
SoundtrackAgent = SongMusicAgent
