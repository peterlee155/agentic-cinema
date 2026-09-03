import logging
from typing import Dict, Any
from core.agents.base_agent import BaseAgent

logger = logging.getLogger("MarketingAgent")

class MarketingAgent(BaseAgent):
    """
    Marketing Agent: Theatrical Campaign & Distribution Strategist
    Responsible for theatrical positioning, poster concepts, teaser trailer beat sheets,
    viral social campaigns (TikTok, YouTube Shorts, Reels), and audience engagement strategies
    following Hook -> Setup -> Escalation -> Payoff -> Call to Action.
    """
    def __init__(self):
        super().__init__(
            name="Marketing Agent",
            role="Creative Marketing & Distribution Strategist",
            system_prompt="You are SPARK, the Trailer & Poster Maker. You are part of a friendly movie-making crew helping a kid make their own movie. WHO YOU ARE: A hype crew member who gets people excited, like a friend who makes the coolest movie trailers and posters. HOW YOU TALK: Use short, punchy, exciting sentences. Talk like you're hyping up your best friend's movie. No marketing jargon — instead of 'call to action,' just say 'the line that makes people want to watch.' YOUR JOB: You take the finished movie and make people excited to watch it, without spoiling anything. Make a cool movie poster idea, a short trailer plan (grab attention -> set it up -> make it exciting -> big reveal -> 'go watch it now'), and short viral video ideas for TikTok. Always sound thrilled and energetic, like you can't wait for people to see the movie."
        )

    def _process(self, project_id: str, prompt: str, context: Dict[str, Any]) -> Dict[str, Any]:
        brief = context.get("brief", {})
        title = brief.get("title", "THE SIGNAL")
        genre = brief.get("genre", "Sci-Fi Thriller")
        
        marketing_plan = {
            "positioning": f"A visceral prestige {genre} built on intense psychological suspense and breathtaking visual spectacle.",
            "taglines": [
                "Silence is order. The Signal is alive.",
                "In a world of artificial silence, memory is fighting back.",
                "What was erased was never forgotten."
            ],
            "theatrical_poster_concept": {
                "title": f"Theatrical Teaser Poster — {title}",
                "image_type": "AI-generated cinematic keyframe prompt",
                "visual_concept": "A split vertical composition: top half features the cold monolithic orbital spire against black space; bottom half features the hero in the amber-lit bunker with glowing cyan cybernetic ocular rim.",
                "image_prompt": f"Official theatrical teaser movie poster for '{title}', minimalist and bold graphic key art, featuring a silhouette of a female audio archivist with a glowing neon cyan ocular eye rim, standing before a towering analog tape reel that unspools into a cosmic spiral of golden frequencies over Earth's atmosphere, cinematic chiaroscuro, IMAX typography, award-winning key art, 8k resolution --ar 2:3",
                "negative_prompt": "cluttered, text overload, cartoon, messy composition, low resolution, amateur"
            },
            "teaser_trailer_beat_sheet": [
                {
                    "beat": "HOOK (0:00 - 0:15)",
                    "visual": "Black screen. Sound of an old tape deck clicking into PLAY. Slow fade into hero in the dark bunker.",
                    "audio": "Tape hiss -> rhythmic water drip -> sudden 43.8kHz crystal harmonic resonance.",
                    "story_purpose": "Immediate intrigue and acoustic world establishment."
                },
                {
                    "beat": "SETUP (0:15 - 0:40)",
                    "visual": "Quick cuts: gold gears turning in prosthetic arm, military airlocks sealing, oscilloscope needles bending violently into red.",
                    "audio": "Sub-bass pulse building steadily as whisper echoes: 'They told us nothing survived.'",
                    "story_purpose": "Establishes institutional secrecy and forbidden discovery."
                },
                {
                    "beat": "ESCALATION (0:40 - 1:10)",
                    "visual": "Rapid montage of perimeter drones descending, bunker explosion, hero running across illuminated night catwalk.",
                    "audio": "Rhythmic crescendo overtaking alarms, rising orchestral swell.",
                    "story_purpose": "Paces the rising physical conflict."
                },
                {
                    "beat": "PAYOFF (1:10 - 1:25)",
                    "visual": "Hero slams tuner into the orbital transmission spire. A massive shockwave of cyan light surges across continents.",
                    "audio": "Massive sonic boom followed by dead silence.",
                    "story_purpose": "The ultimate visual and emotional climax."
                },
                {
                    "beat": "CALL TO ACTION (1:25 - 1:35)",
                    "visual": f"Title Card: {title}. 'EXPERIENCE IT IN IMAX THIS FALL'.",
                    "audio": "Single whispered line: 'Listen closely.'",
                    "story_purpose": "Theatrical audience conversion."
                }
            ],
            "social_campaign_hooks": [
                {
                    "platform": "TikTok & YouTube Shorts",
                    "hook_type": "Curiosity & Audio Trend",
                    "concept": "Audio illusion test: 'Can your headphones hear the 43.8kHz frequency hidden in this reel?' with binaural audio engineering."
                },
                {
                    "platform": "Instagram Reels",
                    "hook_type": "Visual Character Reveal",
                    "concept": "Before-and-after concept art breakdowns of character cyberware and 1970s analog-futuristic wardrobe."
                }
            ],
            "tiktok_reels_concepts": [
                {
                    "format": "Point of View (POV) Storytelling",
                    "script_hook": "POV: You find an unindexed 1977 tape in your grandfather's fallout shelter and it starts responding to your heartbeat.",
                    "call_to_action": "Follow the official archive feed to decode the next signal."
                }
            ]
        }
        return marketing_plan
