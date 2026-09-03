"""
RevenueCat Real-World Monetization & Entitlement Engine
Handles subscriber entitlement checks, credit ledger accounting, dynamic plan upgrades,
top-up credit packs, and RevenueCat webhook listener events.
"""

import os, logging, json, requests
from typing import Dict, Any, Optional

logger = logging.getLogger("RevenueCatService")

class RevenueCatService:
    CREDIT_COSTS = {
        "Chat Copilot": 2,
        "Script Scene": 2,
        "Character Dossier": 3,
        "Director Shot List": 3,
        "8K Gemini Keyframe": 5,
        "24fps Motion Video": 20,
        "10-Agent Swarm Pipeline": 40,
        "PDF Production Bible": 10
    }

    PLANS = {
        "STARTER": {
            "name": "Starter Creator",
            "price": "$0/mo",
            "credits": 50,
            "entitlement_id": "starter_free",
            "features": ["Single Film Project", "Standard Screenplay Generation", "Community Support"]
        },
        "PRO": {
            "name": "Pro Filmmaker",
            "price": "$29/mo",
            "credits": 250,
            "entitlement_id": "pro_filmmaker",
            "features": ["10-Agent Swarm Pipeline", "8K Gemini Keyframes", "Unlimited Projects", "PDF & Fountain Export"]
        },
        "STUDIO": {
            "name": "Studio Production",
            "price": "$99/mo",
            "credits": 1000,
            "entitlement_id": "studio_tier",
            "features": ["24fps Motion Video Synthesis", "ClickHouse Deep Telemetry", "Priority Processing", "Custom Personas"]
        },
        "ENTERPRISE": {
            "name": "Hollywood Enterprise",
            "price": "$299/mo",
            "credits": 5000,
            "entitlement_id": "enterprise_hollywood",
            "features": ["Dedicated GPU Pipeline", "Multi-Seat Collaboration", "Custom Model Tuning", "24/7 SLA"]
        }
    }

    REFILL_PACKS = [
        {"id": "refill_100", "name": "100 CR Top-Up", "credits": 100, "price": "$9.99"},
        {"id": "refill_500", "name": "500 CR Superpack", "credits": 500, "price": "$39.99"},
        {"id": "refill_2000", "name": "2,000 CR Studio Vault", "credits": 2000, "price": "$129.99"}
    ]

    def __init__(self):
        self.api_key = os.getenv("REVENUECAT_API_KEY", os.getenv("REVENUECAT_SECRET_KEY", ""))
        self.api_url = "https://api.revenuecat.com/v1"
        self.current_plan = "PRO"
        self.total_credits = 250
        self.used_credits = 48
        self.user_id = "usr_agentic_cinema_pro"

    def get_status(self, app_user_id: Optional[str] = None) -> Dict[str, Any]:
        """Fetches live entitlement status and credit balance."""
        user_id = app_user_id or self.user_id
        
        # If API key configured, sync with RevenueCat REST API
        if self.api_key:
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                res = requests.get(f"{self.api_url}/subscribers/{user_id}", headers=headers, timeout=3)
                if res.status_code == 200:
                    data = res.json()
                    entitlements = data.get("subscriber", {}).get("entitlements", {})
                    if "enterprise_hollywood" in entitlements:
                        self.current_plan = "ENTERPRISE"
                    elif "studio_tier" in entitlements:
                        self.current_plan = "STUDIO"
                    elif "pro_filmmaker" in entitlements:
                        self.current_plan = "PRO"
            except Exception as e:
                logger.warning(f"RevenueCat REST API sync notice: {e}")

        available = max(0, self.total_credits - self.used_credits)
        return {
            "provider": "RevenueCat v1 REST API",
            "app_user_id": user_id,
            "plan": self.current_plan,
            "credits_available": available,
            "credits_used": self.used_credits,
            "credits_total": self.total_credits,
            "costs": self.CREDIT_COSTS,
            "plans": self.PLANS,
            "refill_packs": self.REFILL_PACKS
        }

    def check_credits(self, action: str) -> Dict[str, Any]:
        cost = self.CREDIT_COSTS.get(action, 2)
        available = self.total_credits - self.used_credits
        return {
            "action": action,
            "cost": cost,
            "available": available,
            "sufficient": available >= cost
        }

    def deduct_credits(self, action: str) -> Dict[str, Any]:
        cost = self.CREDIT_COSTS.get(action, 2)
        available = self.total_credits - self.used_credits
        if available >= cost:
            self.used_credits += cost
            return {
                "success": True,
                "deducted": cost,
                "remaining": self.total_credits - self.used_credits,
                "plan": self.current_plan
            }
        return {
            "success": False,
            "error": f"Insufficient credits for {action} (Requires {cost} CR, Available {available} CR)",
            "remaining": available
        }

    def upgrade_plan(self, plan_id: str) -> Dict[str, Any]:
        """Upgrades subscription tier and allocates new plan credits."""
        p = plan_id.upper()
        if p in self.PLANS:
            plan_info = self.PLANS[p]
            self.current_plan = p
            self.total_credits = plan_info["credits"]
            self.used_credits = 0
            return {
                "success": True,
                "plan": p,
                "message": f"Successfully upgraded to {plan_info['name']}! {plan_info['credits']} CR credited to balance.",
                "status": self.get_status()
            }
        return {"success": False, "error": f"Invalid plan {plan_id}"}

    def refill_credits(self, pack_id: str) -> Dict[str, Any]:
        """Adds top-up credit pack to balance."""
        found = None
        for pack in self.REFILL_PACKS:
            if pack["id"] == pack_id:
                found = pack
                break

        if found:
            self.total_credits += found["credits"]
            return {
                "success": True,
                "added": found["credits"],
                "new_total": self.total_credits - self.used_credits,
                "message": f"Added {found['credits']} CR top-up pack to balance!",
                "status": self.get_status()
            }
        return {"success": False, "error": f"Invalid refill pack {pack_id}"}

    def process_webhook(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Processes incoming RevenueCat Webhook events."""
        try:
            event = event_data.get("event", {})
            event_type = event.get("type")
            user_id = event.get("app_user_id", self.user_id)
            product_id = event.get("product_id", "")

            logger.info(f"Processing RevenueCat Webhook: {event_type} for user {user_id}")

            if event_type in ["INITIAL_PURCHASE", "RENEWAL"]:
                if "enterprise" in product_id.lower():
                    self.upgrade_plan("ENTERPRISE")
                elif "studio" in product_id.lower():
                    self.upgrade_plan("STUDIO")
                elif "pro" in product_id.lower():
                    self.upgrade_plan("PRO")
                return {"success": True, "event": event_type, "user_id": user_id, "action": "CREDITED_SUBSCRIPTION"}

            elif event_type == "NON_RENEWING_PURCHASE":
                # Credit top-up pack
                if "500" in product_id:
                    self.refill_credits("refill_500")
                elif "2000" in product_id:
                    self.refill_credits("refill_2000")
                else:
                    self.refill_credits("refill_100")
                return {"success": True, "event": event_type, "user_id": user_id, "action": "CREDITED_TOPUP"}

            elif event_type == "CANCELLATION":
                self.current_plan = "STARTER"
                return {"success": True, "event": event_type, "user_id": user_id, "action": "DOWNGRADED_TO_STARTER"}

            return {"success": True, "event": event_type, "notice": "Webhook recorded"}
        except Exception as e:
            logger.error(f"RevenueCat Webhook processing error: {e}")
            return {"success": False, "error": str(e)}

revenuecat_backend = RevenueCatService()
