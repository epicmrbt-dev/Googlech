/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, ClubActivity, ClubAnnouncement } from "../types";
import { 
  MOCK_USERS,
  MOCK_CLUB_ACTIVITIES, 
  MOCK_CLUB_ANNOUNCEMENTS 
} from "../data/mockData";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Check, 
  X, 
  Megaphone, 
  Users, 
  Film, 
  Image, 
  MessageCircle, 
  Send,
  Plus,
  Clock
} from "lucide-react";

interface ClubCommunityViewProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

interface ForumTopic {
  id: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
  likes: number;
}

export default function ClubCommunityView({ user, isOnline, onAddNotification }: ClubCommunityViewProps) {
  // Club selection (Default to user's club or Football)
  const currentClubName = user.clubName || "サッカー部";
  const [selectedClub, setSelectedClub] = useState<string>(currentClubName);
  const [activeSubTab, setActiveSubTab] = useState<"announcements" | "activities" | "members" | "forum" | "media">("activities");

  // Dynamic States
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>(
    MOCK_CLUB_ANNOUNCEMENTS.filter(a => a.clubName === selectedClub)
  );
  const [activities, setActivities] = useState<ClubActivity[]>(
    MOCK_CLUB_ACTIVITIES.filter(a => a.clubName === selectedClub)
  );
  
  // Members list filtered by selected club
  const clubMembers = MOCK_USERS.filter(u => u.clubName === selectedClub);

  // Club Forum state
  const [forumTopics, setForumTopics] = useState<ForumTopic[]>([
    {
      id: "topic_1",
      authorName: "鈴木 翔太",
      authorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      content: "来月の大会用の新ユニフォーム、背番号の希望をまだマネージャーに伝えてない人は、今日中に連絡をお願いします！",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 4
    }
  ]);
  const [newTopicContent, setNewTopicContent] = useState("");

  // RSVP handler
  const handleRSVP = (activityId: string, status: "attend" | "absent") => {
    setActivities(activities.map(act => {
      if (act.id === activityId) {
        let updatedAttendees = [...act.attendees];
        let updatedAbsentees = [...act.absentees];

        if (status === "attend") {
          if (!updatedAttendees.includes(user.uid)) {
            updatedAttendees.push(user.uid);
            updatedAbsentees = updatedAbsentees.filter(uid => uid !== user.uid);
            onAddNotification("club", "出席を登録しました", `活動「${act.title}」への【出席】を申請しました。`);
          }
        } else {
          if (!updatedAbsentees.includes(user.uid)) {
            updatedAbsentees.push(user.uid);
            updatedAttendees = updatedAttendees.filter(uid => uid !== user.uid);
            onAddNotification("club", "欠席を登録しました", `活動「${act.title}」への【欠席】を申請しました。`);
          }
        }

        return { ...act, attendees: updatedAttendees, absentees: updatedAbsentees };
      }
      return act;
    }));
  };

  // Submit Forum Post
  const handlePostForum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicContent.trim()) return;

    const newTopic: ForumTopic = {
      id: `topic_${Date.now()}`,
      authorName: user.name,
      authorPhoto: user.photoUrl,
      content: newTopicContent,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setForumTopics([newTopic, ...forumTopics]);
    setNewTopicContent("");
    onAddNotification("club", "掲示板に投稿しました", "部活動掲示板にメッセージを投稿しました。");
  };

  const handleLikeTopic = (topicId: string) => {
    setForumTopics(forumTopics.map(t => {
      if (t.id === topicId) {
        return { ...t, likes: t.likes + 1 };
      }
      return t;
    }));
  };

  return (
    <div id="club-community-viewport" className="p-4 md:p-6 pb-20 sm:pb-6 space-y-6">
      
      {/* Club Switcher Hub top section */}
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800/60 p-2 rounded-2xl">
        <div className="flex gap-1">
          {["サッカー部", "吹奏楽部", "美術部"].map(club => (
            <button
              key={club}
              type="button"
              onClick={() => {
                setSelectedClub(club);
                setAnnouncements(MOCK_CLUB_ANNOUNCEMENTS.filter(a => a.clubName === club));
                setActivities(MOCK_CLUB_ACTIVITIES.filter(a => a.clubName === club));
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedClub === club
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {club}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 font-bold hidden sm:inline mr-2">部活動コミュニティ</span>
      </div>

      {/* Banner design representing active club */}
      <div className="bg-linear-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-emerald-200" />
            <h1 className="text-2xl font-extrabold tracking-tight">{selectedClub} ポータル</h1>
          </div>
          <p className="text-emerald-100 text-xs mt-1">活動予定、出欠申請（RSVP）、連絡事項、メンバー台帳、専用写真共有がまとまっています。</p>
        </div>

        <div className="flex gap-4 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xs text-xs">
          <div>
            <span className="block opacity-75 font-medium">登録部員</span>
            <span className="text-base font-bold">{clubMembers.length} 名</span>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <span className="block opacity-75 font-medium">今後の活動</span>
            <span className="text-base font-bold">{activities.length} 件</span>
          </div>
        </div>
      </div>

      {/* SUB MENU TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("activities")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "activities"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
          活動・練習予定
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("announcements")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "announcements"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5 inline mr-1.5" />
          部活お知らせ
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("members")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "members"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Users className="h-3.5 w-3.5 inline mr-1.5" />
          部員一覧 ({clubMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("forum")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "forum"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5 inline mr-1.5" />
          部活掲示板
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("media")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "media"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Film className="h-3.5 w-3.5 inline mr-1.5" />
          写真・動画共有
        </button>
      </div>

      {/* CORE DISPLAY PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xs">
        
        {/* ACTIVITIES GRID / RSVP OUTCOME */}
        {activeSubTab === "activities" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">出欠確認・活動スケジュール</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-2 text-center py-6">活動予定は登録されていません</p>
              ) : (
                activities.map(act => {
                  const hasAttended = act.attendees.includes(user.uid);
                  const hasAbsented = act.absentees.includes(user.uid);

                  return (
                    <div key={act.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-850">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full ${
                            act.type === "match" 
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" 
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                          }`}>
                            {act.type === "match" ? "試合" : "通常練習"}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {act.date}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-2">{act.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">{act.description}</p>
                        
                        <div className="mt-3.5 space-y-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>時間: {act.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>場所: {act.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Attend / Absent Toggle button sets */}
                      <div className="pt-3 border-t border-slate-150 dark:border-slate-800/80 mt-3.5 flex items-center justify-between">
                        <div className="text-[10px] text-slate-400 flex gap-2">
                          <span>出席: {act.attendees.length}人</span>
                          <span>欠席: {act.absentees.length}人</span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRSVP(act.id, "attend")}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                              hasAttended
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>出席</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRSVP(act.id, "absent")}
                            className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                              hasAbsented
                                ? "bg-rose-600 text-white shadow-sm"
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-600 hover:bg-rose-50"
                            }`}
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>欠席</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS VIEW */}
        {activeSubTab === "announcements" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">公式お知らせ・コーチからの伝達</h2>
            <div className="space-y-3">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">部活動向けのお知らせはありません</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="p-4 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-slate-850 dark:text-slate-200 text-sm flex items-center gap-1.5">
                        <Megaphone className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                        {ann.title}
                      </p>
                      <span className="text-[10px] text-slate-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed pl-1">{ann.content}</p>
                    <p className="text-[10px] text-slate-400 text-right font-medium">投稿者: {ann.authorName}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MEMBERS LIST REGISTER */}
        {activeSubTab === "members" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">所属メンバー台帳</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {clubMembers.map(member => (
                <div key={member.uid} className="p-3 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/10">
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{member.name}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{member.grade} {member.className}</p>
                    <span className="text-[8px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 px-1.5 py-0.2 rounded-sm font-bold inline-block mt-1">
                      {member.role === UserRole.TEACHER ? "顧問" : "部員"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLUB DISCUSSION FORUM */}
        {activeSubTab === "forum" && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">部活動掲示板・対話スレッド</h2>
            
            <form onSubmit={handlePostForum} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="部員に何かメッセージを書き込みます..."
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                className="flex-grow text-xs px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-2.5 bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-emerald-750 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="space-y-3">
              {forumTopics.map(topic => (
                <div key={topic.id} className="p-3.5 border border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={topic.authorPhoto}
                        alt={topic.authorName}
                        referrerPolicy="no-referrer"
                        className="w-5.5 h-5.5 rounded-full object-cover border"
                      />
                      <span className="font-bold text-slate-700 dark:text-slate-200">{topic.authorName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1">{topic.content}</p>
                  
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleLikeTopic(topic.id)}
                      className="flex items-center gap-1 hover:text-emerald-500 cursor-pointer"
                    >
                      <span>👍</span>
                      <span>{topic.likes} いいね</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHOTOS & VIDEOS GALLERY */}
        {activeSubTab === "media" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">部活メディアライブラリ</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&auto=format&fit=crop&q=80"
              ].map((url, index) => (
                <div key={index} className="relative rounded-2xl overflow-hidden group border border-slate-200 dark:border-slate-800 h-36 bg-slate-100">
                  <img
                    src={url}
                    alt="Club Media"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate font-medium">投稿部員: 山田 太郎</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
