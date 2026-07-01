/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole } from "../types";
import { 
  Home, 
  Users, 
  Trophy, 
  Image, 
  MessageCircle, 
  Calendar, 
  Search, 
  Settings, 
  ShieldAlert,
  Bell
} from "lucide-react";

interface SidebarProps {
  user: UserProfile;
  activeTab: string;
  onNavigate: (tab: string) => void;
  notificationsCount: number;
}

export default function Sidebar({ user, activeTab, onNavigate, notificationsCount }: SidebarProps) {
  const menuItems = [
    { id: "home", label: "ホーム", icon: Home },
    { id: "class", label: "クラス", icon: Users },
    { id: "album", label: "写真共有", icon: Image },
    { id: "chat", label: "チャット", icon: MessageCircle },
    { id: "calendar", label: "カレンダー", icon: Calendar },
    { id: "search", label: "詳細検索", icon: Search },
    { id: "notifications", label: "通知", icon: Bell, badge: notificationsCount },
    { id: "account", label: "アカウント", icon: Settings }
  ];

  const showAdmin = user.role === UserRole.ADMIN || user.role === UserRole.TEACHER;

  return (
    <>
      {/* Desktop & Tablet Sidebar (Hidden on mobile) */}
      <aside id="desktop-sidebar" className="hidden sm:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 min-h-[calc(100vh-62px)] p-4 justify-between transition-colors duration-300">
        
        {/* Navigation Menu Links */}
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* Admin / Teacher Dashboard Section */}
          {showAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4">
                管理者メニュー
              </span>
              <button
                id="sidebar-link-admin"
                type="button"
                onClick={() => onNavigate("admin")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer mt-1.5 ${
                  activeTab === "admin"
                    ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className={`h-5 w-5 ${activeTab === "admin" ? "text-purple-500" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{user.role === UserRole.ADMIN ? "管理機能" : "教員コントロール"}</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Card footer in sidebar */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <img
              src={user.photoUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</div>
              <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold inline-block mt-1 ${
                user.role === UserRole.ADMIN
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                  : user.role === UserRole.TEACHER
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              }`}>
                {user.role === UserRole.ADMIN ? "システム管理者" : user.role === UserRole.TEACHER ? "教員" : "生徒"}
              </span>
            </div>
          </div>
        </div>

      </aside>

      {/* Mobile Navigation Tab Bar (Shown only on small screens) */}
      <nav id="mobile-bottom-nav" className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1 transition-colors duration-300 shadow-lg">
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg transition-all ${
                isActive
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] h-3.5 min-w-3.5 rounded-full flex items-center justify-center px-1 font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
        
        {/* Mobile menu button for admin */}
        {showAdmin && (
          <button
            id="mobile-nav-admin"
            type="button"
            onClick={() => onNavigate("admin")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg transition-all ${
              activeTab === "admin"
                ? "text-purple-500 dark:text-purple-400"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
            <span>管理</span>
          </button>
        )}
      </nav>
    </>
  );
}
