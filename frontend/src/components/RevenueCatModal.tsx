"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, CreditCard, Zap, Sparkles, RefreshCw } from "lucide-react";

interface RevenueCatModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  plan: string;
  onUpgrade?: (newPlan: string) => void;
}

export const RevenueCatModal: React.FC<RevenueCatModalProps> = ({
  isOpen,
  onClose,
  credits,
  plan,
  onUpgrade,
}) => {
  const [rcStatus, setRcStatus] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/revenuecat/status");
      const data = await res.json();
      setRcStatus(data);
    } catch (err) {
      console.error("Error fetching RevenueCat status:", err);
    }
  };

  const handleSubscribeTier = async (planId: string) => {
    setLoadingAction(true);
    try {
      const res = await fetch("/api/revenuecat/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      setLoadingAction(false);
      if (data.success) {
        if (onUpgrade) onUpgrade(planId);
        fetchStatus();
        alert(`🎉 ${data.message || "Upgraded successfully!"}`);
      }
    } catch (err) {
      setLoadingAction(false);
      console.error("Subscribe error:", err);
    }
  };

  const handleRefillPack = async (packId: string) => {
    setLoadingAction(true);
    try {
      const res = await fetch("/api/revenuecat/refill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
      const data = await res.json();
      setLoadingAction(false);
      if (data.success) {
        if (onUpgrade) onUpgrade(plan);
        fetchStatus();
        alert(`⚡ ${data.message || "Credits added!"}`);
      }
    } catch (err) {
      setLoadingAction(false);
      console.error("Refill error:", err);
    }
  };

  if (!isOpen) return null;

  const currentAvailable = rcStatus ? rcStatus.credits_available : credits;
  const currentTotal = rcStatus ? rcStatus.credits_total : 250;
  const currentPlan = rcStatus ? rcStatus.plan : plan;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0b1122] border border-amber-500/40 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-2xl">
            💳
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">RevenueCat Monetization & Entitlements</h3>
            <p className="text-xs text-slate-400">Verified RevenueCat v1 REST API & Real-Time Webhook Engine</p>
          </div>
        </div>

        {/* Real-time Status Card */}
        <div className="p-5 rounded-2xl bg-[#080d1a] border border-[#1d2b4e] space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Active RevenueCat Entitlement:</span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-extrabold text-xs border border-amber-500/40">
              {currentPlan} TIER ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400 text-xs">Available Credit Balance:</span>
            <span className="font-mono text-emerald-400 font-extrabold text-lg">
              {currentAvailable} / {currentTotal} CR
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-400 via-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentAvailable / currentTotal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Subscription Tier Upgrades */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
            Subscription Tier Upgrades
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div
              onClick={() => handleSubscribeTier("PRO")}
              className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
                currentPlan === "PRO"
                  ? "bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-indigo-500/80 shadow-lg"
                  : "bg-[#090e1d] border-[#1c263c] hover:border-indigo-500/40"
              }`}
            >
              <div>
                <div className="text-xs font-extrabold text-white">PRO</div>
                <div className="text-amber-400 text-sm font-extrabold">$29/mo</div>
                <div className="text-[10px] text-slate-400 mt-1">250 CR / mo • 10-Agent Swarm</div>
              </div>
              <button
                disabled={loadingAction || currentPlan === "PRO"}
                className="w-full mt-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-bold"
              >
                {currentPlan === "PRO" ? "Current" : "Upgrade"}
              </button>
            </div>

            <div
              onClick={() => handleSubscribeTier("STUDIO")}
              className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
                currentPlan === "STUDIO"
                  ? "bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-indigo-500/80 shadow-lg"
                  : "bg-[#090e1d] border-[#1c263c] hover:border-indigo-500/40"
              }`}
            >
              <div>
                <div className="text-xs font-extrabold text-white">STUDIO</div>
                <div className="text-amber-400 text-sm font-extrabold">$99/mo</div>
                <div className="text-[10px] text-slate-400 mt-1">1,000 CR / mo • 24fps Motion</div>
              </div>
              <button
                disabled={loadingAction || currentPlan === "STUDIO"}
                className="w-full mt-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-bold"
              >
                {currentPlan === "STUDIO" ? "Current" : "Upgrade"}
              </button>
            </div>

            <div
              onClick={() => handleSubscribeTier("ENTERPRISE")}
              className={`p-3 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between ${
                currentPlan === "ENTERPRISE"
                  ? "bg-gradient-to-b from-indigo-950/60 to-purple-950/60 border-indigo-500/80 shadow-lg"
                  : "bg-[#090e1d] border-[#1c263c] hover:border-indigo-500/40"
              }`}
            >
              <div>
                <div className="text-xs font-extrabold text-white">ENTERPRISE</div>
                <div className="text-amber-400 text-sm font-extrabold">$299/mo</div>
                <div className="text-[10px] text-slate-400 mt-1">5,000 CR / mo • Dedicated GPU</div>
              </div>
              <button
                disabled={loadingAction || currentPlan === "ENTERPRISE"}
                className="w-full mt-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-bold"
              >
                {currentPlan === "ENTERPRISE" ? "Current" : "Upgrade"}
              </button>
            </div>
          </div>
        </div>

        {/* Credit Top-Up Packs */}
        <div className="space-y-3 pt-2 border-t border-[#1c263c]">
          <div className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center justify-between">
            <span>Instant Credit Top-Up Packs</span>
            <span className="text-[10px] text-emerald-400">Never Expires</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              disabled={loadingAction}
              onClick={() => handleRefillPack("refill_100")}
              className="p-3 rounded-xl bg-[#0e1628] border border-[#212f52] hover:border-emerald-500/50 text-left transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-extrabold text-white">+100 CR Refill</div>
                <div className="text-emerald-400 text-sm font-extrabold">$9.99</div>
              </div>
              <span className="text-[10px] text-indigo-300 font-bold mt-2">Add Credits →</span>
            </button>

            <button
              disabled={loadingAction}
              onClick={() => handleRefillPack("refill_500")}
              className="p-3 rounded-xl bg-[#0e1628] border border-[#212f52] hover:border-emerald-500/50 text-left transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-extrabold text-white">+500 CR Superpack</div>
                <div className="text-emerald-400 text-sm font-extrabold">$39.99</div>
              </div>
              <span className="text-[10px] text-indigo-300 font-bold mt-2">Add Credits →</span>
            </button>

            <button
              disabled={loadingAction}
              onClick={() => handleRefillPack("refill_2000")}
              className="p-3 rounded-xl bg-[#0e1628] border border-[#212f52] hover:border-emerald-500/50 text-left transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-extrabold text-white">+2,000 CR Vault</div>
                <div className="text-emerald-400 text-sm font-extrabold">$129.99</div>
              </div>
              <span className="text-[10px] text-indigo-300 font-bold mt-2">Add Credits →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
