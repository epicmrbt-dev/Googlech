/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserRole, UserProfile } from "../types";
import { School, GraduationCap, ArrowRight, ShieldAlert, LogIn, CheckCircle2, User, Mail, ChevronRight, Upload, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  // Navigation states: 'google_login' or 'profile_setup'
  const [step, setStep] = useState<"google_login" | "profile_setup">("google_login");
  
  // Google Authenticated User info
  const [googleUser, setGoogleUser] = useState<{
    name: string;
    email: string;
    photoUrl: string;
  } | null>(null);

  // Manual Google entry state
  const [showManualGoogle, setShowManualGoogle] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");

  // Profile fields (Step 2)
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [grade, setGrade] = useState("2年");
  const [className, setClassName] = useState("1組");
  const [clubName, setClubName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Listen for popup communication (for high-fidelity popup sign-in)
  useEffect(() => {
    const handlePopupMessage = (event: MessageEvent) => {
      if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
        const { email, name, photoUrl: authPhotoUrl } = event.data.payload;
        handleSuccessfulGoogleAuth(name, email, authPhotoUrl);
      }
    };
    window.addEventListener("message", handlePopupMessage);
    return () => window.removeEventListener("message", handlePopupMessage);
  }, []);

  const handleSuccessfulGoogleAuth = (name: string, email: string, authPhotoUrl: string) => {
    setGoogleUser({ name, email, photoUrl: authPhotoUrl });
    setDisplayName(name);
    setPhotoUrl(authPhotoUrl);
    // Auto preset bio based on email/name
    setBio(`こんにちは！Googleアカウントで参加しました。よろしくお願いします！`);
    setStep("profile_setup");
    setError("");
  };

  // Google Sign-In popup trigger
  const triggerGooglePopup = () => {
    setError("");
    setIsLoading(true);

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      "",
      "GoogleSignInPopup",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Google アカウントでログイン</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body class="bg-slate-50 min-h-screen flex flex-col justify-between text-slate-800 antialiased p-4">
          <div class="max-w-md w-full mx-auto my-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-6">
            
            <!-- Google Logo -->
            <div class="flex flex-col items-center text-center space-y-2">
              <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <h1 class="text-xl font-bold tracking-tight text-slate-900 mt-2">アカウントの選択</h1>
              <p class="text-xs text-slate-500">Google Campus へ進む</p>
            </div>

            <!-- Account Selector -->
            <div class="space-y-4">
              <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">ログインするアカウントを選択</p>
              
              <div class="space-y-2">
                <!-- User's real email from AI Studio context -->
                <button type="button" onclick="selectUser('epicmrbt@gmail.com', 'epicmrbt', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')" class="w-full text-left p-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                  <div class="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">E</div>
                  <div class="overflow-hidden">
                    <p class="text-xs font-bold text-slate-800">epicmrbt@gmail.com</p>
                    <p class="text-[10px] text-slate-400">Google アカウント</p>
                  </div>
                </button>

                <!-- Mock Satoh -->
                <button type="button" onclick="selectUser('sato.misaki@g.campus.edu', '佐藤 美咲', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')" class="w-full text-left p-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" class="h-9 w-9 rounded-full object-cover" />
                  <div class="overflow-hidden">
                    <p class="text-xs font-bold text-slate-800">sato.misaki@g.campus.edu</p>
                    <p class="text-[10px] text-slate-400">佐藤 美咲 (生徒)</p>
                  </div>
                </button>

                <!-- Mock Takahashi -->
                <button type="button" onclick="selectUser('takahashi.teacher@g.campus.edu', '高橋 健二', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80')" class="w-full text-left p-3 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" class="h-9 w-9 rounded-full object-cover" />
                  <div class="overflow-hidden">
                    <p class="text-xs font-bold text-slate-800">takahashi.teacher@g.campus.edu</p>
                    <p class="text-[10px] text-slate-400">高橋 健二 (先生)</p>
                  </div>
                </button>
              </div>

              <!-- Manual entry -->
              <div class="pt-4 border-t border-slate-100 space-y-3">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">別のアカウントを使用</p>
                <div class="space-y-2">
                  <input type="text" id="manual-name" placeholder="お名前 (例: 山田 太郎)" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50" />
                  <input type="email" id="manual-email" placeholder="メールアドレス" class="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50" />
                  <button type="button" onclick="submitManual()" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex justify-center items-center">
                    ログインする
                  </button>
                </div>
              </div>
            </div>

            <!-- Notice -->
            <div class="text-[10px] text-slate-400 text-center leading-relaxed">
              続行することにより、Google Campus がプロフィール情報とメールアドレスを取得することに同意したものとみなされます。
            </div>

          </div>

          <script>
            function selectUser(email, name, photoUrl) {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  payload: { email, name, photoUrl }
                }, '*');
                window.close();
              }
            }

            function submitManual() {
              const name = document.getElementById('manual-name').value.trim();
              const email = document.getElementById('manual-email').value.trim();
              if (!name || !email) {
                alert('お名前とメールアドレスを入力してください。');
                return;
              }
              const photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
              selectUser(email, name, photoUrl);
            }
          </script>
        </body>
        </html>
      `);
      popup.document.close();
    }
    
    // Quick timeout to let the user know they can also use inline login if popups are blocked
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Direct login from inline chooser (foolproof backup in sandboxed iframe)
  const handleInlineSelect = (email: string, name: string, photoUrl: string) => {
    handleSuccessfulGoogleAuth(name, email, photoUrl);
  };

  const handleManualGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualEmail.trim()) {
      setError("お名前とメールアドレスを正しく入力してください。");
      return;
    }
    const fallbackPhoto = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
    handleSuccessfulGoogleAuth(manualName, manualEmail, fallbackPhoto);
  };

  // Final Registration Step Submission
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser) return;

    if (!displayName.trim()) {
      setError("表示名を入力してください。");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        uid: googleUser.email === "epicmrbt@gmail.com" ? "current_user_id" : `user_${Date.now()}`,
        name: displayName,
        email: googleUser.email,
        photoUrl: photoUrl || googleUser.photoUrl,
        grade: role === UserRole.ADMIN ? "本部" : grade,
        className: role === UserRole.ADMIN ? "事務局" : className,
        clubName: clubName || undefined,
        bio: bio,
        role: role,
        joinedAt: new Date().toISOString()
      });
    }, 1000);
  };

  return (
    <div id="auth-screen-container" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left pane: Dynamic App Info Banner */}
        <div id="auth-info-banner" className="md:col-span-5 bg-linear-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-white rounded-2xl overflow-hidden shadow-md flex items-center justify-center p-0.5">
                <img 
                  src="/logo.png" 
                  alt="Google Campus Logo" 
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">Google Campus</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-4">
              学校内の安全な<br />コミュニティ空間。
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
              Google Campusは、生徒と先生が学習サポート、クラス時間割、部活動、チャットなどをリアルタイムに共有し、高め合える学校専用の安全なプラットフォームです。
            </p>
          </div>

          <div className="space-y-4 relative z-10 mt-6">
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-blue-100 font-semibold">Google アカウント認証による安全なログイン</span>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-xs text-blue-100 font-semibold">学年、クラス（1組・2組・3組）別の高度な連携</span>
            </div>
          </div>

          <div className="text-xs text-blue-200/70 mt-8 relative z-10 font-medium">
            &copy; 2026 Google Campus. Powered by AI Studio.
          </div>
        </div>

        {/* Right pane: Auth form & Profile Settings depending on current step */}
        <div id="auth-inputs-container" className="md:col-span-7 p-8 flex flex-col justify-center min-h-[550px]">
          <AnimatePresence mode="wait">
            
            {step === "google_login" ? (
              <motion.div
                key="google_login_step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    校内SNSに接続
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                    学校専用ネットワークに安全に参加するため、お持ちのGoogleアカウントでサインインしてください。
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Primary Google Login Button */}
                <div className="space-y-4 pt-2">
                  <button
                    id="google-signin-primary-btn"
                    type="button"
                    onClick={triggerGooglePopup}
                    className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 shadow-sm rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.99]"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm">Google アカウントでログイン</span>
                  </button>
                </div>

                {/* Sub title divider / direct interactive picker (seamless inside iframe context) */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    アカウントを選択してサインイン
                  </span>
                  <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                </div>

                {/* Highly Polished Interactive Inline Selector to bypass standard popup blockers */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleInlineSelect("epicmrbt@gmail.com", "epicmrbt", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80")}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-xs">E</div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">epicmrbt@gmail.com</p>
                        <p className="text-[10px] text-slate-400 font-medium">Google アカウント</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInlineSelect("sato.misaki@g.campus.edu", "佐藤 美咲", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">sato.misaki@g.campus.edu</p>
                        <p className="text-[10px] text-slate-400 font-medium">佐藤 美咲 (生徒アカウント)</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInlineSelect("takahashi.teacher@g.campus.edu", "高橋 健二", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80")}
                    className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">takahashi.teacher@g.campus.edu</p>
                        <p className="text-[10px] text-slate-400 font-medium">高橋 健二 (先生アカウント)</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                {/*別アカウントでの手動入力Googleシミュレーション*/}
                <div className="pt-2">
                  {!showManualGoogle ? (
                    <button
                      type="button"
                      onClick={() => setShowManualGoogle(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                    >
                      + 別のアカウントを使用
                    </button>
                  ) : (
                    <form onSubmit={handleManualGoogleSubmit} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950 space-y-3 mt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Google アカウント手動指定</p>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="名前 (例: 田中 一郎)"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          className="text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          required
                          placeholder="メールアドレス"
                          value={manualEmail}
                          onChange={(e) => setManualEmail(e.target.value)}
                          className="text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowManualGoogle(false)}
                          className="px-3 py-1.5 text-xs text-slate-500 font-semibold"
                        >
                          キャンセル
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs bg-slate-800 text-white rounded-lg font-bold"
                        >
                          Google認証を完了
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </motion.div>
            ) : (
              // STEP 2: PROFILE SETUP
              <motion.div
                key="profile_setup_step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Google アカウント認証完了
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                    学内プロフィール設定
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
                    Googleアカウント {googleUser?.email} でログインしました。SNSで表示する情報を登録してください。
                  </p>
                </div>

                {/* Profile Picture Selection */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group cursor-pointer shrink-0">
                      <img
                        src={photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                        alt="Selected Avatar"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md transition-all group-hover:brightness-90"
                      />
                      <label htmlFor="custom-avatar-file" className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="h-5 w-5 text-white" />
                      </label>
                      <input
                        type="file"
                        id="custom-avatar-file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setPhotoUrl(event.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1 w-full">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">プロフィール写真の選択</p>
                        <label htmlFor="custom-avatar-file" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-bold">
                          <Upload className="h-3 w-3" />
                          ローカルからアップロード
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">お好きなプリセットを選ぶか、画像をアップロードするか、任意の画像URLを入力してください。</p>
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="カスタム画像URLを入力..."
                        className="w-full text-[10px] px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Preset Avatars */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">アバター・プリセット</p>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { name: "Google", url: googleUser?.photoUrl },
                        { name: "男子1", url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80" },
                        { name: "女子1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" },
                        { name: "男子2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                        { name: "女子2", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80" },
                        { name: "先生A", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
                        { name: "先生B", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" }
                      ].map((preset, idx) => {
                        if (!preset.url) return null;
                        const isSelected = photoUrl === preset.url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPhotoUrl(preset.url || "")}
                            className={`relative rounded-full p-0.5 transition-all ${
                              isSelected ? "ring-2 ring-blue-500 scale-105" : "hover:scale-105 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[7px] px-1 rounded-sm scale-75 truncate max-w-[32px]">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
                  {googleUser?.photoUrl ? (
                    <img
                      src={googleUser.photoUrl}
                      alt={googleUser.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      G
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{googleUser?.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">{googleUser?.email}</p>
                  </div>
                </div>
                <form id="profile-setup-form" onSubmit={handleFinalSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">表示名 (本名)</label>
                      <input
                        id="setup-input-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">アカウント権限</label>
                      <select
                        id="setup-select-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={UserRole.STUDENT}>生徒 (Student)</option>
                        <option value={UserRole.TEACHER}>先生 (Teacher)</option>
                        <option value={UserRole.ADMIN}>管理者 (Admin)</option>
                      </select>
                    </div>
                  </div>

                  {role !== UserRole.ADMIN && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">学年</label>
                        <select
                          id="setup-select-grade"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="1年">1年</option>
                          <option value="2年">2年</option>
                          <option value="3年">3年</option>
                          <option value="職員">職員</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">クラス (1組・2組・3組)</label>
                        <select
                          id="setup-select-class"
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="1組">1組</option>
                          <option value="2組">2組</option>
                          <option value="3組">3組</option>
                          <option value="職員室">職員室</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">自己紹介</label>
                    <textarea
                      id="setup-textarea-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="例: 勉強やクラスの予定管理に使います！よろしくお願いします！"
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("google_login")}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-98"
                    >
                      戻る
                    </button>
                    <button
                      id="profile-setup-submit"
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer active:scale-98 transition-all disabled:opacity-50 text-xs"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <GraduationCap className="h-4.5 w-4.5" />
                          <span>校内SNSに接続</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
