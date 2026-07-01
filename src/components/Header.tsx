/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { UserProfile, AppNotification } from "../types";
import { Search, Bell, Sun, Moon, Wifi, WifiOff, LogOut, Check } from "lucide-react";

interface HeaderProps {
  user: UserProfile;
  notifications: AppNotification[];
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onNavigate: (tab: string) => void;
  onMarkNotificationRead: (id: string) => void;
}

export default function Header({
  user,
  notifications,
  isDark,
  setIsDark,
  isOnline,
  setIsOnline,
  onLogout,
  searchQuery,
  setSearchQuery,
  onNavigate,
  onMarkNotificationRead
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 flex items-center justify-between transition-colors duration-300">
      
      {/* Brand Logo & Mobile Brand */}
      <div className="flex items-center gap-2">
        <div 
          onClick={() => onNavigate("home")} 
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          {/* Custom Google Logo Colored Icon */}
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-150">
            <img 
              src="/logo.png" 
              alt="Google Campus Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer" 
            />
          </div>
          <div className="hidden sm:block font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
            <span className="ml-1.5 text-slate-700 dark:text-slate-200 font-semibold text-base">Campus</span>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-12">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            id="header-global-search"
            type="text"
            placeholder="生徒、投稿、部活、ハッシュタグを検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value) {
                onNavigate("search");
              }
            }}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500/30 dark:focus:border-blue-400/30 rounded-full text-slate-800 dark:text-slate-100 focus:outline-hidden focus:bg-white dark:focus:bg-slate-950 transition-all duration-150"
          />
        </div>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-1 sm:gap-3">
        
        {/* Connection status (Interactive Demo feature!) */}
        <button
          id="header-connection-toggle"
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          title={isOnline ? "オンライン状態 (クリックしてオフライン化)" : "オフライン状態 (クリックしてオンライン化)"}
          className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold cursor-pointer transition-all duration-200 ${
            isOnline 
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100" 
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 animate-pulse"
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span className="hidden md:inline">オンライン</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="hidden md:inline">オフライン</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
          title="ダークモード切替"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="header-notifications-btn"
            type="button"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div id="notifications-popover" className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">通知 ({unreadCount}件の未読)</span>
                <button 
                  type="button"
                  onClick={() => onNavigate("notifications")} 
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  すべて見る
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                    通知はありません
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 flex gap-2 items-start ${
                        !notif.isRead ? "bg-blue-50/40 dark:bg-blue-950/10" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{notif.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">{notif.body}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                          title="既読にする"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Action / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            id="header-user-profile-btn"
            type="button"
            onClick={() => onNavigate("account")}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <img
              src={user.photoUrl}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:opacity-80"
            />
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-500">{user.name}</div>
              <div className="text-[10px] text-slate-400">{user.grade} {user.className}</div>
            </div>
          </button>
          
          <button
            id="header-logout-btn"
            type="button"
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
            title="ログアウト"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>
    </header>
  );
}
