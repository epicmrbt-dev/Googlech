/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, UserRole, Post, Comment, Attachment } from "../types";
import { MOCK_USERS } from "../data/mockData";
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Send, 
  Image, 
  File, 
  Smile, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Hash, 
  AtSign, 
  Megaphone, 
  Clock, 
  Calendar, 
  CloudLightning, 
  ChevronRight,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { addPost, updatePost, deletePost, addComment, updateComment } from "../lib/firebase";

interface HomeTimelineProps {
  user: UserProfile;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  comments: { [postId: string]: Comment[] };
  setComments: React.Dispatch<React.SetStateAction<{ [postId: string]: Comment[] }>>;
  isOnline: boolean;
  onNavigate: (tab: string) => void;
  onAddNotification: (type: string, title: string, body: string) => void;
}

interface DraftPost {
  id: string;
  content: string;
  attachments: Attachment[];
  tags: string[];
  mentions: string[];
  className?: string;
  createdAt: string;
}

export default function HomeTimeline({
  user,
  posts,
  setPosts,
  comments,
  setComments,
  isOnline,
  onNavigate,
  onAddNotification
}: HomeTimelineProps) {
  // Post Creator State
  const [newContent, setNewContent] = useState(() => {
    return localStorage.getItem(`google_campus_autosave_post_${user.uid}`) || "";
  });
  const [selectedClass, setSelectedClass] = useState<string>("all"); // 'all', 'class-only', 'school-wide'
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [selectedMention, setSelectedMention] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // Timeline Filtering/Searching State
  const [timelineFilter, setTimelineFilter] = useState<string>("all"); // 'all', 'class', 'admin'
  const [timelineSearch, setTimelineSearch] = useState("");

  // Editing State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Comment State per post
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>(() => {
    const saved = localStorage.getItem(`google_campus_autosave_comments_${user.uid}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });
  const [replyInputs, setReplyInputs] = useState<{ [commentId: string]: string }>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [showCommentsForPost, setShowCommentsForPost] = useState<{ [postId: string]: boolean }>({});

  // Menu Options Dropdown
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Offline Drafts State
  const [drafts, setDrafts] = useState<DraftPost[]>([]);

  // Emoji preset list
  const emojiPresets = ["👍", "🙌", "😊", "🎉", "📝", "⚽", "🎺", "💻", "🔥", "🏫"];

  // Device-based autosave for new post content
  useEffect(() => {
    localStorage.setItem(`google_campus_autosave_post_${user.uid}`, newContent);
  }, [newContent, user.uid]);

  // Device-based autosave for comments
  useEffect(() => {
    localStorage.setItem(`google_campus_autosave_comments_${user.uid}`, JSON.stringify(commentInputs));
  }, [commentInputs, user.uid]);

  // Load and save drafts to localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem(`google_campus_drafts_${user.uid}`);
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, [user.uid]);

  const saveDraftsToStorage = (newDrafts: DraftPost[]) => {
    setDrafts(newDrafts);
    localStorage.setItem(`google_campus_drafts_${user.uid}`, JSON.stringify(newDrafts));
  };

  // Drag and Drop simulation handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const newAttachments: Attachment[] = files.map((file: any) => {
        const isImg = file.type.startsWith("image/");
        const isVid = file.type.startsWith("video/");
        return {
          type: isImg ? "image" : isVid ? "video" : "file",
          name: file.name,
          url: isImg 
            ? "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80" 
            : "#",
          size: `${Math.round(file.size / 1024)} KB`
        };
      });
      setSelectedAttachments([...selectedAttachments, ...newAttachments]);
    }
  };

  const handleSimulateAttachment = (type: "image" | "video" | "file") => {
    let mockAttach: Attachment;
    if (type === "image") {
      mockAttach = {
        type: "image",
        name: `キャンパス写真_${Date.now().toString().slice(-4)}.jpg`,
        url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80"
      };
    } else if (type === "video") {
      mockAttach = {
        type: "video",
        name: `部活動画_${Date.now().toString().slice(-4)}.mp4`,
        url: "#"
      };
    } else {
      mockAttach = {
        type: "file",
        name: `配布資料_${Date.now().toString().slice(-4)}.pdf`,
        url: "#",
        size: "1.2 MB"
      };
    }
    setSelectedAttachments([...selectedAttachments, mockAttach]);
  };

  const addTag = () => {
    if (tagInput && !selectedTags.includes(tagInput)) {
      setSelectedTags([...selectedTags, tagInput.trim().replace("#", "")]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setSelectedTags(selectedTags.filter((_, i) => i !== index));
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() && selectedAttachments.length === 0) return;

    if (!isOnline) {
      // Create Offline Draft
      const newDraft: DraftPost = {
        id: `draft_${Date.now()}`,
        content: newContent,
        attachments: selectedAttachments,
        tags: selectedTags,
        mentions: selectedMention ? [selectedMention] : [],
        className: selectedClass === "class-only" ? user.className : undefined,
        createdAt: new Date().toISOString()
      };
      const updatedDrafts = [newDraft, ...drafts];
      saveDraftsToStorage(updatedDrafts);
      
      // Notify
      onAddNotification("post", "下書きを保存しました", "オフラインのため、投稿は下書きに保存されました。オンライン時に同期できます。");
      
      // Reset
      setNewContent("");
      setSelectedAttachments([]);
      setSelectedTags([]);
      setSelectedMention("");
      return;
    }

    // Create Real Post in Firestore or Local Fallback
    const postPayload = {
      authorUid: user.uid,
      authorName: user.name,
      authorPhoto: user.photoUrl,
      authorRole: user.role,
      content: newContent,
      attachments: selectedAttachments,
      tags: selectedTags,
      mentions: selectedMention ? [selectedMention] : [],
      className: selectedClass === "class-only" ? user.className : undefined,
      createdAt: new Date().toISOString(),
      likes: [],
      bookmarks: [],
      commentsCount: 0
    };

    addPost(postPayload).then(() => {
      onAddNotification("post", "新規投稿が共有されました", "あなたの投稿がキャンパスタイムラインに追加されました。");
    }).catch(err => {
      console.error("Failed to add post to Firestore:", err);
      // fallback
      const newPost: Post = { id: `post_${Date.now()}`, ...postPayload };
      setPosts([newPost, ...posts]);
      setComments(prev => ({ ...prev, [newPost.id]: [] }));
    });

    // Reset Inputs
    setNewContent("");
    setSelectedAttachments([]);
    setSelectedTags([]);
    setSelectedMention("");
    setSelectedClass("all");
    localStorage.removeItem(`google_campus_autosave_post_${user.uid}`);
  };

  const syncDraft = async (draftId: string) => {
    if (!isOnline) return;
    const draft = drafts.find(d => d.id === draftId);
    if (!draft) return;

    const postPayload = {
      authorUid: user.uid,
      authorName: user.name,
      authorPhoto: user.photoUrl,
      authorRole: user.role,
      content: draft.content,
      attachments: draft.attachments,
      tags: draft.tags,
      mentions: draft.mentions,
      className: draft.className,
      createdAt: draft.createdAt,
      likes: [],
      bookmarks: [],
      commentsCount: 0
    };

    try {
      await addPost(postPayload);
      // Remove from drafts
      const remaining = drafts.filter(d => d.id !== draftId);
      saveDraftsToStorage(remaining);
      onAddNotification("post", "下書きの同期が完了しました", "オフライン時の下書きが正常に投稿されました。");
    } catch (err) {
      console.error(err);
    }
  };

  const syncAllDrafts = async () => {
    if (!isOnline || drafts.length === 0) return;
    
    try {
      for (const draft of drafts) {
        await addPost({
          authorUid: user.uid,
          authorName: user.name,
          authorPhoto: user.photoUrl,
          authorRole: user.role,
          content: draft.content,
          attachments: draft.attachments,
          tags: draft.tags,
          mentions: draft.mentions,
          className: draft.className,
          createdAt: draft.createdAt,
          likes: [],
          bookmarks: [],
          commentsCount: 0
        });
      }
      saveDraftsToStorage([]);
      onAddNotification("post", "すべての下書きを同期しました", `${drafts.length}件の投稿がタイムラインに反映されました。`);
    } catch (err) {
      console.error(err);
    }
  };

  // Like Toggle
  const handleLike = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = post.likes.includes(user.uid);
    const newLikes = isLiked 
      ? post.likes.filter(uid => uid !== user.uid)
      : [...post.likes, user.uid];

    if (isOnline) {
      try {
        await updatePost(postId, { likes: newLikes });
        if (!isLiked && post.authorUid !== user.uid) {
          onAddNotification("like", "投稿にいいね！されました", `${user.name}さんがあなたの投稿にいいね！しました。`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
    }
  };

  // Bookmark Toggle
  const handleBookmark = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isBookmarked = post.bookmarks.includes(user.uid);
    const newBookmarks = isBookmarked
      ? post.bookmarks.filter(uid => uid !== user.uid)
      : [...post.bookmarks, user.uid];

    if (isOnline) {
      try {
        await updatePost(postId, { bookmarks: newBookmarks });
      } catch (err) {
        console.error(err);
      }
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, bookmarks: newBookmarks } : p));
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (isOnline) {
      try {
        await deletePost(postId);
      } catch (err) {
        console.error(err);
      }
    } else {
      setPosts(posts.filter(p => p.id !== postId));
    }
    setOpenMenuPostId(null);
  };

  // Edit Post Trigger
  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setOpenMenuPostId(null);
  };

  const handleSaveEdit = async (postId: string) => {
    if (isOnline) {
      try {
        await updatePost(postId, { content: editContent, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.error(err);
      }
    } else {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, content: editContent, updatedAt: new Date().toISOString() };
        }
        return p;
      }));
    }
    setEditingPostId(null);
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    const input = commentInputs[postId];
    if (!input || !input.trim()) return;

    const commentPayload = {
      postId,
      authorUid: user.uid,
      authorName: user.name,
      authorPhoto: user.photoUrl,
      authorRole: user.role,
      content: input,
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };

    if (isOnline) {
      try {
        await addComment(commentPayload);
        const post = posts.find(p => p.id === postId);
        if (post && post.authorUid !== user.uid) {
          onAddNotification("comment", "新しいコメントが届きました", `${user.name}さんがあなたの投稿にコメントしました。`);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const newComment: Comment = {
        id: `comm_${Date.now()}`,
        ...commentPayload
      };
      const postComments = comments[postId] || [];
      setComments({
        ...comments,
        [postId]: [...postComments, newComment]
      });

      // Update comment counts
      setPosts(posts.map(p => {
        if (p.id === postId) {
          if (p.authorUid !== user.uid) {
            onAddNotification("comment", "新しいコメントが届きました", `${user.name}さんがあなたの投稿にコメントしました。`);
          }
          return { ...p, commentsCount: p.commentsCount + 1 };
        }
        return p;
      }));
    }

    // Clear comment input and its autosave
    const updatedInputs = { ...commentInputs, [postId]: "" };
    setCommentInputs(updatedInputs);
    localStorage.setItem(`google_campus_autosave_comments_${user.uid}`, JSON.stringify(updatedInputs));
  };

  // Add Reply
  const handleAddReply = async (postId: string, commentId: string) => {
    const input = replyInputs[commentId];
    if (!input || !input.trim()) return;

    const newReply = {
      id: `rep_${Date.now()}`,
      authorUid: user.uid,
      authorName: user.name,
      authorPhoto: user.photoUrl,
      authorRole: user.role,
      content: input,
      createdAt: new Date().toISOString(),
      likes: []
    };

    const postComments = comments[postId] || [];
    const updatedComments = postComments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    if (isOnline) {
      try {
        const commentToUpdate = postComments.find(c => c.id === commentId);
        if (commentToUpdate) {
          const replies = [...(commentToUpdate.replies || []), newReply];
          await updateComment(commentId, { replies });
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setComments({
        ...comments,
        [postId]: updatedComments
      });
    }

    // Clear reply input
    setReplyInputs({ ...replyInputs, [commentId]: "" });
    setActiveReplyBoxId(null);
  };

  // Flag / Report Post (Admin/Audit feature!)
  const handleReportPost = async (postId: string, reason: string) => {
    if (isOnline) {
      try {
        await updatePost(postId, { isReported: true, reportReason: reason });
      } catch (err) {
        console.error(err);
      }
    } else {
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return { ...p, isReported: true, reportReason: reason };
        }
        return p;
      }));
    }
    setOpenMenuPostId(null);
    onAddNotification("club", "投稿を通報しました", "不適切な可能性がある投稿としてモデレータに通報されました。審査が行われます。");
  };

  // Filter posts based on tab switcher and search queries
  const filteredPosts = posts.filter(post => {
    // 1. Tab switching filters
    if (timelineFilter === "class" && post.className !== user.className) return false;
    if (timelineFilter === "admin" && post.authorRole !== UserRole.ADMIN) return false;

    // 2. ClassCommunity specific filter
    if (selectedClass === "class-only" && post.className !== user.className) {
      // Just showing in creator
    }

    // 3. Search query filters (text, tag, author, mention)
    if (timelineSearch) {
      const searchLower = timelineSearch.toLowerCase();
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      const tagMatch = post.tags.some(t => t.toLowerCase().includes(searchLower));
      const authorMatch = post.authorName.toLowerCase().includes(searchLower);
      const mentionMatch = post.mentions.some(m => m.toLowerCase().includes(searchLower));
      
      return contentMatch || tagMatch || authorMatch || mentionMatch;
    }

    return true;
  });

  // Calculate Popular Posts (Most likes)
  const popularPosts = [...posts]
    .sort((a, b) => b.likes.length - a.likes.length)
    .slice(0, 3);

  // Get announcements (Admin or Important tags)
  const schoolAnnouncements = posts.filter(p => 
    p.authorRole === UserRole.ADMIN || p.tags.includes("お知らせ")
  ).slice(0, 2);

  return (
    <div id="home-timeline-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 pb-20 sm:pb-6">
      
      {/* LEFT & CENTER: Feed & Publisher (Spans 8 cols on desktop) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Connection Offline Bar / Draft Panel */}
        {drafts.length > 0 && (
          <div id="offline-drafts-alert" className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3 items-start">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">未送信の下書きが {drafts.length} 件あります</p>
                <p className="text-xs text-amber-600 dark:text-amber-400/80">オフライン時に作成された投稿をローカルに一時保存しています。オンライン時に送信できます。</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={syncAllDrafts}
                disabled={!isOnline}
                className="flex-1 md:flex-none px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>すべて同期</span>
              </button>
            </div>
          </div>
        )}

        {/* POST PUBLISHER FORM */}
        <div id="post-publisher" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div className="flex gap-3 items-start">
              <img
                src={user.photoUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1">
                <textarea
                  id="publisher-textarea"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder={`${user.name}さん、今日はどのような情報を共有しますか？（タグは # で入力）`}
                  className="w-full min-h-[90px] border-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0 bg-transparent resize-none focus:outline-hidden"
                />
              </div>
            </div>

            {/* Drag & Drop attachment container with high interactive hover effects */}
            {selectedAttachments.length > 0 && (
              <div id="publisher-attachments-preview" className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                {selectedAttachments.map((file, idx) => (
                  <div key={idx} className="relative p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    {file.type === "image" ? (
                      <Image className="h-5 w-5 text-blue-500 shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-emerald-500 shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                      {file.size && <span className="text-[10px] text-slate-400">{file.size}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachments(selectedAttachments.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-xs cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag & Drop Visual Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-3.5 text-center transition-all ${
                dragActive 
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" 
                  : "border-transparent bg-transparent"
              }`}
            >
              {dragActive && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">ファイルをここにドロップして追加</p>
              )}
            </div>

            {/* Tags and Mentions Tray */}
            <div className="flex flex-wrap gap-2.5 items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              
              {/* Publisher Attachment Simulation buttons */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment("image")}
                  className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="画像を添付"
                >
                  <Image className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline">画像</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateAttachment("file")}
                  className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg flex items-center gap-1 text-xs font-medium cursor-pointer"
                  title="ファイルを添付"
                >
                  <File className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline">PDF資料</span>
                </button>

                {/* Scope select */}
                <select
                  id="publisher-scope-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-hidden text-slate-700 dark:text-slate-300"
                >
                  <option value="all">全校に公開</option>
                  <option value="class-only">{user.className}専用</option>
                </select>

                {/* Quick Emoji Buttons */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg flex items-center gap-1 text-xs font-medium cursor-pointer"
                    title="絵文字"
                  >
                    <Smile className="h-4.5 w-4.5" />
                  </button>

                  {showEmojiPicker && (
                    <div className="absolute left-0 bottom-10 z-50 bg-white dark:bg-slate-850 p-2 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 grid grid-cols-5 gap-1 w-44">
                      {emojiPresets.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewContent(newContent + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1 text-base hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Post Trigger */}
              <button
                id="publish-submit-btn"
                type="submit"
                className={`px-4 py-2 font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-98 transition-all ${
                  isOnline 
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10" 
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isOnline ? "共有する" : "下書き保存"}</span>
              </button>
            </div>

            {/* Dynamic Hashtag & Mentions Inputs */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Mentions dropdown select */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                <AtSign className="h-3 w-3 text-slate-400" />
                <select
                  value={selectedMention}
                  onChange={(e) => setSelectedMention(e.target.value)}
                  className="text-[11px] bg-transparent border-none focus:ring-0 p-0 text-slate-600 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="">メンションする人を選択</option>
                  {MOCK_USERS.filter(u => u.uid !== user.uid).map(u => (
                    <option key={u.uid} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>

              {/* Tag builder */}
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                <Hash className="h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="タグ追加..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  className="text-[11px] bg-transparent border-none focus:ring-0 p-1 w-16 text-slate-600 dark:text-slate-300 focus:outline-hidden"
                />
              </div>

              {selectedTags.map((tag, i) => (
                <span key={i} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => removeTag(i)} className="hover:text-red-500 font-extrabold font-mono text-[8px]">x</button>
                </span>
              ))}
            </div>

          </form>
        </div>

        {/* TIMELINE FILTERS TAB LIST */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
            <button
              id="timeline-filter-all"
              type="button"
              onClick={() => setTimelineFilter("all")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timelineFilter === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              すべての投稿
            </button>
            <button
              id="timeline-filter-class"
              type="button"
              onClick={() => setTimelineFilter("class")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timelineFilter === "class"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              クラス専用 ({user.className})
            </button>
            <button
              id="timeline-filter-admin"
              type="button"
              onClick={() => setTimelineFilter("admin")}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timelineFilter === "admin"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
              }`}
            >
              お知らせのみ
            </button>
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline font-mono">
            全 {filteredPosts.length} 件の投稿
          </span>
        </div>

        {/* FEED LIST */}
        <div id="posts-feed-container" className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6">
              <FolderOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">該当する投稿は見つかりませんでした</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">最初の情報をタイムラインに投稿してみましょう！</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const hasLiked = post.likes.includes(user.uid);
              const hasBookmarked = post.bookmarks.includes(user.uid);
              const isAuthor = post.authorUid === user.uid;
              const postComments = comments[post.id] || [];
              const isCommentsVisible = showCommentsForPost[post.id] || false;

              return (
                <div
                  key={post.id}
                  id={`timeline-post-${post.id}`}
                  className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-xs transition-all relative ${
                    post.isReported ? "opacity-60 border-rose-300 bg-rose-50/10" : ""
                  }`}
                >
                  {/* Class Badge Marker */}
                  {post.className && (
                    <span className="absolute top-4 right-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                      {post.className}専用
                    </span>
                  )}

                  {/* Header Author Meta info */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <img
                        src={post.authorPhoto}
                        alt={post.authorName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{post.authorName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                            post.authorRole === UserRole.ADMIN
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                              : post.authorRole === UserRole.TEACHER
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                          }`}>
                            {post.authorRole === UserRole.ADMIN ? "管理者" : post.authorRole === UserRole.TEACHER ? "先生" : "生徒"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(post.createdAt).toLocaleDateString()} {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {post.updatedAt && <span className="text-blue-500">(編集済)</span>}
                        </div>
                      </div>
                    </div>

                    {/* Options popover click */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuPostId === post.id && (
                        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-40 text-xs">
                          {isAuthor ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(post)}
                                className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>編集する</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePost(post.id)}
                                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>削除する</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleReportPost(post.id, "不適切な発言")}
                                className="w-full text-left px-3 py-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-1.5 cursor-pointer font-medium"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>不適切として通報</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content / Edit field */}
                  {editingPostId === post.id ? (
                    <div className="space-y-3 mb-3">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingPostId(null)}
                          className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
                        >
                          キャンセル
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(post.id)}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-line">
                      {/* Scan and color mentions or tags in posts */}
                      {post.content.split(" ").map((word, wIdx) => {
                        if (word.startsWith("#")) {
                          return <span key={wIdx} className="text-blue-600 dark:text-blue-400 font-bold mr-1">{word}</span>;
                        }
                        if (word.startsWith("@")) {
                          return <span key={wIdx} className="text-indigo-600 dark:text-indigo-400 font-bold mr-1">{word}</span>;
                        }
                        return <span key={wIdx}>{word} </span>;
                      })}
                    </div>
                  )}

                  {/* Attachments rendering */}
                  {post.attachments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {post.attachments.map((file, fIdx) => (
                        <div key={fIdx} className="border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/40">
                          {file.type === "image" ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-40 object-cover hover:scale-101 transition-transform"
                            />
                          ) : (
                            <div className="p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <File className="h-6 w-6 text-emerald-500" />
                                <div className="overflow-hidden">
                                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                                  {file.size && <p className="text-[10px] text-slate-400">{file.size}</p>}
                                </div>
                              </div>
                              <a
                                href={file.url}
                                download
                                className="px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:underline"
                              >
                                DLする
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags and mentions badges */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map(t => (
                      <span key={t} className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                    {post.mentions.map(m => (
                      <span key={m} className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-0.5 rounded-full">
                        @{m}
                      </span>
                    ))}
                  </div>

                  {/* Post Stats/Actions bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    <div className="flex gap-4">
                      {/* Like Action */}
                      <button
                        type="button"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                          hasLiked 
                            ? "text-rose-600 dark:text-rose-400 font-bold" 
                            : "text-slate-500 dark:text-slate-400 hover:text-rose-600"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" : ""}`} />
                        <span>{post.likes.length}</span>
                      </button>

                      {/* Comment Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowCommentsForPost({
                          ...showCommentsForPost,
                          [post.id]: !isCommentsVisible
                        })}
                        className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{postComments.length}</span>
                      </button>
                    </div>

                    {/* Bookmark Action */}
                    <button
                      type="button"
                      onClick={() => handleBookmark(post.id)}
                      className={`cursor-pointer transition-colors ${
                        hasBookmarked
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-500 dark:text-slate-400 hover:text-blue-600"
                      }`}
                      title={hasBookmarked ? "ブックマーク解除" : "ブックマーク保存"}
                    >
                      <Bookmark className={`h-4 w-4 ${hasBookmarked ? "fill-blue-500" : ""}`} />
                    </button>
                  </div>

                  {/* COMMENTS BOX */}
                  {isCommentsVisible && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                      
                      {/* Comments Feed list */}
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {postComments.length === 0 ? (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-2">コメントはまだありません。最初のコメントを書き込みましょう！</p>
                        ) : (
                          postComments.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={comment.authorPhoto}
                                      alt={comment.authorName}
                                      referrerPolicy="no-referrer"
                                      className="w-5.5 h-5.5 rounded-full object-cover border"
                                    />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{comment.authorName}</span>
                                    <span className="text-[8px] opacity-75 bg-slate-200 dark:bg-slate-700 px-1 rounded-xs">{comment.authorRole}</span>
                                  </div>
                                  <span className="text-[9px] text-slate-400">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-1">{comment.content}</p>
                                
                                <div className="flex justify-end gap-3 mt-1 text-[10px] text-slate-400">
                                  <button
                                    type="button"
                                    onClick={() => setActiveReplyBoxId(activeReplyBoxId === comment.id ? null : comment.id)}
                                    className="hover:text-blue-500 cursor-pointer"
                                  >
                                    返信する
                                  </button>
                                </div>
                              </div>

                              {/* Nested Replies Rendering */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-6 space-y-2">
                                  {comment.replies.map(rep => (
                                    <div key={rep.id} className="p-2.5 bg-blue-50/20 dark:bg-blue-950/5 border-l-2 border-blue-400 rounded-r-xl text-xs">
                                      <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1.5">
                                          <img
                                            src={rep.authorPhoto}
                                            alt={rep.authorName}
                                            referrerPolicy="no-referrer"
                                            className="w-5 h-5 rounded-full object-cover border"
                                          />
                                          <span className="font-bold text-slate-700 dark:text-slate-300">{rep.authorName}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-400">
                                          {new Date(rep.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{rep.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Nested Reply Box */}
                              {activeReplyBoxId === comment.id && (
                                <div className="pl-6 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="返信を書き込む..."
                                    value={replyInputs[comment.id] || ""}
                                    onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                    className="flex-grow text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddReply(post.id, comment.id)}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                  >
                                    返信
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input Form */}
                      <div className="flex gap-2">
                        <input
                          id={`comment-input-${post.id}`}
                          type="text"
                          placeholder="コメントを追加..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          className="flex-grow text-xs px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 cursor-pointer"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* RIGHT SIDEBAR WIDGETS (Spans 4 cols on desktop) */}
      <div className="lg:col-span-4 space-y-6">

        {/* ANNOUNCEMENT BOARD WIDGET */}
        <div id="widget-announcements" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="h-5 w-5 text-red-500 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">学校全体のお知らせ</h3>
          </div>
          <div className="space-y-3">
            {schoolAnnouncements.length === 0 ? (
              <p className="text-xs text-slate-400">現在のお知らせはありません</p>
            ) : (
              schoolAnnouncements.map(ann => (
                <div key={ann.id} className="p-3 bg-red-50/40 dark:bg-red-950/10 rounded-xl border border-red-100/50 dark:border-red-900/30 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.content}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                    <span>{ann.authorName}</span>
                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TODAY'S EVENTS WIDGET */}
        <div id="widget-today-schedule" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">今日の予定</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("calendar")}
              className="text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
            >
              <span>カレンダー</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs text-slate-400">今日の予定はありません</p>
          </div>
        </div>

        {/* HOT POSTS / TRENDING WIDGET */}
        <div id="widget-popular-posts" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">学内の人気投稿</h3>
          </div>
          <div className="space-y-3">
            {popularPosts.map(p => (
              <div key={p.id} className="text-xs border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-none last:pb-0">
                <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">{p.content}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1.5">
                  <span className="font-semibold text-slate-500">{p.authorName}</span>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                    <span>{p.likes.length} いいね</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE QUICK SEARCH OR HASHTAG CLOUD */}
        <div id="widget-hashtag-cloud" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mb-3">人気ハッシュタグ</h3>
          <div className="flex flex-wrap gap-2">
            {["期末試験", "吹奏楽部", "サッカー部", "ミニコンサート", "お知らせ", "文化祭"].map(hashtag => (
              <button
                key={hashtag}
                type="button"
                onClick={() => setTimelineSearch(hashtag)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
              >
                #{hashtag}
              </button>
            ))}
            {timelineSearch && (
              <button
                type="button"
                onClick={() => setTimelineSearch("")}
                className="text-xs text-rose-600 font-bold hover:underline mt-1 block"
              >
                フィルター解除
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
