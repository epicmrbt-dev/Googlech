/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  ADMIN = "admin"
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoUrl: string;
  grade: string;       // e.g. "1年", "2年", "3年"
  className: string;   // e.g. "1組", "2組", "3組"
  clubName?: string;   // e.g. "サッカー部", "吹奏楽部"
  bio: string;
  role: UserRole;
  joinedAt: string;
}

export interface Attachment {
  type: "image" | "video" | "file";
  url: string;
  name: string;
  size?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  likes: string[]; // array of uids
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  authorRole: UserRole;
  content: string;
  attachments: Attachment[];
  tags: string[];
  mentions: string[];
  className?: string; // empty means school-wide, otherwise specific to a class
  createdAt: string;
  updatedAt?: string;
  likes: string[]; // list of user Uids
  bookmarks: string[]; // list of user Uids
  commentsCount: number;
  isReported?: boolean;
  reportReason?: string;
}

export interface TimetablePeriod {
  period: number; // 1 to 6
  subject: string;
  teacher: string;
  room?: string;
}

export interface Timetable {
  [day: string]: TimetablePeriod[]; // "Mon", "Tue", etc.
}

export interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  className: string;
  authorName: string;
  submittedUids: string[];
}

export interface PrintHandout {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  className: string;
  createdAt: string;
}

export interface AttendanceReport {
  id: string;
  studentUid: string;
  studentName: string;
  className: string;
  date: string;
  status: "欠席" | "遅刻" | "早退";
  reason: string;
  createdAt: string;
  teacherVerified: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // uids of voters
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  className?: string; // empty means school-wide
  authorName: string;
  createdAt: string;
  deadline: string;
  isAnonymous: boolean;
  isMultipleChoice: boolean;
}

export interface ClubActivity {
  id: string;
  clubName: string;
  title: string; // e.g. "合同練習", "公式戦"
  type: "practice" | "match" | "other";
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: string[]; // uids
  absentees: string[]; // uids
}

export interface ClubAnnouncement {
  id: string;
  clubName: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  photos: {
    id: string;
    url: string;
    uploadedBy: string;
    createdAt: string;
    likes: string[];
    commentsCount: number;
  }[];
  category: string; // e.g. "体育祭", "文化祭", "修学旅行"
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderPhoto: string;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
  readBy: string[]; // uids
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "direct" | "group" | "class" | "club";
  memberUids: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  photoUrl?: string;
  targetId?: string; // e.g., class name or club name for auto-channeling
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type?: "school" | "exam" | "homework" | "club" | "personal" | "school_event";
  category?: "school" | "exam" | "homework" | "club" | "personal" | "school_event";
  className?: string;
  clubName?: string;
  description: string;
  isSyncedWithGoogle?: boolean;
  time?: string;
  location?: string;
  authorName?: string;
}

export interface AppNotification {
  id: string;
  type: "post" | "comment" | "like" | "mention" | "poll" | "announcement" | "chat" | "club";
  title: string;
  body: string;
  targetPath: string; // view state or ID
  createdAt: string;
  isRead: boolean;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  scope: "all" | "teachers";
}

