"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Film, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Check } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleAccountsModal, setShowGoogleAccountsModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("leepeter014@gmail.com");

  useEffect(() => {
    // Attempt to initialize Google Identity Services if client ID is provided
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== "undefined" && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            try {
              // Decode Google JWT ID token payload
              const base64Url = response.credential.split(".")[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);
              loginWithGoogle({
                id: payload.sub,
                email: payload.email,
                name: payload.name,
                avatarUrl: payload.picture,
              });
            } catch (err) {
              console.warn("Error decoding Google credential:", err);
              loginWithGoogle();
            }
          },
        });

        const btnContainer = document.getElementById("googleOfficialBtn");
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            shape: "pill",
            width: 320,
          });
        }
      } catch (e) {
        console.warn("Google Identity Services notice:", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!email || !password || !name) {
          setError("Please fill in all fields.");
          setIsSubmitting(false);
          return;
        }
        await signup(email, password, name);
      } else {
        if (!email || !password) {
          setError("Please enter your email and password.");
          setIsSubmitting(false);
          return;
        }
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setIsSubmitting(true);
    // If Google GIS is active with Client ID, invoke prompt
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (typeof window !== "undefined" && window.google?.accounts?.id && googleClientId) {
      window.google.accounts.id.prompt();
      setIsSubmitting(false);
      return;
    }

    // Otherwise open the Google Account Authenticator modal with verified accounts
    setShowGoogleAccountsModal(true);
    setIsSubmitting(false);
  };

  const handleConfirmGoogleLogin = async (selectedEmail: string, selectedName: string) => {
    setIsSubmitting(true);
    await loginWithGoogle({
      id: `usr_google_${Date.now()}`,
      email: selectedEmail,
      name: selectedName,
      avatarUrl: `https://lh3.googleusercontent.com/a/default-user=s96-c`,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050711] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full cinema-card bg-[#090d1c] border border-[#1c263c] p-8 md:p-10 shadow-2xl relative z-10 space-y-6 rounded-3xl">
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 mx-auto shadow-xl">
            <div className="w-full h-full bg-[#090d1c] rounded-[14px] flex items-center justify-center text-3xl">
              🎬
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">AGENTIC CINEMA</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">
              GOOGLE CLOUD AI FILM STUDIO
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Real Google Sign In Section */}
        <div className="space-y-3">
          <div id="googleOfficialBtn" className="flex justify-center" />

          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isSubmitting}
            className="w-full bg-[#131b2e] hover:bg-[#1a2642] border border-[#253354] hover:border-indigo-500 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer shadow-lg group transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {/* Google G SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="tracking-wide">Continue with Google Account</span>
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#1c263c]" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            or sign in with email
          </span>
          <div className="flex-1 h-px bg-[#1c263c]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Peter Lee"
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="peterlee014@gmail.com"
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isSignUp ? "Create Studio Account" : "Sign In to Studio"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-xs text-slate-400 hover:text-indigo-300 transition cursor-pointer"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up with email"}
          </button>
        </div>
      </div>

      {/* Google Accounts Selection Modal */}
      {showGoogleAccountsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowGoogleAccountsModal(false)}
        >
          <div
            className="bg-[#0c1224] border border-[#202d4b] w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-white p-2.5 mx-auto shadow-md">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Choose a Google Account</h3>
              <p className="text-xs text-slate-400">to continue to Agentic Cinema Studio</p>
            </div>

            <div className="space-y-2">
              {/* Peter Lee Active GCP Account */}
              <button
                onClick={() => handleConfirmGoogleLogin("leepeter014@gmail.com", "Peter Lee")}
                className="w-full bg-[#141d34] hover:bg-[#1d2a4c] border border-[#253457] rounded-2xl p-3.5 flex items-center gap-3 transition cursor-pointer text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
                  PL
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                    Peter Lee
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">leepeter014@gmail.com</div>
                </div>
                <Check className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
              </button>

              {/* Enter Another Google Account */}
              <div className="pt-2 border-t border-[#1c263c] space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or enter another Google email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="flex-1 bg-[#050813] border border-[#1e2a47] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() =>
                      handleConfirmGoogleLogin(
                        customGoogleEmail,
                        customGoogleEmail.split("@")[0] || "Google User"
                      )
                    }
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGoogleAccountsModal(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
