/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, Post } from "../types";
import { MOCK_USERS, MOCK_POSTS } from "../data/mockData";
import { 
  Search, 
  Settings, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Save, 
  HelpCircle,
  Hash,
  Users,
  Smartphone,
  Download,
  CheckCircle2
} from "lucide-react";


interface SearchSettingsViewProps {
  user: UserProfile;
  isDark: boolean;
  onToggleDark: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onAddNotification: (type: string, title: string, body: string) => void;
  deferredPrompt?: any;
  isAppInstalled?: boolean;
  onInstallPWA?: () => void;
}

export default function SearchSettingsView({ 
  user, 
  isDark, 
  onToggleDark, 
  onUpdateUser, 
  onAddNotification,
  deferredPrompt,
  isAppInstalled,
  onInstallPWA
}: SearchSettingsViewProps) {
  // Tabs: search vs account settings
  const [activeTab, setActiveTab] = useState<"search" | "profile" | "preferences">("profile");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"all" | "posts" | "users">("all");

  // Profile Editor States
  const [name, setName] = useState(user.name);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [bio, setBio] = useState(user.bio || "");
  const [grade, setGrade] = useState(user.grade);
  const [className, setClassName] = useState(user.className);
  const [clubName, setClubName] = useState(user.clubName || "未所属");

  // Preference Toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  // Search Results Calculations
  const performSearch = () => {
    if (!searchQuery.trim()) return { posts: [], users: [] };

    const q = searchQuery.toLowerCase();

    // Filter Posts
    const filteredPosts = MOCK_POSTS.filter(p => {
      const contentMatch = p.content.toLowerCase().includes(q);
      const tagMatch = p.tags?.some(t => t.toLowerCase().includes(q));
      const authorMatch = p.authorName.toLowerCase().includes(q);
      return contentMatch || tagMatch || authorMatch;
    });

    // Filter Users
    const filteredUsers = MOCK_USERS.filter(u => {
      const nameMatch = u.name.toLowerCase().includes(q);
      const emailMatch = u.email.toLowerCase().includes(q);
      const classMatch = u.className.toLowerCase().includes(q);
      const clubMatch = u.clubName?.toLowerCase().includes(q);
      return nameMatch || emailMatch || classMatch || clubMatch;
    });

    return { posts: filteredPosts, users: filteredUsers };
  };

  const { posts: foundPosts, users: foundUsers } = performSearch();

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updated: UserProfile = {
      ...user,
      name,
      photoUrl,
      bio,
      grade,
      className,
      clubName: clubName === "未所属" ? undefined : clubName
    };

    onUpdateUser(updated);
    onAddNotification("announcement", "プロフィールを更新しました", "新しいプロフィール情報がキャンパス全体に反映されました。");
  };

  return (
    <div id="search-settings-viewport" className="p-4 md:p-6 pb-20 sm:pb-6 space-y-6 max-w-3xl mx-auto">
      
      {/* Visual Tab Header navigation */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <User className="h-3.5 w-3.5 inline mr-1.5" />
          プロフィール編集
        </button>
        <button
          id="tab-btn-search"
          type="button"
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "search"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Search className="h-3.5 w-3.5 inline mr-1.5" />
          キャンパス検索
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "preferences"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Settings className="h-3.5 w-3.5 inline mr-1.5" />
          アプリ環境設定
        </button>
      </div>

      {/* TABS CONTAINER BODY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xs">
        
        {/* PROFILE EDITOR TAB */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">学校プロフィール設定</h2>
              <span className="text-[10px] text-slate-400">※ 入力項目は他ユーザーの検索・タイムラインに反映されます</span>
            </div>

            {/* Profile authority indicator banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-4 w-4 text-blue-500" />
                アカウント種別
              </span>
              <span className="font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 px-3 py-1 rounded-sm">
                {user.role === UserRole.STUDENT ? "生徒・一般部員" : user.role === UserRole.TEACHER ? "先生・顧問" : "学校管理者"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">氏名 (DisplayName)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">プロフィール写真URL</label>
                <input
                  type="text"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">学年</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-lg"
                >
                  <option value="1年">1年</option>
                  <option value="2年">2年</option>
                  <option value="3年">3年</option>
                  <option value="職員">職員</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">所属クラス</label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-lg"
                >
                  <option value="1組">1組</option>
                  <option value="2組">2組</option>
                  <option value="3組">3組</option>
                  <option value="職員室">職員室</option>
                  <option value="事務局">事務局</option>
                </select>
              </div>


              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">自己紹介 (バイオグラフィ)</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="例: サッカー部でフォワードを担当しています！宿題や定期テストの勉強について、気軽に話しかけてください。"
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg resize-none"
                />
              </div>
            </div>

            <button
              id="profile-save-submit"
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>変更を保存する</span>
            </button>
          </form>
        )}

        {/* SEARCH TAB PANEL */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">学校内統合検索</h2>
              <p className="text-xs text-slate-400">最新タイムライン投稿、部活動メンション、生徒・先生アカウント名から検索できます。</p>
            </div>

            {/* Input query field */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
              <input
                id="search-input-field"
                type="text"
                placeholder="例: 数学, 鈴木, 文化祭, サッカー部"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:bg-white text-slate-800 focus:border-blue-500"
              />
            </div>

            {/* Selector Categories */}
            <div className="flex gap-2 text-xs">
              {["all", "posts", "users"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSearchCategory(cat as any)}
                  className={`px-3 py-1.5 font-bold rounded-lg cursor-pointer ${
                    searchCategory === cat
                      ? "bg-slate-100 text-slate-850"
                      : "text-slate-400"
                  }`}
                >
                  {cat === "all" ? "すべて" : cat === "posts" ? "タイムライン投稿" : "アカウント"}
                </button>
              ))}
            </div>

            {/* Render results lists */}
            <div className="space-y-4">
              {!searchQuery.trim() ? (
                <p className="text-xs text-slate-400 text-center py-8">検索窓に気になるワードを入れて検索してください</p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  
                  {/* POSTS FOUND SECTION */}
                  {(searchCategory === "all" || searchCategory === "posts") && (
                    <div className="space-y-3 pt-2">
                      <p className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
                        <Hash className="h-4 w-4" />
                        投稿のヒット結果 ({foundPosts.length} 件)
                      </p>
                      
                      {foundPosts.length === 0 ? (
                        <p className="text-xs text-slate-350 italic pl-1">見つかりませんでした</p>
                      ) : (
                        foundPosts.map(p => (
                          <div key={p.id} className="p-3 border border-slate-150 rounded-xl text-xs space-y-1.5 hover:bg-slate-50/50">
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-750">{p.authorName}</span>
                              <span className="text-[10px] text-slate-400">{p.createdAt.split("T")[0]}</span>
                            </div>
                            <p className="text-slate-600 line-clamp-2">{p.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* USERS FOUND SECTION */}
                  {(searchCategory === "all" || searchCategory === "users") && (
                    <div className="space-y-3 pt-4">
                      <p className="text-xs font-extrabold text-slate-500 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        メンバーのヒット結果 ({foundUsers.length} 件)
                      </p>

                      {foundUsers.length === 0 ? (
                        <p className="text-xs text-slate-350 italic pl-1">見つかりませんでした</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {foundUsers.map(u => (
                            <div key={u.uid} className="p-3 border border-slate-150 rounded-xl text-xs flex items-center gap-2.5">
                              <img
                                src={u.photoUrl}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-bold text-slate-800">{u.name}</p>
                                <p className="text-[10px] text-slate-400">{u.grade} {u.className}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* APPLICATION ENVIRONMENT PREFERENCES TAB */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">アプリ設定 & 通知制御</h2>

            <div className="space-y-4 divide-y divide-slate-150 dark:divide-slate-800 text-xs">
              
              {/* Dark mode toggle block */}
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">ダークテーマ（夜間モード）</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">目の疲れを軽減するダーク配色に切り替えます。</p>
                </div>
                
                <button
                  id="prefs-dark-toggle"
                  type="button"
                  onClick={onToggleDark}
                  className="p-2 bg-slate-100 dark:bg-slate-850 border rounded-xl hover:bg-slate-200"
                >
                  {isDark ? (
                    <Sun className="h-4.5 w-4.5 text-amber-500" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-blue-500" />
                  )}
                </button>
              </div>

              {/* Sound Notifications Switch */}
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">チャット通知音</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">新着メッセージが届いた際、模擬チャイムを鳴らします。</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] ${
                    soundEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {soundEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* Banner alerts switch */}
              <div className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">プッシュバナー通知</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">画面上部に新着宿題やアンケートの案内をリアルタイムにポップアップ表示します。</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] ${
                    pushEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {pushEnabled ? "ON" : "OFF"}
                </button>
              </div>

              {/* PWA & Favicon / Home Screen Section */}
              <div className="py-4 border-t border-slate-150 dark:border-slate-800 space-y-4">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Smartphone className="h-4.5 w-4.5 text-blue-500" />
                    ホーム画面に追加 & PWA / ファビコン設定
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    本アプリはPWA（Progressive Web App）に対応しており、ホーム画面に追加することでネイティブアプリ同様に高速・快適に動作します。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {/* Left: Favicon/Icon Preview */}
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">アプリアイコン・ファビコン</p>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center shadow-xs">
                        <img src="/logo.png" alt="Icon preview" className="w-10 h-10 object-contain rounded-lg" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-slate-750 dark:text-slate-200 font-bold text-[11px]">Google Campus Icon</p>
                        <p className="text-slate-400 text-[9px]">ファビコン: 16x16 / 32x32 / favicon.ico</p>
                        <p className="text-slate-400 text-[9px]">PWA・Appleタッチアイコン: 180x180 / 192x192 / 512x512</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Installation Action */}
                  <div className="flex flex-col justify-center space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">インストールの状態</p>
                    {isAppInstalled ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>ホーム画面にインストール済み</span>
                      </div>
                    ) : deferredPrompt ? (
                      <button
                        type="button"
                        onClick={onInstallPWA}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer text-xs transition-all duration-150 animate-bounce"
                      >
                        <Download className="h-4 w-4" />
                        ホーム画面に追加する
                      </button>
                    ) : (
                      <div className="space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                        <p className="font-bold text-slate-650 dark:text-slate-300">手動で追加する方法：</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li><span className="font-semibold text-slate-700 dark:text-slate-300">iOS (Safari):</span> 共有ボタン <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border dark:border-slate-750 rounded text-[9px]">⎋</span> をタップし、「ホーム画面に追加」を選択します。</li>
                          <li><span className="font-semibold text-slate-700 dark:text-slate-300">Android (Chrome):</span> メニュー <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border dark:border-slate-750 rounded text-[9px]">⋮</span> から「ホーム画面に追加」または「アプリをインストール」をタップします。</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Help information section */}
              <div className="py-4 bg-slate-50/50 dark:bg-slate-850 p-4 rounded-xl flex items-start gap-2.5 mt-4">
                <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-750 dark:text-slate-200">Google Campus ヘルプ室</p>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[10px]">
                    このSNSは学校（Google Campus）内限定の安全なシステムです。不適切な投稿を発見した場合は、タイムライン投稿の「通報」ボタンを押して担任の先生・学校管理者へ報告を行ってください。
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
