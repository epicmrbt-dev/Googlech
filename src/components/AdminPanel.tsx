/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, SchoolAnnouncement } from "../types";
import { MOCK_USERS, MOCK_ANNOUNCEMENTS } from "../data/mockData";
import { 
  ShieldAlert, 
  Users, 
  Trash2, 
  Megaphone, 
  Layers, 
  UserCog, 
  CheckCircle, 
  Send,
  AlertOctagon,
  Lock
} from "lucide-react";

interface AdminPanelProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

interface FlaggedPost {
  id: string;
  postId: string;
  content: string;
  authorName: string;
  reportedBy: string;
  reason: string;
  createdAt: string;
}

export default function AdminPanel({ user, isOnline, onAddNotification }: AdminPanelProps) {
  // Guard access - Only TEACHER and ADMIN are permitted to access administrative controls!
  const hasAccess = user.role === UserRole.TEACHER || user.role === UserRole.ADMIN;

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<"moderation" | "roster" | "broadcast">("moderation");

  // Roster state
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);

  // Moderation state
  const [flaggedPosts, setFlaggedPosts] = useState<FlaggedPost[]>([
    {
      id: "flag_1",
      postId: "post_3",
      content: "数学の小テストの問題流出してるってマジ？URL載せるわー",
      authorName: "山田 太郎",
      reportedBy: "佐藤 美咲",
      reason: "校則違反、テスト不正に関する投稿",
      createdAt: new Date().toISOString()
    }
  ]);

  // Broadcast state
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(MOCK_ANNOUNCEMENTS);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnContent, setNewAnnContent] = useState("");
  const [newAnnScope, setNewAnnScope] = useState<"all" | "teachers">("all");

  // Delete/dismiss flagged post
  const handleActionOnFlag = (id: string, action: "delete" | "dismiss") => {
    setFlaggedPosts(flaggedPosts.filter(f => f.id !== id));
    
    if (action === "delete") {
      onAddNotification("announcement", "投稿を削除しました", "通報のあった不適切な投稿を削除・削除通知を送信しました。");
    } else {
      onAddNotification("announcement", "通報を却下しました", "該当投稿の安全性が確認されたため通報を却下しました。");
    }
  };

  // Change user role
  const handleChangeRole = (uid: string, nextRole: UserRole) => {
    setUsers(users.map(u => {
      if (u.uid === uid) {
        return { ...u, role: nextRole };
      }
      return u;
    }));
    onAddNotification("announcement", "権限を更新しました", "指定したユーザーの権限を正常に変更しました。");
  };

  // Publish Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const newAnn: SchoolAnnouncement = {
      id: `ann_${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      createdAt: new Date().toISOString(),
      authorName: user.name,
      scope: newAnnScope
    };

    setAnnouncements([newAnn, ...announcements]);
    setNewAnnTitle("");
    setNewAnnContent("");
    
    onAddNotification("announcement", "全校お知らせを配信しました", `「${newAnnTitle}」を学校掲示板に配信しました。`);
  };

  // If user is a student, gently show access denied banner!
  if (!hasAccess) {
    return (
      <div id="admin-panel-viewport" className="p-6 max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-extrabold text-slate-850 dark:text-slate-100">管理室・職員用ダッシュボード</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            このダッシュボード（Admin Panel）は、先生、顧問、および学校管理者アカウント（Teacher / Admin）専用の領域です。一般の生徒・部員アカウントからは閲覧・操作できません。
          </p>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl text-xs text-slate-400 border border-slate-150">
          💡 テストをしたい場合は、ログイン画面の「ロール・プレイグラウンド（Roles Playground）」から **高橋 健二 (先生)** アカウントに切り替えてアクセスをお試しください。
        </div>
      </div>
    );
  }

  return (
    <div id="admin-panel-viewport" className="p-4 md:p-6 pb-20 sm:pb-6 space-y-6">
      
      {/* Admin stats widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">総登録ユーザー</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{users.length} 名</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">監視対象タイムライン</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-slate-100">4件</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">未処理の通報案件</p>
            <p className="text-xl font-extrabold text-rose-600">{flaggedPosts.length} 件</p>
          </div>
        </div>
      </div>

      {/* Admin Subtabs navigation */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveAdminSubTab("moderation")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeAdminSubTab === "moderation"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 inline mr-1.5" />
          タイムライン通報管理 ({flaggedPosts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab("roster")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeAdminSubTab === "roster"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <UserCog className="h-3.5 w-3.5 inline mr-1.5" />
          ユーザー権限管理
        </button>
        <button
          type="button"
          onClick={() => setActiveAdminSubTab("broadcast")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeAdminSubTab === "broadcast"
              ? "bg-slate-800 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5 inline mr-1.5" />
          全校お知らせ配信
        </button>
      </div>

      {/* ADMIN SUBPANEL CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xs">
        
        {/* MODERATION TAB */}
        {activeAdminSubTab === "moderation" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">不適切な投稿の監視・検閲</h2>
              <span className="text-[10px] text-slate-400">※ 生徒が通報ボタンを押したタイムライン投稿がここに収集されます</span>
            </div>

            <div className="space-y-3">
              {flaggedPosts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">現在未処理の通報はありません。タイムラインは平和です。</p>
              ) : (
                flaggedPosts.map(flag => (
                  <div key={flag.id} className="p-4 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-extrabold text-rose-600">通報理由: {flag.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">通報者: {flag.reportedBy} • 対象投稿者: {flag.authorName}</p>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleActionOnFlag(flag.id, "dismiss")}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-bold"
                        >
                          通報却下
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActionOnFlag(flag.id, "delete")}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>即時削除</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 rounded-xl italic text-slate-600">
                      「 {flag.content} 」
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ROSTER / PERMISSION MANAGEMENT */}
        {activeAdminSubTab === "roster" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">学校メンバー権限・ロール変更</h2>
            <div className="divide-y divide-slate-100 text-xs">
              {users.map(u => (
                <div key={u.uid} className="py-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photoUrl}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-bold text-slate-850 dark:text-slate-200">{u.name}</p>
                      <p className="text-[10px] text-slate-400">{u.email} • {u.grade} {u.className}</p>
                    </div>
                  </div>

                  {/* Role updater dropdown/buttons */}
                  <div className="flex gap-1.5">
                    {[UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN].map(roleOption => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => handleChangeRole(u.uid, roleOption)}
                        className={`px-2 py-1 rounded-sm text-[10px] font-bold ${
                          u.role === roleOption
                            ? "bg-slate-800 text-white"
                            : "bg-slate-50 text-slate-400 border border-slate-150 hover:bg-slate-100"
                        }`}
                      >
                        {roleOption === UserRole.STUDENT ? "生徒" : roleOption === UserRole.TEACHER ? "先生" : "管理者"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BROADCAST / PUBLISH ANNOUNCEMENT */}
        {activeAdminSubTab === "broadcast" && (
          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">全校お知らせ・緊急連絡の起案</h2>
              <p className="text-xs text-slate-400">学校全体、または教職員のみに向けて重要なお知らせをピン留めします。</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">配信タイトル</label>
                <input
                  type="text"
                  required
                  placeholder="例: 【重要】来月の学間試験に伴う校内時程の変更について"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-lg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-1">お知らせ内容（マークダウン風可）</label>
                <textarea
                  required
                  rows={4}
                  placeholder="詳細な連絡事項を記載してください。日時や対象クラスを明示するとわかりやすくなります。"
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">公開範囲</label>
                <select
                  value={newAnnScope}
                  onChange={(e) => setNewAnnScope(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-750 bg-white rounded-lg text-slate-850"
                >
                  <option value="all">全員に公開（生徒・先生・保護者）</option>
                  <option value="teachers">教職員のみ公開（職員会議室）</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>お知らせを掲示する</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
