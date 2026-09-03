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
        title = brief.get("title", "THE SIGNAL")
        
        return {
            "song_title": f"Echoes in the 44th (Theme from '{title}')",
            "scene_placement": "Act II Midpoint Reversal / The Sacrifice of the Transmission Tower",
            "tempo_and_key": "72 BPM • D Minor (Transitioning to D Major in Climax)",
            "mood_and_instrumentation": "Haunting acoustic cello opening paired with warm vintage tape hiss, gradually surging with an analog modular synthesizer sub-bass pulse, cinematic live strings, and a soaring emotional female vocal melody.",
            "lyrics": {
                "verse_1": "In the copper silence where the memories sleep,\nA buried frequency the shadows couldn't keep.\nDust on the needle, thunder in the wire,\nA quiet whisper turning into fire.",
                "chorus": "Can you hear the signal calling through the stone?\nWe were never meant to walk this dark alone.\nBreak the dampener, let the anthem rise,\nTruth is shining in a thousand open skies.",
                "verse_2": "Thirty years of exile written on his hands,\nGold gears spinning in the forgotten sands.\nTake the spark and carry it to the night,\nEven in the vacuum, we remember light.",
                "bridge": "Let the static fall away, let the filters drown,\nEvery tower falling, every gilded crown.\nOne voice, one truth, one endless wave,\nThis is the soul they could never cage.",
                "outro": "Listen closely now...\nThe world is waking up."
            },
            "production_notes": "Engineered with binaural acoustic spatialization to immerse theater and headphone audiences in the core 44 kHz harmonic resonance."
        }

# Alias
SongwriterAgent = SongMusicAgent
