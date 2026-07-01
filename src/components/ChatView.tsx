/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { UserProfile, ChatChannel, ChatMessage, Attachment } from "../types";
import { MOCK_CHANNELS, MOCK_CHAT_MESSAGES } from "../data/mockData";
import { 
  Send, 
  MessageSquare, 
  Users, 
  Trophy, 
  User, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  CheckCheck,
  AlertCircle
} from "lucide-react";

interface ChatViewProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

export default function ChatView({ user, isOnline, onAddNotification }: ChatViewProps) {
  const [channels, setChannels] = useState<ChatChannel[]>(MOCK_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>("chan_dm_sato");
  const [chatMessages, setChatMessages] = useState<{ [channelId: string]: ChatMessage[] }>(MOCK_CHAT_MESSAGES);
  
  // Message composing state
  const [typedMessage, setTypedMessage] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  // NPC Typing indicators
  const [isNpcTyping, setIsNpcTyping] = useState(false);
  const [typingNpcName, setTypingNpcName] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new chats
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeChannelId, isNpcTyping]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const currentMessages = chatMessages[activeChannelId] || [];

  // Submit Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() && !selectedAttachment) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderUid: user.uid,
      senderName: user.name,
      senderPhoto: user.photoUrl,
      content: typedMessage,
      attachments: selectedAttachment ? [selectedAttachment] : undefined,
      createdAt: new Date().toISOString(),
      readBy: [user.uid] // Read by sender by default
    };

    // Update messages
    const updatedMessages = {
      ...chatMessages,
      [activeChannelId]: [...currentMessages, newMsg]
    };
    setChatMessages(updatedMessages);
    setTypedMessage("");
    setSelectedAttachment(null);

    // Update last message in channels list
    setChannels(channels.map(c => {
      if (c.id === activeChannelId) {
        return {
          ...c,
          lastMessage: `${user.name}: ${typedMessage || "[添付ファイル]"}`,
          lastMessageTime: new Date().toISOString()
        };
      }
      return c;
    }));

    // Trigger NPC simulation responses to make Chat feel real-time and responsive!
    if (activeChannelId === "chan_dm_sato" && isOnline) {
      setIsNpcTyping(true);
      setTypingNpcName("佐藤 美咲");
      
      setTimeout(() => {
        setIsNpcTyping(false);
        const replyMsg: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderUid: "user_sato",
          senderName: "佐藤 美咲",
          senderPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
          content: "わかった！教えてくれてありがとうー！😆 あとでノート確認してみるね！期末テストがんばろう！",
          createdAt: new Date().toISOString(),
          readBy: [user.uid, "user_sato"]
        };

        setChatMessages(prev => ({
          ...prev,
          "chan_dm_sato": [...(prev["chan_dm_sato"] || []), replyMsg]
        }));

        // Update channel last msg
        setChannels(prevChan => prevChan.map(c => {
          if (c.id === "chan_dm_sato") {
            return {
              ...c,
              lastMessage: "佐藤 美咲: わかった！教えてくれてありがとうー！",
              lastMessageTime: new Date().toISOString()
            };
          }
          return c;
        }));

        onAddNotification("chat", "佐藤 美咲からメッセージ", "「教えてくれてありがとうー！😆」");
      }, 2500);
    } else if (activeChannelId === "chan_dm_takahashi" && isOnline) {
      setIsNpcTyping(true);
      setTypingNpcName("高橋 健二 (先生)");

      setTimeout(() => {
        setIsNpcTyping(false);
        const replyMsg: ChatMessage = {
          id: `msg_reply_${Date.now()}`,
          senderUid: "user_takahashi",
          senderName: "高橋 健二 (先生)",
          senderPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          content: "承知しました。では明日の16:00に面談室でお待ちしています。数学の進捗状況についてのプリントも持参してくださいね。",
          createdAt: new Date().toISOString(),
          readBy: [user.uid, "user_takahashi"]
        };

        setChatMessages(prev => ({
          ...prev,
          "chan_dm_takahashi": [...(prev["chan_dm_takahashi"] || []), replyMsg]
        }));

        onAddNotification("chat", "高橋 健二 (先生)からメッセージ", "「承知しました。では明日の16:00にお待ちしています。」");
      }, 2500);
    }
  };

  const handleSimulateAttach = (type: "image" | "file") => {
    const mockAttach: Attachment = type === "image"
      ? { type: "image", name: "宿題のノート写真.jpg", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80" }
      : { type: "file", name: "勉強のまとめメモ.pdf", url: "#", size: "320 KB" };
    setSelectedAttachment(mockAttach);
  };

  return (
    <div id="chat-viewport" className="grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden min-h-[calc(100vh-140px)] shadow-xs transition-colors duration-300">
      
      {/* LEFT COLUMN: Channels List */}
      <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800/80 flex flex-col divide-y divide-slate-100 dark:divide-slate-850">
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            メッセージ一覧
          </span>
          {!isOnline && (
            <span className="text-[10px] text-rose-500 font-extrabold animate-pulse flex items-center gap-0.5">
              <AlertCircle className="h-3 w-3" />
              接続切れ
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 p-2">
          {channels.map(chan => {
            const isActive = chan.id === activeChannelId;
            return (
              <button
                key={chan.id}
                id={`chat-channel-link-${chan.id}`}
                type="button"
                onClick={() => setActiveChannelId(chan.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 ring-1 ring-blue-500/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {/* Channel Icon category */}
                <div className="relative">
                  <img
                    src={chan.photoUrl}
                    alt={chan.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-slate-100 dark:bg-slate-800 border flex items-center justify-center">
                    {chan.type === "class" ? (
                      <Users className="h-2 w-2 text-indigo-500" />
                    ) : chan.type === "club" ? (
                      <Trophy className="h-2 w-2 text-emerald-500" />
                    ) : (
                      <User className="h-2 w-2 text-amber-500" />
                    )}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">{chan.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{chan.lastMessage}</p>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Chat Board Window */}
      <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30 dark:bg-slate-950/10 h-full min-h-[500px]">
        
        {/* Chat window Header */}
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={activeChannel?.photoUrl}
              alt={activeChannel?.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border"
            />
            <div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-100">{activeChannel?.name}</p>
              <span className="text-[9px] text-slate-400">オンライン授業・連絡室</span>
            </div>
          </div>

          <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm">
            全 {currentMessages.length} 件の対話
          </span>
        </div>

        {/* Messages Feed body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages.map(msg => {
            const isMe = msg.senderUid === user.uid;
            return (
              <div key={msg.id} className={`flex gap-2.5 items-start max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                
                {/* Sender Avatar */}
                <img
                  src={msg.senderPhoto}
                  alt={msg.senderName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border"
                />

                {/* Message Bubble wrapper */}
                <div className="space-y-1">
                  {!isMe && <span className="text-[10px] text-slate-400 font-semibold">{msg.senderName}</span>}
                  
                  <div className={`p-3 rounded-2xl text-xs relative ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-slate-800 rounded-tl-none shadow-xs"
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Attachment rendering if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2.5 p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 flex items-center gap-2 max-w-xs">
                        {msg.attachments[0].type === "image" ? (
                          <>
                            <ImageIcon className="h-4.5 w-4.5 shrink-0" />
                            <a href={msg.attachments[0].url} target="_blank" rel="noreferrer" className="underline font-bold truncate block text-[10px]">
                              {msg.attachments[0].name}
                            </a>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
                            <span className="font-bold truncate block text-[10px]">{msg.attachments[0].name}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Read mark / timestamp */}
                  <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 ${isMe ? "justify-end" : ""}`}>
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (
                      <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                        <CheckCheck className="h-3 w-3" />
                        既読
                      </span>
                    )}
                  </div>

                </div>

              </div>
            );
          })}

          {/* Simulated NPC Typing placeholder */}
          {isNpcTyping && (
            <div className="flex gap-2 items-center text-xs text-slate-400 mr-auto max-w-[85%]">
              <img
                src={activeChannelId === "chan_dm_sato" ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"}
                alt="Typing"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-semibold">{typingNpcName}</span>
                <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-800 p-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat input footer drawer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          
          {/* Attachment Preview Box */}
          {selectedAttachment && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-850 border rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="truncate">📎 添付予約: {selectedAttachment.name}</span>
              <button
                type="button"
                onClick={() => setSelectedAttachment(null)}
                className="text-rose-500 font-bold hover:underline"
              >
                削除
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            
            {/* Quick Attachments selector */}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleSimulateAttach("image")}
                className="p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                title="写真をチャットに送る"
              >
                <ImageIcon className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSimulateAttach("file")}
                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                title="ファイルをチャットに送る"
              >
                <FileText className="h-4.5 w-4.5" />
              </button>
            </div>

            <input
              id="chat-composer-input"
              type="text"
              placeholder={isOnline ? "メッセージを入力..." : "オフラインのため送信できません"}
              value={typedMessage}
              disabled={!isOnline}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-grow text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden text-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500"
            />

            <button
              id="chat-send-submit-btn"
              type="submit"
              disabled={!isOnline}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
