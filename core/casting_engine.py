import re, logging, json, os
from typing import Dict, Any, List, Optional

logger = logging.getLogger("CastingEngine")

class CastingEngine:
    """
    Casting Engine: Resolves natural language performer assignments and keeps
    fictional character identities separate from performer labels.
    """

    @staticmethod
    def parse_casting_intent(user_message: str, characters: List[Dict[str, Any]]) -> Dict[str, Any]:
        text = user_message.strip()
        text_lower = text.lower()

        casting_keywords = ["actor", "actress", "plays", "playing", "villain", "cast", "performer", "role", "lead"]
        if not any(k in text_lower for k in casting_keywords):
            return {"isCastingRequest": False}

        # 1. Pattern: "Change <character>'s actor from <old> to <new>" or "Change <character> actor to <new>"
        change_match = re.search(r"change\s+([A-Za-z0-9\s]+?)(?:'s)?\s+actor\s+(?:from\s+[A-Za-z0-9\s]+\s+)?to\s+([A-Za-z0-9\s]+)", text, re.IGNORECASE)
        if change_match:
            target_char = change_match.group(1).strip().strip(".,")
            new_performer = change_match.group(2).strip().strip(".,")
            matched_char = CastingEngine._match_character(target_char, characters)
            if matched_char:
                return {
                    "isCastingRequest": True,
                    "action": "change",
                    "characterName": matched_char.get("name"),
                    "performerName": new_performer,
                    "roleType": matched_char.get("role", "Lead Actor"),
                    "confirmation": f"CAST UPDATED\n{matched_char.get('name')}\nActor updated → {new_performer}"
                }

        # 2. Pattern: "<performer> plays <character>" / "<performer> is playing <character>" / "<performer> will play <character>"
        plays_match = re.search(r"([A-Za-z0-9\s]+?)\s+(?:plays|is\s+playing|will\s+play)\s+([A-Za-z0-9\s]+)", text, re.IGNORECASE)
        if plays_match:
            performer = plays_match.group(1).strip().strip(".,")
            target_char = plays_match.group(2).strip().strip(".,")
            matched_char = CastingEngine._match_character(target_char, characters)
            if matched_char:
                return {
                    "isCastingRequest": True,
                    "action": "assign",
                    "characterName": matched_char.get("name"),
                    "performerName": performer,
                    "roleType": matched_char.get("role", "Lead Actor"),
                    "confirmation": f"CAST UPDATED\n{performer} → {matched_char.get('name')} ({matched_char.get('role', 'Lead Actor')})"
                }

        # 3. Pattern: "My [role] actor is <performer>" / "My actor is <performer>"
        my_actor_match = re.search(r"my\s+(?:(?:main|lead|female|male|supporting)\s+)?actor\s+is\s+([A-Za-z0-9\s]+)", text, re.IGNORECASE)
        if my_actor_match:
            performer = my_actor_match.group(1).strip().strip(".,")
            matched_char = CastingEngine._match_character("lead", characters)
            if matched_char:
                return {
                    "isCastingRequest": True,
                    "action": "assign",
                    "characterName": matched_char.get("name"),
                    "performerName": performer,
                    "roleType": matched_char.get("role", "Lead Actor"),
                    "confirmation": f"CAST UPDATED\n{performer} → {matched_char.get('name')} ({matched_char.get('role', 'Lead Actor')})"
                }

        # 4. Pattern: "<performer> is the villain" / "<performer> plays the antagonist"
        villain_match = re.search(r"([A-Za-z0-9\s]+?)\s+is\s+(?:the\s+)?(?:villain|antagonist)", text, re.IGNORECASE)
        if villain_match:
            performer = villain_match.group(1).strip().strip(".,")
            matched_char = CastingEngine._match_character("villain", characters)
            if matched_char:
                return {
                    "isCastingRequest": True,
                    "action": "assign",
                    "characterName": matched_char.get("name"),
                    "performerName": performer,
                    "roleType": matched_char.get("role", "Antagonist"),
                    "confirmation": f"CAST UPDATED\n{performer} → {matched_char.get('name')} ({matched_char.get('role', 'Antagonist')})"
                }

        # 5. Gemini LLM fallback
        try:
            from google import genai
            api_key = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
            if api_key:
                client = genai.Client(api_key=api_key)
                char_list_str = ", ".join([f"{c.get('name')} ({c.get('role', 'Character')})" for c in characters])
                prompt = f"""You are the Executive Casting Director of Agentic Cinema Studio.
Existing Characters: [{char_list_str}]

User Casting Request: "{user_message}"

Extract casting assignment:
JSON Schema:
{{
  "isCastingRequest": true,
  "performerName": "string",
  "characterName": "string",
  "roleType": "string",
  "action": "assign"
}}"""
                res = client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=prompt
                )
                if res and res.text:
                    match = re.search(r"\{.*\}", res.text, re.DOTALL)
                    if match:
                        parsed = json.loads(match.group())
                        if parsed.get("isCastingRequest") and parsed.get("performerName"):
                            char_name = parsed.get("characterName", "")
                            matched = CastingEngine._match_character(char_name, characters)
                            final_char = matched.get("name") if matched else (char_name or "Kaelen Vance")
                            role = matched.get("role") if matched else (parsed.get("roleType") or "Lead Actor")
                            
                            return {
                                "isCastingRequest": True,
                                "action": parsed.get("action", "assign"),
                                "characterName": final_char,
                                "performerName": parsed.get("performerName").strip().strip(".,"),
                                "roleType": role,
                                "confirmation": f"CAST UPDATED\n{parsed.get('performerName')} → {final_char} ({role})"
                            }
        except Exception as e:
            logger.warning(f"Casting LLM notice: {e}")

        return {"isCastingRequest": False}

    @staticmethod
    def _match_character(query: str, characters: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        if not query or not characters:
            return None
        q = query.lower().strip().strip(".,")
        for c in characters:
            cname = c.get("name", "").lower()
            if q in cname or cname in q:
                return c
        for c in characters:
            role = c.get("role", "").lower()
            if ("lead" in q or "protagonist" in q) and ("lead" in role or "protagonist" in role):
                return c
            if ("villain" in q or "antagonist" in q) and ("villain" in role or "antagonist" in role):
                return c
            if ("female" in q or "actress" in q or "supporting" in q) and ("female" in role or "supporting" in role):
                return c
        return characters[0] if characters else None

casting_engine = CastingEngine()
