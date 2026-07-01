/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole, Post, Comment, Timetable, Homework, PrintHandout, Poll, ClubActivity, ClubAnnouncement, PhotoAlbum, ChatMessage, ChatChannel, CalendarEvent, AppNotification, SchoolAnnouncement } from "../types";

export const MOCK_USERS: UserProfile[] = [
  {
    uid: "current_user_id",
    name: "山田 太郎",
    email: "epicmrbt@gmail.com",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    grade: "2年",
    className: "1組",
    bio: "2年1組の山田です！Google Campusでクラスの連絡を共有しましょう！",
    role: UserRole.STUDENT,
    joinedAt: "2026-04-01T08:00:00Z"
  },
  {
    uid: "user_sato",
    name: "佐藤 美咲",
    email: "sato.misaki@g.campus.edu",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    grade: "2年",
    className: "1組",
    bio: "音楽が好きな人と繋がりたいです！よろしくお願いします！",
    role: UserRole.STUDENT,
    joinedAt: "2026-04-01T08:15:00Z"
  },
  {
    uid: "user_suzuki",
    name: "鈴木 翔太",
    email: "suzuki.shota@g.campus.edu",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    grade: "2年",
    className: "2組",
    bio: "鈴木です。ウイイレと読書が趣味。他クラスの人とも仲良くしたいです！",
    role: UserRole.STUDENT,
    joinedAt: "2026-04-02T09:30:00Z"
  },
  {
    uid: "user_takahashi",
    name: "高橋 健二 (先生)",
    email: "takahashi.teacher@g.campus.edu",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    grade: "2年",
    className: "1組",
    bio: "2年1組担任＆数学科教諭の高橋です。連絡事項やプリント共有にこのSNSを活用してください。",
    role: UserRole.TEACHER,
    joinedAt: "2026-03-15T12:00:00Z"
  },
  {
    uid: "user_tanaka",
    name: "田中 真理子 (先生)",
    email: "tanaka.teacher@g.campus.edu",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    grade: "2年",
    className: "2組",
    bio: "2年2組担任の田中です。英語を担当しています。質問等があればお気軽にチャットしてくださいね。",
    role: UserRole.TEACHER,
    joinedAt: "2026-03-16T14:20:00Z"
  },
  {
    uid: "user_admin",
    name: "学校事務局 (管理者)",
    email: "admin@g.campus.edu",
    photoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80",
    grade: "本部",
    className: "事務局",
    bio: "Google Campusの総合運営アカウントです。利用規約、通報対応、全校掲示板の管理を行っています。",
    role: UserRole.ADMIN,
    joinedAt: "2026-01-10T09:00:00Z"
  }
];

// すべての投稿の中身はすべて消して
export const MOCK_POSTS: Post[] = [];

export const MOCK_TIMETABLES: { [className: string]: Timetable } = {
  "1組": {
    "月": [
      { period: 1, subject: "国語総合", teacher: "佐藤先生", room: "2-1教室" },
      { period: 2, subject: "数学II", teacher: "高橋先生", room: "2-1教室" },
      { period: 3, subject: "コミュニケーション英語", teacher: "田中先生", room: "LL教室" },
      { period: 4, subject: "物理基礎", teacher: "渡辺先生", room: "物理室" },
      { period: 5, subject: "体育", teacher: "小林先生", room: "体育館" },
      { period: 6, subject: "LHR", teacher: "高橋先生", room: "2-1教室" }
    ],
    "火": [
      { period: 1, subject: "化学基礎", teacher: "山本先生", room: "化学室" },
      { period: 2, subject: "国語総合", teacher: "佐藤先生", room: "2-1教室" },
      { period: 3, subject: "世界史B", teacher: "中村先生", room: "2-1教室" },
      { period: 4, subject: "数学II", teacher: "高橋先生", room: "2-1教室" },
      { period: 5, subject: "英語表現", teacher: "田中先生", room: "2-1教室" },
      { period: 6, subject: "美術II", teacher: "井上先生", room: "美術室" }
    ],
    "水": [
      { period: 1, subject: "数学II", teacher: "高橋先生", room: "2-1教室" },
      { period: 2, subject: "コミュニケーション英語", teacher: "田中先生", room: "LL教室" },
      { period: 3, subject: "物理基礎", teacher: "渡辺先生", room: "2-1教室" },
      { period: 4, subject: "現代社会", teacher: "木村先生", room: "2-1教室" },
      { period: 5, subject: "保健", teacher: "小林先生", room: "2-1教室" },
      { period: 6, subject: "総合探究", teacher: "高橋先生", room: "2-1教室" }
    ],
    "木": [
      { period: 1, subject: "世界史B", teacher: "中村先生", room: "2-1教室" },
      { period: 2, subject: "化学基礎", teacher: "山本先生", room: "化学室" },
      { period: 3, subject: "国語総合", teacher: "佐藤先生", room: "2-1教室" },
      { period: 4, subject: "体育", teacher: "小林先生", room: "グラウンド" },
      { period: 5, subject: "数学II", teacher: "高橋先生", room: "2-1教室" },
      { period: 6, subject: "英語表現", teacher: "田中先生", room: "2-1教室" }
    ],
    "金": [
      { period: 1, subject: "コミュニケーション英語", teacher: "田中先生", room: "2-1教室" },
      { period: 2, subject: "現代社会", teacher: "木村先生", room: "2-1教室" },
      { period: 3, subject: "数学II", teacher: "高橋先生", room: "2-1教室" },
      { period: 4, subject: "国語総合", teacher: "佐藤先生", room: "2-1教室" },
      { period: 5, subject: "古典", teacher: "鈴木先生", room: "2-1教室" },
      { period: 6, subject: "情報I", teacher: "加藤先生", room: "PC教室" }
    ]
  },
  "2組": {
    "月": [
      { period: 1, subject: "コミュニケーション英語", teacher: "田中先生", room: "2-2教室" },
      { period: 2, subject: "現代社会", teacher: "木村先生", room: "2-2教室" },
      { period: 3, subject: "数学II", teacher: "高橋先生", room: "2-2教室" },
      { period: 4, subject: "国語総合", teacher: "佐藤先生", room: "2-2教室" },
      { period: 5, subject: "情報I", teacher: "加藤先生", room: "PC教室" },
      { period: 6, subject: "LHR", teacher: "田中先生", room: "2-2教室" }
    ]
  },
  "3組": {
    "月": [
      { period: 1, subject: "数学II", teacher: "高橋先生", room: "2-3教室" },
      { period: 2, subject: "国語総合", teacher: "佐藤先生", room: "2-3教室" },
      { period: 3, subject: "情報I", teacher: "加藤先生", room: "PC教室" },
      { period: 4, subject: "物理基礎", teacher: "渡辺先生", room: "物理室" },
      { period: 5, subject: "総合探究", teacher: "鈴木先生", room: "2-3教室" },
      { period: 6, subject: "LHR", teacher: "木村先生", room: "2-3教室" }
    ]
  }
};

export const MOCK_HOMEWORKS: Homework[] = [];
export const MOCK_PRINTS: PrintHandout[] = [];
export const MOCK_POLLS: Poll[] = [];

// 写真共有の中身も消して
export const MOCK_ALBUMS: PhotoAlbum[] = [];

// メッセージ一覧のユーザーも消して
export const MOCK_CHANNELS: ChatChannel[] = [];
export const MOCK_CHAT_MESSAGES: { [channelId: string]: ChatMessage[] } = {};

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [];
export const MOCK_NOTIFICATIONS: AppNotification[] = [];
export const MOCK_COMMENTS: { [postId: string]: Comment[] } = {};

export const MOCK_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: "ann_1",
    title: "Google Campus 稼働開始",
    content: "学校内の新しいデジタルコミュニケーション空間です。マナーを守ってご利用ください。",
    createdAt: "2026-06-30T09:00:00Z",
    authorName: "学校事務局 (管理者)",
    scope: "all"
  }
];

export const MOCK_CLUB_ANNOUNCEMENTS: ClubAnnouncement[] = [];
export const MOCK_CLUB_ACTIVITIES: ClubActivity[] = [];
