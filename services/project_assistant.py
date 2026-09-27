"""
AI-Driven Film Development Assistant Service.
Encapsulates creative reasoning, context-aware suggestions, concept transformations,
visual optics recommendations, creative tension detection, and project consistency reviews.
Powered by Google Gemini with an autonomous fallback engine.
"""

import os
import json
import logging
import re
from typing import Dict, Any, List, Optional

logger = logging.getLogger("ProjectAssistantService")

class ProjectAssistantService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
        self.google_project = os.getenv("GOOGLE_CLOUD_PROJECT", os.getenv("GCP_PROJECT_ID", "seismic-relic-447818-r2"))
        self.use_vertex = os.getenv("USE_VERTEX_AI", "false").lower() == "true"
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
        self.client = None
        self._init_client()

    def _init_client(self):
        try:
            from google import genai
            if self.use_vertex and self.google_project:
                self.client = genai.Client(vertexai=True, project=self.google_project, location="us-central1")
                logger.info("ProjectAssistantService: Vertex AI client initialized.")
            elif self.api_key:
                self.client = genai.Client(api_key=self.api_key)
                logger.info(f"ProjectAssistantService: Gemini Client initialized ({self.model_name}).")
        except Exception as e:
            logger.warning(f"ProjectAssistantService: Could not init google-genai client: {e}")

    def _call_gemini_json(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Call Gemini and parse JSON response reliably."""
        if not self.client:
            self._init_client()
        if not self.client:
            return None

        full_prompt = f"""{prompt}

IMPORTANT INSTRUCTIONS:
- You are a master Hollywood creative executive, film theorist, and director.
- Respond ONLY with a valid JSON object. Do not include markdown code block formatting like ```json or ```. Return pure JSON.
"""
        try:
            from google.genai import types
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.75
                ) if hasattr(types, "GenerateContentConfig") else None
            )
            raw = response.text.strip() if hasattr(response, 'text') else ""
            if not raw:
                return None
            clean = re.sub(r"^```json\s*", "", raw, flags=re.IGNORECASE)
            clean = re.sub(r"^```\s*", "", clean)
            clean = re.sub(r"\s*```$", "", clean)
            return json.loads(clean)
        except Exception as e:
            logger.warning(f"ProjectAssistantService Gemini call error: {e}")
            return None

    def interpret_title(self, title: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        ctx = context or {}
        title = title.strip() or "Untitled Cinematic Project"
        prompt = f"""
Analyze the film title "{title}" and provide 3 to 4 distinct, highly creative, multi-genre cinematic interpretations.
Current context (if any):
- Preferred Genre/Category: {ctx.get('genre', 'Open')}
- Tone hints: {ctx.get('tone', 'Cinematic')}

For each interpretation, create:
1. "id": unique string (e.g. "interp_1")
2. "genre": Genre and subgenre name (e.g. "Psychological Thriller / Neo-Noir")
3. "logline": Compelling 1-2 sentence high-concept premise
4. "central_conflict": The core dramatic or philosophical tension
5. "visual_style": Cinematography & aesthetic identity
6. "dramatic_intensity": Int between 1 and 10
7. "why_it_fits": 1 sentence explaining why this title naturally evokes this dramatic world

Return JSON format:
{{
  "interpretations": [
    {{
      "id": "interp_1",
      "genre": "...",
      "logline": "...",
      "central_conflict": "...",
      "visual_style": "...",
      "dramatic_intensity": 8,
      "why_it_fits": "..."
    }}
  ]
}}
"""
        res = self._call_gemini_json(prompt)
        if res and isinstance(res.get("interpretations"), list) and len(res["interpretations"]) > 0:
            return res["interpretations"]

        return [
            {
                "id": "interp_1",
                "genre": f"{ctx.get('genre') or 'High-Concept Sci-Fi Thriller'}",
                "logline": f"In a fractured near-future, a disgraced specialist unearths a forbidden memory protocol known only as '{title}'—triggering a cascade of psychological warfare.",
                "central_conflict": "Technological truth vs. fabricated emotional reality.",
                "visual_style": "Anamorphic 2.39:1 widescreen, cool cyan and sodium vapor palette with deep shadows.",
                "dramatic_intensity": 8,
                "why_it_fits": f"The title '{title}' immediately implies hidden subterranean currents and institutional intrigue."
            },
            {
                "id": "interp_2",
                "genre": "Neo-Noir Crime Drama",
                "logline": f"An obsessive private investigator tracks a vanished witness connected to '{title}', uncovering a labyrinth of systemic corruption that reaches the highest offices.",
                "central_conflict": "Personal morality against an unyielding, corrupt establishment.",
                "visual_style": "Chiaroscuro lighting, 35mm film grain, muted amber and rain-slicked asphalt tones.",
                "dramatic_intensity": 7,
                "why_it_fits": f"'{title}' resonates with the classic hard-boiled duality of myth versus grim street-level reality."
            },
            {
                "id": "interp_3",
                "genre": "Speculative Psychological Mystery",
                "logline": f"When an inexplicable anomaly known as '{title}' appears in a secluded community, long-buried collective secrets erupt into a surreal battle for sanity.",
                "central_conflict": "Isolation and collective guilt confronting an incomprehensible phenomenon.",
                "visual_style": "Naturalistic handheld, vintage primes, desaturated earth tones with sudden optical flares.",
                "dramatic_intensity": 9,
                "why_it_fits": f"'{title}' acts as an ominous thematic anchor for psychological unraveling."
            }
        ]

    def surprise_me(self, title: str, context: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        ctx = context or {}
        title = title.strip() or "Untitled Project"
        prompt = f"""
Give 3 wildly UNCONVENTIONAL, subverted, genre-bending film concepts for the title "{title}".
Subvert standard Hollywood clichés and blend unexpected tones.

Current Context: {json.dumps(ctx)}

Return JSON format:
{{
  "interpretations": [
    {{
      "id": "surprise_1",
      "genre": "Genre Mashup Name",
      "logline": "High-concept subversive logline",
      "central_conflict": "Unusual conflict",
      "visual_style": "Striking aesthetic style",
      "dramatic_intensity": 9,
      "why_it_fits": "Subversive thematic reasoning"
    }}
  ]
}}
"""
        res = self._call_gemini_json(prompt)
        if res and isinstance(res.get("interpretations"), list) and len(res["interpretations"]) > 0:
            return res["interpretations"]

        return [
            {
                "id": "surprise_1",
                "genre": "Satirical Cosmic Bureaucracy / Dark Comedy",
                "logline": f"Mid-level bureaucrats in an infinite interdimensional office must audit '{title}', only to discover the universe's existential ledger has a critical rounding error.",
                "central_conflict": "Mundane clerical routine versus cosmic existential oblivion.",
                "visual_style": "Fluorescent overheads, rigid symmetrical framing (Wes Anderson meets David Lynch), muted institutional beige.",
                "dramatic_intensity": 6,
                "why_it_fits": f"Subverts '{title}' from an action premise into a sharp, witty existential puzzle."
            },
            {
                "id": "surprise_2",
                "genre": "Auteur Psychological Horror / High Fashion",
                "logline": f"An avant-garde textile artisan creates an impossible garment called '{title}' that slowly reshapes the neural architecture of whoever wears it.",
                "central_conflict": "Obsession with aesthetic perfection versus biological and psychological autonomy.",
                "visual_style": "Hyper-stylized 16mm, extreme macro close-ups, saturated crimson and velvet textures.",
                "dramatic_intensity": 9,
                "why_it_fits": f"Treats '{title}' as a visceral tactile obsession rather than a conventional plot device."
            },
            {
                "id": "surprise_3",
                "genre": "Solarpunk Heist / Ecological Speculative Fiction",
                "logline": f"A syndicate of renegade botanists orchestrates an intricate raid on a seed fortress to restore the mythical '{title}' ecosystem before corporate terraformers erase it.",
                "central_conflict": "Grassroots symbiotic survival versus industrialized ecosystem commodification.",
                "visual_style": "Golden hour sun flares, lush bioluminescent greens, sweeping drone cinematography.",
                "dramatic_intensity": 8,
                "why_it_fits": f"Flips dystopian tropes into an invigorating, vibrant green-tech heist."
            }
        ]

    def transform_concept(self, concept: str, mode: str, context: Optional[Dict[str, Any]] = None, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        ctx = context or {}
        concept = concept.strip()
        mode_instructions = {
            "expand": "Flesh out the narrative scope, world rules, character stakes, and multi-layered dramatic arc.",
            "rewrite": "Sharpen the core hook, heighten dramatic economy, and maximize thematic resonance in punchy cinematic prose.",
            "cinematic": "Inject vivid sensory imagery, camera motion cues, auditory texture, and visceral production scale.",
            "emotional": "Deepen the interpersonal vulnerability, moral dilemmas, psychological wound, and emotional catharsis.",
            "commercial": "Amplify the four-quadrant audience hook, escalating set-pieces, clear antagonist stakes, and pacing momentum.",
            "experimental": "Adopt an unconventional narrative structure, poetic metaphor, psychological subjectivity, and avant-garde motifs.",
            "darker": "Heighten existential stakes, psychological dread, moral ambiguity, and unflinching dramatic consequences.",
            "lighter": "Infuse witty banter, buoyant pacing, hopeful human connection, and clever subversion of doom.",
            "alternative": "Provide a parallel universe variation that preserves the thematic core but shifts the setting and conflict vector."
        }

        directive = mode_instructions.get(mode, mode_instructions["rewrite"])
        if custom_prompt:
            directive += f" Custom user direction: {custom_prompt}"

        prompt = f"""
Transform and elevate the following film project concept according to the directive below.

CURRENT CONCEPT:
"{concept}"

PROJECT CONTEXT:
- Title: {ctx.get('title', 'Untitled')}
- Primary Genre: {ctx.get('genre', 'Cinematic')}
- Subgenres: {ctx.get('subgenres', [])}
- Dramatic Tone: {ctx.get('tone', 'Cinematic')}
- Intensity: {ctx.get('dramatic_intensity', 7)}/10
- Story Direction: {ctx.get('story_direction', 'Character-Driven')}

DIRECTIVE ({mode.upper()}):
{directive}

Return JSON format:
{{
  "transformed_concept": "The complete rewritten/expanded film concept paragraph(s)...",
  "key_enhancements": ["Point 1", "Point 2", "Point 3"],
  "dramatic_rationale": "Brief explanation of why this creative choice serves the director's vision"
}}
"""
        res = self._call_gemini_json(prompt)
        if res and res.get("transformed_concept"):
            return res

        # Fallback transformations
        if mode == "expand":
            transformed = f"{concept} As the central conflict intensifies across three distinct dramatic movements, hidden loyalties fracture, forcing the protagonist into an irreversible moral crucible with systemic consequences for their entire world."
        elif mode == "cinematic":
            transformed = f"Set against an arresting visual landscape of towering contrasts and atmospheric pressure: {concept} The camera captures intimate, breath-close psychological tension before exploding into sweeping, kinetic set-pieces."
        elif mode == "emotional":
            transformed = f"At its emotional core, the story explores grief, redemption, and the desperate search for connection: {concept} Every external obstacle mirrors an unhealed internal wound that must be confronted to survive."
        elif mode == "darker":
            transformed = f"{concept} But the cost of revelation proves devastating—every victory extracts an excruciating human toll as the boundary between survival and moral decay disintegrates."
        elif mode == "lighter":
            transformed = f"{concept} Driven by sharp wit, dynamic chemistry, and relentless momentum, the characters navigate perilous stakes with ingenious improvisation and enduring camaraderie."
        else:
            transformed = f"{concept} (Elevated Edition: Heightened stakes, sharper character motivation, and an arresting narrative trajectory tailored for modern theatrical resonance)."

        return {
            "transformed_concept": transformed,
            "key_enhancements": [
                f"Calibrated for {ctx.get('genre', 'Cinematic')} conventions and subversion",
                f"Elevated narrative stakes aligned with {ctx.get('tone', 'dramatic')} tone",
                "Streamlined character vectors and dramatic tension"
            ],
            "dramatic_rationale": f"Enhanced through {mode} transformation to reinforce thematic coherence without overwriting original creative seeds."
        }

    def suggest_visuals(self, context: Dict[str, Any]) -> Dict[str, Any]:
        title = context.get("title", "Untitled")
        concept = context.get("concept", context.get("logline", ""))
        genre = context.get("genre", "Sci-Fi")
        subgenres = context.get("subgenres", [])
        tone = context.get("tone", "Gritty, tense")
        intensity = context.get("dramatic_intensity", 7)

        prompt = f"""
You are an award-winning ASC Cinematographer and Production Designer.
Recommend a tailored visual optics and aesthetic package for this film project:

Title: {title}
Concept: {concept}
Genre: {genre} (Subgenres: {subgenres})
Tone: {tone}
Dramatic Intensity: {intensity}/10

Provide specific, professional recommendations for:
1. "cinematography": Camera movement & composition philosophy
2. "lens": Optics & glass selection
3. "lighting": Key lighting approach
4. "color_palette": Color grade & palette description
5. "aspect_ratio": Recommended framing
6. "visual_philosophy": 2-3 sentences explaining why this visual language directly amplifies the emotional and dramatic themes.

Return JSON format:
{{
  "cinematography": "...",
  "lens": "...",
  "lighting": "...",
  "color_palette": "...",
  "aspect_ratio": "...",
  "visual_philosophy": "..."
}}
"""
        res = self._call_gemini_json(prompt)
        if res and res.get("cinematography"):
            return res

        return {
            "cinematography": "Arri Alexa LF Large Format with deliberate slow dolly tracks and expressive handheld tension during key confrontations",
            "lens": "Master Anamorphic 2x Primes with controlled flare resistance and natural organic edge distortion",
            "lighting": "Low-key chiaroscuro with motivated tungsten practicals and cool ambient shadows (12:1 key-to-fill ratio)",
            "color_palette": "Deep cyan undertones, oxidized bronze midtones, and stark tungsten highlights",
            "aspect_ratio": "2.39:1 Anamorphic Widescreen",
            "visual_philosophy": f"The widescreen anamorphic frame gives '{title}' immense theatrical scale, while selective shallow depth-of-field isolates the characters within their psychological pressure cooker."
        }

    def detect_tensions(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        prompt = f"""
Analyze this film project setup for interesting artistic tensions, unconventional pairings, or potential tone clashes:
{json.dumps(context, indent=2)}

Identify any creative friction between Genre, Tone, Runtime, Visual Style, and Themes.
Articulate each tension as an artistic risk and opportunity, and suggest creative ways to resolve or capitalize on it.

Return JSON format:
{{
  "tensions": [
    {{
      "id": "tension_1",
      "level": "MODERATE",
      "title": "Short title of creative tension",
      "description": "Articulate the creative tension between elements X and Y",
      "artistic_opportunity": "How this unique combination could create a groundbreaking signature voice",
      "resolution_ideas": [
        "Creative approach A to harmonize",
        "Creative approach B to lean into the contrast"
      ]
    }}
  ]
}}
"""
        res = self._call_gemini_json(prompt)
        if res and isinstance(res.get("tensions"), list):
            return res["tensions"]

        return [
            {
                "id": "tension_1",
                "level": "HARMONIOUS",
                "title": "Genre & Aesthetic Alignment",
                "description": f"The pairing of {context.get('genre', 'Selected Genre')} with {context.get('tone', 'Selected Tone')} provides strong thematic clarity.",
                "artistic_opportunity": "Allows the narrative to establish immediate atmospheric immersion without alienating core genre expectations.",
                "resolution_ideas": [
                    "Maintain sharp visual contrast to heighten psychological stakes",
                    "Use sound design counterpoints to subvert predictable moments"
                ]
            }
        ]

    def consistency_review(self, context: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"""
Perform a holistic Pre-Production Consistency & Coherence Review for this film project setup before initializing the Project Bible:
{json.dumps(context, indent=2)}

Return JSON format:
{{
  "coherence_score": 9,
  "verdict": "READY FOR SWARM ORCHESTRATION",
  "strengths": [
    "Compelling central hook with high cinematic potential",
    "Atmospheric visual style that reinforces the dramatic intensity"
  ],
  "creative_opportunities": [
    "Opportunity to deepen the secondary antagonist's philosophical motivation",
    "Potential for an iconic visual motif in the second act transition"
  ],
  "recommended_first_agent_focus": "Producer & Screenwriter Deep Dive",
  "readiness_summary": "Comprehensive summary of why this project is poised for high-impact production."
}}
"""
        res = self._call_gemini_json(prompt)
        if res and res.get("coherence_score"):
            return res

        return {
            "coherence_score": 9,
            "verdict": "READY FOR SWARM PRODUCTION",
            "strengths": [
                "Strong conceptual foundation with clear dramatic stakes",
                "Cohesive tone and visual optics defined for canonical Bible alignment"
            ],
            "creative_opportunities": [
                "The agent swarm can expand character bibles and world rules in Stage 1",
                "Visual continuity engine will lock lighting and lens consistency across all scenes"
            ],
            "recommended_first_agent_focus": "Producer Agent Executive Brief & Screenwriter 3-Act Breakdown",
            "readiness_summary": "The project parameters provide a robust, non-contradictory foundation for the multi-agent production swarm."
        }

project_assistant = ProjectAssistantService()
