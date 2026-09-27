"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Film, Lock, Mail, ArrowRight, Sparkles, RefreshCw, KeyRound, AlertCircle, CheckCircle2, X } from "lucide-react";

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, signup, resetPassword, enterAsGuest } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Map Firebase errors to human-friendly messages
  const formatFirebaseError = (err: unknown): string => {
    let code = "";
    let msg = "";
    if (typeof err === "object" && err !== null) {
      if ("code" in err && typeof (err as { code: unknown }).code === "string") {
        code = (err as { code: string }).code;
      }
      if ("message" in err && typeof (err as { message: unknown }).message === "string") {
        msg = (err as { message: string }).message;
      }
    }

    if (code === "auth/email-already-in-use") {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/weak-password") {
      return "Password should be at least 6 characters long.";
    }
    if (
      code === "auth/wrong-password" ||
      code === "auth/user-not-found" ||
      code === "auth/invalid-credential"
    ) {
      return "Incorrect email or password. Please double-check your credentials.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Sign-in popup was closed before completing. Click again when ready.";
    }
    if (code === "auth/popup-blocked") {
      return "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many failed attempts. Access is temporarily disabled. Please reset your password or try again later.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection issue. Please check your internet connection.";
    }
    return msg || "An error occurred during authentication.";
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccessMsg("");
    setIsSubmitting(true);
    setAuthStatus("Opening official Google Account Sign-In...");

    try {
      await loginWithGoogle();
      // On success, onAuthStateChanged handles transition automatically
    } catch (err: unknown) {
      console.warn("Google Auth notice:", err);
      setError(formatFirebaseError(err));
    } finally {
      setIsSubmitting(false);
      setAuthStatus("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmedEmail = email.trim();

    // Basic Validation
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match. Please re-type your password.");
        return;
      }

      setIsSubmitting(true);
      setAuthStatus("Creating your Studio Account in Firebase...");
      try {
        await signup(trimmedEmail, password, name.trim());
      } catch (err: unknown) {
        setError(formatFirebaseError(err));
      } finally {
        setIsSubmitting(false);
        setAuthStatus("");
      }
    } else {
      setIsSubmitting(true);
      setAuthStatus("Signing in to Studio Lot...");
      try {
        await login(trimmedEmail, password);
      } catch (err: unknown) {
        setError(formatFirebaseError(err));
      } finally {
        setIsSubmitting(false);
        setAuthStatus("");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetSuccess(`Password reset email sent to ${resetEmail.trim()}. Check your inbox!`);
    } catch (err: unknown) {
      setResetError(formatFirebaseError(err));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050711] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
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
              GOOGLE CLOUD AI FILM STUDIO LOT
            </p>
          </div>
        </div>

        {/* Status Notification */}
        {authStatus && (
          <div className="bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
            <span>{authStatus}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs p-3.5 rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* 1. Official Google Sign In */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full bg-[#131b2e] hover:bg-[#1a2642] border border-[#253354] hover:border-indigo-500 text-white text-xs font-bold py-3.5 px-4 rounded-2xl transition flex items-center justify-center gap-3 cursor-pointer shadow-lg group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
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
            <span className="tracking-wide">Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#1c263c]" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            or use email
          </span>
          <div className="flex-1 h-px bg-[#1c263c]" />
        </div>

        {/* 2. Email & Password Form */}
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
                required={isSignUp}
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
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
                placeholder="director@agenticcinema.ai"
                required
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                    setResetError("");
                    setResetSuccess("");
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            {isSignUp && password && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <div
                  className={`h-1 flex-1 rounded-full ${
                    password.length >= 8
                      ? "bg-emerald-500"
                      : password.length >= 6
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
                <span className="text-[9px] text-slate-400 font-mono">
                  {password.length >= 8
                    ? "Strong"
                    : password.length >= 6
                    ? "Good (6+ chars)"
                    : "Too short (min 6)"}
                </span>
              </div>
            )}
          </div>

          {isSignUp && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={isSignUp}
                  className={`w-full bg-[#050813] border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                    confirmPassword && confirmPassword !== password
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-[#1e2a47] focus:border-indigo-500"
                  }`}
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match.</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            <span>{isSignUp ? "Create Studio Account" : "Sign In to Studio Lot"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Login / Signup */}
        <div className="text-center pt-2 space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setSuccessMsg("");
            }}
            className="text-xs text-slate-400 hover:text-indigo-300 transition cursor-pointer block w-full text-center"
          >
            {isSignUp
              ? "Already have a Studio account? Sign in"
              : "New to Agentic Cinema? Create an account"}
          </button>

          <div className="pt-2 border-t border-[#1c263c]">
            <button
              type="button"
              onClick={enterAsGuest}
              className="w-full bg-[#11182c] hover:bg-[#1b2645] border border-[#23335a] text-slate-300 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎬 Continue as Guest / Enter Studio Without Auth</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onClick={() => setShowForgotModal(false)}
        >
          <div
            className="bg-[#0c1224] border border-[#202d4b] w-full max-w-md rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 p-2.5 mx-auto flex items-center justify-center text-indigo-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset Your Password</h3>
              <p className="text-xs text-slate-400">
                Enter your registered email address and Firebase will send you a password reset link.
              </p>
            </div>

            {resetError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                ⚠️ {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs p-3 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  className="w-full bg-[#050813] border border-[#1e2a47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
              >
                {isResetting ? "Sending Reset Email..." : "Send Password Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
