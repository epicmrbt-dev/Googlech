/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, UserRole, Post, Comment, AppNotification } from "./types";
import { MOCK_POSTS, MOCK_COMMENTS, MOCK_NOTIFICATIONS } from "./data/mockData";
import AuthScreen from "./components/AuthScreen";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import HomeTimeline from "./components/HomeTimeline";
import ClassCommunityView from "./components/ClassCommunityView";
import ClubCommunityView from "./components/ClubCommunityView";
import PhotoGalleryView from "./components/PhotoGalleryView";
import ChatView from "./components/ChatView";
import CalendarView from "./components/CalendarView";
import SearchSettingsView from "./components/SearchSettingsView";
import AdminPanel from "./components/AdminPanel";
import { Bell, X } from "lucide-react";
import { subscribeToPosts, subscribeToComments, addPost, addComment } from "./lib/firebase";

interface NotificationBanner {
  id: string;
  type: string;
  title: string;
  body: string;
}

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(null);

  // Global Posts and Comments State to persist changes across tabs
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});

  // Connection State: true (Online) or false (Simulated Offline)
  const [isOnline, setIsOnline] = useState<boolean>(true);

  // Sync with Firestore when online
  useEffect(() => {
    if (!isOnline) {
      // Offline fallback: load from local mock if Firestore not active
      setPosts(MOCK_POSTS);
      setComments(MOCK_COMMENTS);
      return;
    }

    // Subscribe to real-time posts
    const unsubscribePosts = subscribeToPosts(async (firestorePosts) => {
      if (firestorePosts.length === 0) {
        // Seed initial posts to Firestore
        console.log("Seeding initial mock posts to Firestore...");
        try {
          for (const post of MOCK_POSTS) {
            await addPost(post);
          }
        } catch (err) {
          console.error("Error seeding initial posts:", err);
        }
      } else {
        setPosts(firestorePosts);
      }
    });

    // Subscribe to real-time comments
    const unsubscribeComments = subscribeToComments(async (firestoreComments) => {
      // If Firestore comments is empty, check if we need to seed
      const keys = Object.keys(firestoreComments);
      if (keys.length === 0) {
        console.log("Seeding initial comments to Firestore...");
        try {
          // Flatten comments to seed them
          for (const postId of Object.keys(MOCK_COMMENTS)) {
            const commentsList = MOCK_COMMENTS[postId];
            for (const comment of commentsList) {
              await addComment(comment);
            }
          }
        } catch (err) {
          console.error("Error seeding initial comments:", err);
        }
      } else {
        setComments(firestoreComments);
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeComments();
    };
  }, [isOnline]);

  // Current active tab in the dashboard
  const [activeTab, setActiveTab] = useState<string>("home");

  // Visual Theme Preference: Dark vs Light
  const [isDark, setIsDark] = useState<boolean>(false);

  // Real-time floating Notification banners
  const [banners, setBanners] = useState<NotificationBanner[]>([]);

  // School-wide notification alerts state
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  // Search query state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // PWA (Add to Home Screen) States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);


  // Toggle Dark Mode
  const handleToggleDark = (val: boolean) => {
    setIsDark(val);
  };

  // Push floating banner notifications on user events
  const addNotification = (type: string, title: string, body: string) => {
    const newBanner: NotificationBanner = {
      id: `banner_${Date.now()}`,
      type,
      title,
      body
    };
    setBanners(prev => [newBanner, ...prev]);

    // Add to notifications dropdown list too!
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      type: "announcement",
      title,
      body,
      targetPath: "home",
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotificationsList(prev => [newNotif, ...prev]);

    // Automatically dismiss floating banner after 4 seconds
    setTimeout(() => {
      setBanners(prev => prev.filter(b => b.id !== newBanner.id));
    }, 4000);
  };

  const removeBanner = (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  // PWA/Install handlers
  useEffect(() => {
    // Check if running in standalone (installed) mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      addNotification(
        "system",
        "ホーム画面に追加可能",
        "Google Campusをホーム画面に追加すると、プッシュ機能等を含めアプリとして快適に利用できます。設定画面から追加が可能です。"
      );
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      addNotification("system", "インストール完了！", "ホーム画面にGoogle Campusが追加されました。");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA installation");
        }
        setDeferredPrompt(null);
      });
    }
  };


  // Render correct dashboard view based on active tab
  const renderActiveView = () => {
    if (!user) return null;

    // We map tabs strictly according to Sidebar's item.id:
    // "home", "class", "club", "album", "chat", "calendar", "search", "notifications", "account", "admin"
    switch (activeTab) {
      case "home":
        return (
          <HomeTimeline 
            user={user} 
            posts={posts}
            setPosts={setPosts}
            comments={comments}
            setComments={setComments}
            isOnline={isOnline} 
            onNavigate={setActiveTab}
            onAddNotification={addNotification} 
          />
        );
      case "class":
        return (
          <ClassCommunityView 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      case "club":
        return (
          <ClubCommunityView 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      case "album":
        return (
          <PhotoGalleryView 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      case "chat":
        return (
          <ChatView 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      case "calendar":
        return (
          <CalendarView 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      case "search":
      case "account":
      case "notifications":
        return (
          <SearchSettingsView 
            user={user} 
            isDark={isDark} 
            onToggleDark={() => setIsDark(!isDark)} 
            onUpdateUser={setUser} 
            onAddNotification={addNotification} 
            deferredPrompt={deferredPrompt}
            isAppInstalled={isAppInstalled}
            onInstallPWA={handleInstallPWA}
          />
        );
      case "admin":
        return (
          <AdminPanel 
            user={user} 
            isOnline={isOnline} 
            onAddNotification={addNotification} 
          />
        );
      default:
        return (
          <HomeTimeline 
            user={user} 
            posts={posts}
            setPosts={setPosts}
            comments={comments}
            setComments={setComments}
            isOnline={isOnline} 
            onNavigate={setActiveTab}
            onAddNotification={addNotification} 
          />
        );
    }
  };

  // If user is not authenticated, load the login screen!
  if (!user) {
    return (
      <div className={isDark ? "dark" : ""}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center transition-colors duration-300">
          <AuthScreen onLogin={setUser} />
        </div>
      </div>
    );
  }

  const unreadNotificationsCount = notificationsList.filter(n => !n.isRead).length;

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
        
        {/* TOP BRANDING BAR HEADER */}
        <Header 
          user={user} 
          notifications={notificationsList}
          isDark={isDark} 
          setIsDark={handleToggleDark} 
          isOnline={isOnline} 
          setIsOnline={(val) => {
            setIsOnline(val);
            addNotification(
              "system",
              val ? "オンライン接続" : "オフラインモード起動",
              val 
                ? "インターネット接続に復帰しました。タイムラインやメッセージが同期されました。" 
                : "オフラインモードをシミュレートしています。投稿の下書き作成が可能です。"
            );
          }}
          onLogout={() => {
            setUser(null);
            addNotification("system", "ログアウト完了", "セッションを終了しました。");
          }}
          searchQuery={searchQuery}
          setSearchQuery={(query) => {
            setSearchQuery(query);
            if (activeTab !== "search") {
              setActiveTab("search");
            }
          }}
          onNavigate={setActiveTab}
          onMarkNotificationRead={(id) => {
            setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
          }}
        />

        {/* MAIN BODY: SIDEBAR NAV + CENTRAL DISPLAY VIEW */}
        <div className="flex-1 flex flex-col sm:flex-row relative">
          
          <Sidebar 
            user={user}
            activeTab={activeTab} 
            onNavigate={(tab) => {
              setActiveTab(tab);
              // Auto notify user of section jumps
              if (tab === "admin" && user.role === UserRole.STUDENT) {
                addNotification("system", "アクセス制限", "管理者用ダッシュボードの権限がありません。");
              }
            }}
            notificationsCount={unreadNotificationsCount}
          />

          <main id="main-content-viewport" className="flex-1 overflow-y-auto">
            {renderActiveView()}
          </main>

        </div>

        {/* REAL-TIME FLOATING TOASTER NOTIFICATION BANNERS */}
        <div id="toast-container" className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
          {banners.map(banner => (
            <div
              key={banner.id}
              className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex items-start gap-3 pointer-events-auto animate-slide-in relative"
            >
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-extrabold text-slate-850 dark:text-slate-100">{banner.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{banner.body}</p>
              </div>
              <button
                type="button"
                onClick={() => removeBanner(banner.id)}
                className="absolute top-2.5 right-2.5 p-1 text-slate-350 hover:text-slate-500 rounded-full cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
