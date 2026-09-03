import logging
from typing import Dict, Any, List
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("SocialAgent")

class SocialAgent(BaseAgent):
    """
    Social & Viral Marketing Agent
    Transforms completed production packages into high-engagement promotional content.
    Target Platforms: TikTok, Instagram Reels, YouTube Shorts.
    Generates:
    - Movie Teasers
    - Character Reveals
    - Mystery Hooks
    - POV Videos (First-person perspective immersion)
    - Action Clips
    - Emotional Clips
    - Meme Concepts (Dark humor / relatable survival tropes)
    - Behind-the-Scenes (BTS) Directorial Breakdowns
    - Audience Interaction & Polls
    CRITICAL RULE: This agent must NOT alter established movie canon.
    """
    def __init__(self):
        super().__init__(
            name="Social & Viral",
            role="Head of Social Engagement & Viral Distribution",
            system_prompt="""You are a viral social media strategist specializing in film marketing.
Your goal is to turn movie production packages into viral campaigns across TikTok, Instagram Reels, and YouTube Shorts.
Create engaging concepts: movie teasers, character reveals, mystery hooks, POV videos, action clips, meme concepts, BTS breakdowns, and audience polls.
STRICT RULE: Never alter movie canon or established lore. Every concept must be grounded in the approved film bible."""
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        brief = context.get("brief", {})
        title = brief.get("title", "THE LAST SPELL")
        world_rules = context.get("worldRules", [])

        schema = """{
  "video_teasers_veo": [
    {
      "title": "Teaser Title",
      "format": "9:16 Vertical Video (15s)",
      "hook": "0-3s visual & audio hook",
      "veo_prompt": "Google Veo prompt: Fast-paced dynamic camera tracking in 9:16 vertical orientation, high-tension cinematic lighting, 24fps physical simulation",
      "audio_sync": "Heavy bass drop with ticking clock metronome",
      "hashtags": ["#FilmTeaser", "#MovieTok"]
    }
  ],
  "posters_imagen_3": [
    {
      "poster_type": "Teaser Key Art / Character Poster",
      "title_text": "Movie Title or Character Name",
      "tagline": "Compelling 1-sentence movie tagline",
      "imagen_prompt": "Google Imagen 3 specification: High-impact 2:3 vertical theatrical key art poster, moody chiaroscuro lighting, textured typography space, 8K hyperdetailed",
      "color_palette": "#Color1, #Color2"
    }
  ],
  "tiktok_reels_shorts": [
    {
      "platform": "TikTok",
      "format": "9:16 Vertical Video (30s)",
      "type": "Mystery Hook / Teaser / POV",
      "title": "Hook title",
      "hook": "0-3s visual & text hook",
      "script": "Full audio/visual script",
      "cta": "Call to action",
      "hashtags": ["#Hashtag"]
    }
  ],
  "meme_concepts": [
    {"concept": "Dark humor or relatable survival trope", "caption": "Relatable punchy caption"}
  ],
  "audience_polls": [
    {"question": "High-stakes moral dilemma question", "options": ["Option A", "Option B"]}
  ]
}"""

        gemini_prompt = f"Design an exhaustive, high-impact social viral campaign and key art suite for:\nTitle: {title}\nLogline: {brief.get('logline')}\nWorld Rules: {str(world_rules)[:800]}"
        raw = self.call_gemini(gemini_prompt, schema)
        parsed = self.parse_gemini_json(raw)
        if parsed and ("tiktok_reels_shorts" in parsed or "video_teasers_veo" in parsed):
            return parsed

        # Default Social Campaign
        return {
            "video_teasers_veo": [
                {
                    "title": "The 4-Hour Countdown",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": "Extreme macro zoom into human forearm as glowing amber glyph ignites into skin: 04:00:00.",
                    "veo_prompt": "Google Veo prompt: 9:16 vertical cinematography, macro extreme close-up pushing in on human arm, amber runic numerals sizzling into skin with rising vapor, 24fps high-speed camera move pulling back to reveal hooded scout standing before rainstorm and giant shimmering violet forcefield dome, hyperrealistic cinematic motion, physical particle simulation",
                    "audio_sync": "40Hz sub-bass drop syncing to the ticking metronome of the clock",
                    "hashtags": ["#TheLastSpell", "#SciFiThriller", "#MovieTeaser", "#VeoVideo"]
                },
                {
                    "title": "The Smiling Mimic",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": "A smiling gentleman in a tweed jacket stands motionless in the rain under an umbrella.",
                    "veo_prompt": "Google Veo prompt: 9:16 vertical framing, slow eerie dolly forward toward an unnervingly still man in vintage tweed holding an umbrella in torrential rain, neon yellow sodium light reflecting off wet asphalt, lightning strike reveals pitch-black dilated pupils, cinematic horror film motion, 24fps",
                    "audio_sync": "Creepy polite whistle echoing over distorted ambient rain",
                    "hashtags": ["#PsychologicalHorror", "#Mimic", "#ShortFilm", "#MovieTok"]
                }
            ],
            "posters_imagen_3": [
                {
                    "poster_type": "Official Theatrical Teaser Key Art",
                    "title_text": "THE LAST SPELL",
                    "tagline": "The barrier is failing. The countdown begins.",
                    "imagen_prompt": "Google Imagen 3 prompt: High-impact 2:3 vertical theatrical movie poster, wide angle low perspective of a solitary weathered scout in a charcoal duster standing on wet granite steps looking up at a colossal glowing violet magical forcefield dome protecting a gothic cathedral, heavy rainstorm, ominous silhouettes of normal-looking crowds staring from the dark mist, dramatic IMAX typography space, rich cinematic lighting, 8K masterpiece",
                    "color_palette": "#1E1B4B (Deep Violet), #D97706 (Amber Rune), #0F172A (Midnight Slate)"
                },
                {
                    "poster_type": "Character Teaser Poster: The Infiltrator",
                    "title_text": "ELIAS: THE MIMIC",
                    "tagline": "They don't growl. They ask about your family.",
                    "imagen_prompt": "Google Imagen 3 prompt: 2:3 vertical character teaser poster, extreme close-up portrait of a sharp-dressed gentleman with slicked hair holding an umbrella in the rain, polite warm smile contrasting with dead soulless eyes, split-lighting chiaroscuro with warm sodium yellow on one side and cold void black on the other, atmospheric film grain, 8K photorealism",
                    "color_palette": "#78350F (Rust), #F59E0B (Sodium), #000000 (Void)"
                }
            ],
            "tiktok_reels_shorts": [
                {
                    "platform": "TikTok / Instagram Reels",
                    "format": "9:16 Vertical Video (38s)",
                    "type": "Mystery Hook / World Rule Explanation",
                    "title": "The Countdown Spell Rule Explained",
                    "hook": "What if zombies didn't look like zombies... and your survival had a timer seared into your skin?",
                    "script": "Close-up on glowing amber forearm glyph counting down rapidly. Voiceover: 'Rule number one: they don't limp. They don't scream. They wear tweed blazers and ask how your morning was. Rule number two: you have four hours before your smell changes. When that clock hits zero... you are dinner.'",
                    "cta": "Would you survive outside the barrier? Drop your survival strategy below.",
                    "hashtags": ["#TheLastSpell", "#AgenticCinema", "#SciFiHorror", "#ZombieApocalypse", "#MovieTrailer"]
                },
                {
                    "platform": "YouTube Shorts",
                    "format": "9:16 Vertical Video (45s)",
                    "type": "Behind-the-Scenes Director Breakdown",
                    "title": "How We Made the Mimic Look Terrifying Without CGI",
                    "hook": "Why smiling characters are scarier than rotting monsters.",
                    "script": "Split-screen comparison: Top shows the director's 35mm anamorphic blocking notes; Bottom shows actor Elias holding an unnerving, unblinking smile under the rain as water drips off his nose.",
                    "cta": "Explore the full production package built by our AI team at Agentic Cinema Studio.",
                    "hashtags": ["#FilmmakersOfTikTok", "#DirectingTips", "#AIInFilm", "#IndieCinema", "#Cinematography"]
                },
                {
                    "platform": "TikTok / Instagram Reels",
                    "format": "9:16 Vertical Video (25s)",
                    "type": "POV Survival Video",
                    "title": "POV: Your Countdown Spell Has 10 Seconds Left",
                    "hook": "POV: You hear polite whistling down the dark subway tunnel and check your arm.",
                    "script": "First-person camera sprinting through shallow black water. Wrist chronometer flashes red: 00:00:09... 00:00:08. Shadows step out from behind concrete pillars. You slam against the cathedral blast doors.",
                    "cta": "Can you hold your breath until the airlock cycles?",
                    "hashtags": ["#POVHorror", "#SurvivalThriller", "#TheLastSpell", "#ShortFilm"]
                }
            ],
            "meme_concepts": [
                {
                    "concept": "Me checking my phone battery at 1% vs. Kaelen checking his forearm with 60 seconds left on his protection spell.",
                    "caption": "Same panic, different stakes. ⏳😭"
                },
                {
                    "concept": "Elias asking how my day was with a perfectly calm face while waiting for my spell to expire.",
                    "caption": "Customer service workers dealing with Monday morning emails."
                }
            ],
            "audience_polls": [
                {
                    "question": "If you had a 4-hour countdown spell to leave the sanctuary, would you:",
                    "options": [
                        "Scavenge food & medical supplies",
                        "Search for the missing Keystone crystals",
                        "Refuse to leave the Inner Cathedral"
                    ]
                }
            ]
        }
