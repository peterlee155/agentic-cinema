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
        title = brief.get("title") or context.get("title") or "UNTITLED FILM"
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

        title = brief.get("title") or context.get("title") or "UNTITLED FEATURE"
        logline = brief.get("logline") or context.get("logline") or f"A cinematic adventure in {title}."
        clean_tag = "".join(w.capitalize() for w in title.split() if w.isalnum())

        # Dynamic Social Campaign
        return {
            "video_teasers_veo": [
                {
                    "title": f"{title} - Official Announcement Teaser",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": f"Cinematic title reveal and hook: {logline[:80]}...",
                    "veo_prompt": f"Google Veo prompt: 9:16 vertical cinematography, dramatic high-tension cinematic lighting introducing the world of {title}, 24fps hyperrealistic physical simulation",
                    "audio_sync": "Sub-bass riser syncing with the dramatic title reveal beat",
                    "hashtags": [f"#{clean_tag}", "#AgenticCinema", "#MovieTeaser", "#VeoVideo"]
                },
                {
                    "title": f"The World of {title}",
                    "format": "9:16 Vertical Video (15s)",
                    "hook": f"What happens when the rules of {title} are pushed to the extreme?",
                    "veo_prompt": f"Google Veo prompt: 9:16 vertical framing, slow atmospheric tracking shot capturing the high-contrast aesthetic and environment of {title}, 24fps",
                    "audio_sync": "Eerie atmospheric soundscape with ambient drone",
                    "hashtags": [f"#{clean_tag}", "#FilmTok", "#Cinematography", "#MovieTok"]
                }
            ],
            "posters_imagen_3": [
                {
                    "poster_type": "Official Theatrical Teaser Key Art",
                    "title_text": title.upper(),
                    "tagline": f"In {title}, every second defines the future.",
                    "imagen_prompt": f"Google Imagen 3 prompt: High-impact 2:3 vertical theatrical movie poster for '{title}', moody chiaroscuro lighting, IMAX composition, cinematic atmospheric depth, 8K masterpiece",
                    "color_palette": "#0F172A (Midnight), #E2E8F0 (Silver), #F59E0B (Accent Amber)"
                },
                {
                    "poster_type": "Character Teaser Key Art",
                    "title_text": f"{title.upper()} - THE JOURNEY",
                    "tagline": "The path forward begins with a single choice.",
                    "imagen_prompt": f"Google Imagen 3 prompt: 2:3 vertical character teaser poster, intense dramatic portrait aligned with the themes of '{title}', textured lighting, 8K photorealism",
                    "color_palette": "#1E293B (Slate), #0284C7 (Cyan), #000000 (Black)"
                }
            ],
            "tiktok_reels_shorts": [
                {
                    "platform": "TikTok / Instagram Reels",
                    "format": "9:16 Vertical Video (35s)",
                    "type": "Mystery Hook / World Rule Explanation",
                    "title": f"The Story Behind {title}",
                    "hook": f"Here is the high-stakes premise of {title} in 30 seconds.",
                    "script": f"Dynamic visual cuts highlighting the narrative tension of {title}. Voiceover explaining: '{logline}'",
                    "cta": f"Would you survive the world of {title}? Comment below.",
                    "hashtags": [f"#{clean_tag}", "#AgenticCinema", "#FilmLovers", "#MovieTrailer"]
                },
                {
                    "platform": "YouTube Shorts",
                    "format": "9:16 Vertical Video (45s)",
                    "type": "Behind-the-Scenes Filmmaking Breakdown",
                    "title": f"How We Directed {title} with AI",
                    "hook": f"How 21 specialized autonomous AI agents built {title}.",
                    "script": f"Behind-the-scenes walkthrough detailing the multi-agent production workflow behind '{title}'.",
                    "cta": "Explore the full production bible on Agentic Cinema Studio.",
                    "hashtags": ["#AIInFilm", "#DirectingTips", "#IndieCinema", f"#{clean_tag}"]
                }
            ],
            "meme_concepts": [
                {
                    "concept": f"Anticipating the plot twist in {title}.",
                    "caption": f"When you realize what is actually happening in {title}."
                }
            ],
            "audience_polls": [
                {
                    "question": f"If you entered the world of {title}, what would be your first move?",
                    "options": [
                        "Trust the team and follow the mission",
                        "Investigate the hidden mysteries alone",
                        "Form an alliance with unexpected allies"
                    ]
                }
            ]
        }
