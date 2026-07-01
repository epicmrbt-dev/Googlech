/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, UserRole, Timetable, Homework, PrintHandout, Poll, AttendanceReport } from "../types";
import { 
  MOCK_TIMETABLES, 
  MOCK_HOMEWORKS, 
  MOCK_PRINTS, 
  MOCK_POLLS 
} from "../data/mockData";
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  FileText, 
  UserCheck, 
  BarChart3, 
  Send, 
  Download, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Users,
  AlertCircle,
  Sparkles,
  Upload,
  Loader2,
  Check
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

interface ClassCommunityViewProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

export default function ClassCommunityView({ user, isOnline, onAddNotification }: ClassCommunityViewProps) {
  // Class view selected (default to user's class)
  const currentClassName = user.className !== "事務局" ? user.className : "1組";
  const [activeSubTab, setActiveSubTab] = useState<"timetable" | "homework" | "prints" | "attendance" | "polls">("timetable");

  // Dynamic States loaded from mock data
  const [timetable, setTimetable] = useState<Timetable>(() => {
    const saved = localStorage.getItem(`timetable_${currentClassName}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved timetable", e);
      }
    }
    return MOCK_TIMETABLES[currentClassName] || MOCK_TIMETABLES["1組"];
  });

  const handleUpdateTimetable = (newTimetable: Timetable) => {
    setTimetable(newTimetable);
    localStorage.setItem(`timetable_${currentClassName}`, JSON.stringify(newTimetable));
  };

  const [homeworks, setHomeworks] = useState<Homework[]>(MOCK_HOMEWORKS.filter(h => h.className === currentClassName));
  const [prints, setPrints] = useState<PrintHandout[]>(MOCK_PRINTS.filter(p => p.className === currentClassName));
  const [polls, setPolls] = useState<Poll[]>(MOCK_POLLS.filter(p => p.className === currentClassName || !p.className));

  // AI Timetable parsing state
  const [showAiUpload, setShowAiUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Timetable | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelection = (file: File) => {
    setUploadError("");
    setIsParsing(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // Extract the raw base64 part
      const base64Data = base64String.split(",")[1];
      const mimeType = file.type || "image/png";

      try {
        const response = await fetch("/api/timetable/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fileData: base64Data,
            mimeType: mimeType
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "サーバーエラーが発生しました。");
        }

        const data = await response.json();
        if (data.timetable) {
          setParsedPreview(data.timetable);
        } else {
          throw new Error("時間割データが抽出できませんでした。ファイルの画質や内容を確認してください。");
        }
      } catch (err: any) {
        console.error(err);
        setUploadError(err.message || "時間割の読み取りに失敗しました。もう一度お試しください。");
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setUploadError("ファイルの読み込みに失敗しました。");
      setIsParsing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleApplyParsedTimetable = () => {
    if (!parsedPreview) return;
    handleUpdateTimetable(parsedPreview);
    setShowAiUpload(false);
    setParsedPreview(null);
    onAddNotification("announcement", "時間割が更新されました", `AIの解析結果を反映し、${currentClassName}の時間割が更新されました！`);
  };
  
  // Attendance Reporting State
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceReport[]>([
    {
      id: "att_1",
      studentUid: "user_sato",
      studentName: "佐藤 美咲",
      className: currentClassName,
      date: new Date().toISOString().split("T")[0],
      status: "遅刻",
      reason: "電車の遅延（遅延証明書あり）",
      createdAt: new Date().toISOString(),
      teacherVerified: false
    }
  ]);
  const [attStatus, setAttStatus] = useState<"欠席" | "遅刻" | "早退">("欠席");
  const [attReason, setAttReason] = useState("");

  // New Poll creation (Teacher/Admin only)
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDesc, setNewPollDesc] = useState("");
  const [newPollOptions, setNewPollOptions] = useState<string[]>(["", ""]);
  const [newPollIsAnonymous, setNewPollIsAnonymous] = useState(true);

  // New Homework creator (Teacher only)
  const [showHwCreator, setShowHwCreator] = useState(false);
  const [newHwTitle, setNewHwTitle] = useState("");
  const [newHwDesc, setNewHwDesc] = useState("");
  const [newHwSubject, setNewHwSubject] = useState("");
  const [newHwDueDate, setNewHwDueDate] = useState("");

  // Submitting attendance report
  const handleReportAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attReason.trim()) return;

    const newReport: AttendanceReport = {
      id: `att_${Date.now()}`,
      studentUid: user.uid,
      studentName: user.name,
      className: currentClassName,
      date: new Date().toISOString().split("T")[0],
      status: attStatus,
      reason: attReason,
      createdAt: new Date().toISOString(),
      teacherVerified: false
    };

    setAttendanceLogs([newReport, ...attendanceLogs]);
    setAttReason("");
    onAddNotification("poll", "出席連絡を送信しました", `担任の先生に出席連絡（${attStatus}）が届きました。`);
  };

  // Verify attendance (Teacher/Admin only)
  const handleVerifyAttendance = (id: string) => {
    setAttendanceLogs(attendanceLogs.map(log => {
      if (log.id === id) {
        return { ...log, teacherVerified: true };
      }
      return log;
    }));
    onAddNotification("poll", "出席連絡を確認しました", "生徒の遅刻・欠席届を承認しました。");
  };

  // Submit Homework Simulation
  const handleToggleHomeworkSubmit = (hwId: string) => {
    setHomeworks(homeworks.map(hw => {
      if (hw.id === hwId) {
        const hasSubmitted = hw.submittedUids.includes(user.uid);
        const newSubmitted = hasSubmitted
          ? hw.submittedUids.filter(uid => uid !== user.uid)
          : [...hw.submittedUids, user.uid];

        if (!hasSubmitted) {
          onAddNotification("post", "宿題を提出しました", `「${hw.title}」を提出しました。先生の確認をお待ちください。`);
        }

        return { ...hw, submittedUids: newSubmitted };
      }
      return hw;
    }));
  };

  // Create Homework (Teacher only)
  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle || !newHwSubject || !newHwDueDate) return;

    const newHw: Homework = {
      id: `hw_${Date.now()}`,
      title: newHwTitle,
      description: newHwDesc,
      subject: newHwSubject,
      dueDate: newHwDueDate,
      className: currentClassName,
      authorName: user.name,
      submittedUids: []
    };

    setHomeworks([newHw, ...homeworks]);
    setShowHwCreator(false);
    setNewHwTitle("");
    setNewHwDesc("");
    setNewHwSubject("");
    setNewHwDueDate("");

    onAddNotification("poll", "新規の宿題が追加されました", `${currentClassName}向けに「${newHwTitle}」の提出課題が配信されました。`);
  };

  // Voting on surveys
  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        const updatedOptions = p.options.map(opt => {
          // Check if user already voted in this option
          const hasVotedThis = opt.votes.includes(user.uid);
          
          if (hasVotedThis) {
            // Remove vote
            return { ...opt, votes: opt.votes.filter(uid => uid !== user.uid) };
          } else if (opt.id === optionId) {
            // Add vote
            return { ...opt, votes: [...opt.votes, user.uid] };
          } else if (!p.isMultipleChoice) {
            // Remove votes from other options since it's single choice
            return { ...opt, votes: opt.votes.filter(uid => uid !== user.uid) };
          }
          return opt;
        });
        return { ...p, options: updatedOptions };
      }
      return p;
    }));

    onAddNotification("poll", "アンケートに投票しました", "ご協力ありがとうございました！投票数が更新されました。");
  };

  // Create custom poll
  const handleAddOptionField = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = newPollOptions.filter(opt => opt.trim() !== "");
    if (!newPollTitle || validOptions.length < 2) return;

    const newPoll: Poll = {
      id: `poll_${Date.now()}`,
      title: newPollTitle,
      description: newPollDesc,
      options: validOptions.map((text, index) => ({
        id: `opt_new_${index}`,
        text,
        votes: []
      })),
      className: currentClassName,
      authorName: user.name,
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      isAnonymous: newPollIsAnonymous,
      isMultipleChoice: false
    };

    setPolls([newPoll, ...polls]);
    setShowPollCreator(false);
    setNewPollTitle("");
    setNewPollDesc("");
    setNewPollOptions(["", ""]);

    onAddNotification("poll", "新しいアンケートが開始されました", `クラスアンケート「${newPollTitle}」が開始されました。`);
  };

  // Weekly timetable days list
  const days = ["月", "火", "水", "木", "金"];
  const periods = [1, 2, 3, 4, 5, 6];

  // Helper to color subjects in timetable nicely
  const getSubjectColor = (subj: string) => {
    if (subj.includes("数学")) return "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900";
    if (subj.includes("英語")) return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900";
    if (subj.includes("国語") || subj.includes("古典")) return "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900";
    if (subj.includes("物理") || subj.includes("化学") || subj.includes("理科")) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900";
    if (subj.includes("体育") || subj.includes("保健")) return "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900";
    return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800";
  };

  return (
    <div id="class-community-viewport" className="p-4 md:p-6 pb-20 sm:pb-6 space-y-6">
      
      {/* Header Banner detailing class information */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-200 shrink-0" />
            <h1 className="text-2xl font-extrabold tracking-tight">{currentClassName} プレビュー</h1>
          </div>
          <p className="text-blue-100 text-xs mt-1">クラス専用の時間割、宿題共有、プリント保管庫、出席届、クラス投票が完備されています。</p>
        </div>
        
        {/* Quick Statistics details */}
        <div className="flex gap-4 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-xs text-xs">
          <div>
            <span className="block opacity-75 font-medium">宿題の未提出</span>
            <span className="text-base font-bold">{homeworks.filter(h => !h.submittedUids.includes(user.uid)).length} 件</span>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <span className="block opacity-75 font-medium">クラス進行中投票</span>
            <span className="text-base font-bold">{polls.length} 件</span>
          </div>
        </div>
      </div>

      {/* SUB MENU NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          id="class-tab-timetable"
          type="button"
          onClick={() => setActiveSubTab("timetable")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "timetable"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
          時間割共有
        </button>
        <button
          id="class-tab-homework"
          type="button"
          onClick={() => setActiveSubTab("homework")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "homework"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 inline mr-1.5" />
          宿題・提出物
        </button>
        <button
          id="class-tab-prints"
          type="button"
          onClick={() => setActiveSubTab("prints")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "prints"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <FileText className="h-3.5 w-3.5 inline mr-1.5" />
          配布プリント
        </button>
        <button
          id="class-tab-attendance"
          type="button"
          onClick={() => setActiveSubTab("attendance")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "attendance"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 inline mr-1.5" />
          欠席・遅刻連絡
        </button>
        <button
          id="class-tab-polls"
          type="button"
          onClick={() => setActiveSubTab("polls")}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "polls"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5 inline mr-1.5" />
          アンケート・投票
        </button>
      </div>

      {/* TAB CONTENT PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xs">
        
        {/* TIMETABLE VIEW */}
        {activeSubTab === "timetable" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>クラス時間割表</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-md">
                    {currentClassName}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">曜日の1限〜6限の時間割。画像やファイルを提出してAIで自動入力できます！</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiUpload(!showAiUpload)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border border-indigo-200/50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>画像・ファイルから自動入力 (AI)</span>
                </button>
              </div>
            </div>

            {/* AI Uploader Dropdown Section */}
            {showAiUpload && (
              <div id="ai-timetable-uploader-container" className="p-5 border border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/10 dark:bg-indigo-950/5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">時間割の自動登録 (Gemini AI)</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAiUpload(false);
                      setParsedPreview(null);
                      setUploadError("");
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    閉じる
                  </button>
                </div>

                {!parsedPreview && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        handleFileSelection(files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/10 scale-[0.99]"
                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50/40"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleFileSelection(files[0]);
                        }
                      }}
                    />
                    {isParsing ? (
                      <div className="space-y-3 py-4">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Gemini AIが時間割ファイルを解析中...</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">画像の文字を読み取って曜日や授業、先生、教室を抽出しています。しばらくお待ちください。</p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          時間割の画像・ファイルをドラッグ＆ドロップ、またはクリックして選択
                        </p>
                        <p className="text-[10px] text-slate-400">
                          対応フォーマット: PNG, JPEG, WEBP などの画像ファイル
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-xs border border-red-100 dark:border-red-900/40">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {parsedPreview && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/40 rounded-xl space-y-1">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-4 w-4" />
                        <span>時間割を正常に抽出しました！</span>
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550">
                        以下の内容が検出されました。確認後、「この内容を時間割に反映する」ボタンを押すと時間割表が更新されます。
                      </p>
                    </div>

                    {/* Preview Table of Extracted Timetable */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                              <th className="p-2 text-center font-bold w-16 border-r border-slate-200 dark:border-slate-800">時限</th>
                              {days.map(d => (
                                <th key={d} className="p-2 text-center font-bold border-r border-slate-200 dark:border-slate-800">{d}曜日</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {periods.map(period => (
                              <tr key={period} className="border-b border-slate-150 dark:border-slate-800 last:border-0">
                                <td className="p-2 text-center font-bold bg-slate-50/30 dark:bg-slate-800/10 text-slate-500 border-r border-slate-200 dark:border-slate-800">{period}</td>
                                {days.map(day => {
                                  const bp = parsedPreview[day]?.find(p => p.period === period);
                                  return (
                                    <td key={day} className="p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                                      {bp ? (
                                        <div className="space-y-0.5">
                                          <p className="font-extrabold text-slate-850 dark:text-slate-100">{bp.subject}</p>
                                          <p className="text-[9px] text-slate-400 dark:text-slate-500">👤 {bp.teacher}</p>
                                          {bp.room && <p className="text-[9px] text-slate-400 dark:text-slate-500">📍 {bp.room}</p>}
                                        </div>
                                      ) : (
                                        <p className="text-slate-300 dark:text-slate-700 text-center">-</p>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setParsedPreview(null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        別のファイルをアップロード
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyParsedTimetable}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10 cursor-pointer flex items-center gap-1.5 animate-bounce-subtle"
                      >
                        <Check className="h-4 w-4" />
                        <span>この内容を時間割に反映する</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 bg-slate-50 dark:bg-slate-800/40 text-center text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800 w-16">
                      時限
                    </th>
                    {days.map(d => (
                      <th key={d} className="p-3 bg-slate-50 dark:bg-slate-800/40 text-center text-sm font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                        {d}曜日
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period}>
                      <td className="p-3 text-center text-xs font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800">
                        {period}
                      </td>
                      {days.map(day => {
                        const dayPeriods = timetable[day] || [];
                        const block = dayPeriods.find(bp => bp.period === period);
                        return (
                          <td key={day} className="p-2 border border-slate-200 dark:border-slate-800 h-24 align-top">
                            {block ? (
                              <div className={`p-2.5 rounded-xl border h-full flex flex-col justify-between text-xs transition-colors duration-150 ${getSubjectColor(block.subject)}`}>
                                <p className="font-extrabold leading-tight">{block.subject}</p>
                                <div className="mt-2 text-[10px] opacity-80 space-y-0.5">
                                  <p className="truncate">👤 {block.teacher}</p>
                                  {block.room && <p className="truncate">📍 {block.room}</p>}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700 text-xs">
                                空き
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HOMEWORK VIEW */}
        {activeSubTab === "homework" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">提出課題・宿題ボード</h2>
              {user.role === UserRole.TEACHER && (
                <button
                  type="button"
                  onClick={() => setShowHwCreator(!showHwCreator)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>宿題を配信する</span>
                </button>
              )}
            </div>

            {/* Create Homework Form Modal inline */}
            {showHwCreator && (
              <form onSubmit={handleCreateHomework} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">宿題のタイトル</label>
                    <input
                      type="text"
                      required
                      placeholder="例: 数学II 週末復習プリント"
                      value={newHwTitle}
                      onChange={(e) => setNewHwTitle(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">科目</label>
                    <input
                      type="text"
                      required
                      placeholder="例: 数学II"
                      value={newHwSubject}
                      onChange={(e) => setNewHwSubject(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">説明・提出要領</label>
                  <textarea
                    rows={3}
                    placeholder="提出方法、注意点などを詳しく書いてください"
                    value={newHwDesc}
                    onChange={(e) => setNewHwDesc(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">提出締切日</label>
                  <input
                    type="date"
                    required
                    value={newHwDueDate}
                    onChange={(e) => setNewHwDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHwCreator(false)}
                    className="px-3 py-1.5 text-xs bg-slate-150 text-slate-600 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-bold"
                  >
                    配信
                  </button>
                </div>
              </form>
            )}

            {/* Homework items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homeworks.length === 0 ? (
                <p className="text-xs text-slate-400 col-span-2 text-center py-6">現在クラスに配信された宿題はありません</p>
              ) : (
                homeworks.map(hw => {
                  const hasSubmitted = hw.submittedUids.includes(user.uid);
                  return (
                    <div key={hw.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">
                            {hw.subject}
                          </span>
                          <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 shrink-0">
                            <Clock className="h-3.5 w-3.5" />
                            締切: {hw.dueDate}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 mt-2">{hw.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">{hw.description}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-2">
                        <span className="text-[10px] text-slate-400">配信者: {hw.authorName}</span>
                        
                        <button
                          type="button"
                          onClick={() => handleToggleHomeworkSubmit(hw.id)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            hasSubmitted
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {hasSubmitted ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>提出済み</span>
                            </>
                          ) : (
                            <span>提出を完了する</span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* PRINT HANDOUTS VIEW */}
        {activeSubTab === "prints" && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">配布プリント・教材保管庫</h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prints.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">配布プリントはまだありません</p>
              ) : (
                prints.map(pr => (
                  <div key={pr.id} className="py-3.5 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{pr.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{pr.fileName} • {new Date(pr.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onAddNotification("post", "ファイルをダウンロードしました", `${pr.fileName} を正常にダウンロードしました。`);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1"
                    >
                      <Download className="h-4.5 w-4.5" />
                      <span className="hidden sm:inline">DLする</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ATTENDANCE VIEW */}
        {activeSubTab === "attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Report Form (Student view) */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">出席連絡を送る</h3>
                <form onSubmit={handleReportAttendance} className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">種別</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["欠席", "遅刻", "早退"].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAttStatus(st as any)}
                          className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                            attStatus === st
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">理由・詳細</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="例: 発熱38.2度があるため、本日は欠席いたします。病院受診予定です。"
                      value={attReason}
                      onChange={(e) => setAttReason(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>担任の先生に報告する</span>
                  </button>
                </form>
              </div>

              {/* Logs history list (Teacher / Student view) */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">届出一覧（担任確認）</h3>
                <div className="space-y-2.5">
                  {attendanceLogs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">届出履歴はありません</p>
                  ) : (
                    attendanceLogs.map(log => (
                      <div key={log.id} className="p-3.5 border border-slate-150 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 text-xs flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{log.studentName}</span>
                            <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-extrabold ${
                              log.status === "欠席" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">理由: {log.reason}</p>
                          <span className="text-[9px] text-slate-400 mt-1.5 block">申請時刻: {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Verification logic for teachers */}
                        {user.role === UserRole.TEACHER && !log.teacherVerified ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyAttendance(log.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            承認する
                          </button>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                            log.teacherVerified 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          }`}>
                            {log.teacherVerified ? "✓ 確認済み" : "確認中"}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SURVEYS / POLLS VIEW */}
        {activeSubTab === "polls" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-200">アンケート・クラス投票</h2>
              {(user.role === UserRole.TEACHER || user.role === UserRole.STUDENT) && (
                <button
                  type="button"
                  onClick={() => setShowPollCreator(!showPollCreator)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer animate-pulse"
                >
                  <Plus className="h-4 w-4" />
                  <span>投票を作成する</span>
                </button>
              )}
            </div>

            {/* Poll Creator Form */}
            {showPollCreator && (
              <form onSubmit={handleCreatePoll} className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">投票のタイトル・議題</label>
                  <input
                    type="text"
                    required
                    placeholder="例: 文化祭のクラスTシャツの色決め"
                    value={newPollTitle}
                    onChange={(e) => setNewPollTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">説明・目的</label>
                  <textarea
                    rows={2}
                    placeholder="議題の背景や期日などを記載してください"
                    value={newPollDesc}
                    onChange={(e) => setNewPollDesc(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">選択肢</label>
                  {newPollOptions.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      required={oIdx < 2}
                      placeholder={`選択肢 ${oIdx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[oIdx] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-850"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={handleAddOptionField}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    + 選択肢を追加
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="poll-creator-anon"
                    checked={newPollIsAnonymous}
                    onChange={(e) => setNewPollIsAnonymous(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="poll-creator-anon" className="text-xs text-slate-600">匿名で投票を可能にする（誰がどれに入れたかを非表示）</label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPollCreator(false)}
                    className="px-3 py-1.5 text-xs bg-slate-150 text-slate-600 rounded-lg"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-bold"
                  >
                    投票作成
                  </button>
                </div>
              </form>
            )}

            {/* Poll list items rendering */}
            <div className="space-y-6">
              {polls.map(poll => {
                const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                const hasVotedAny = poll.options.some(o => o.votes.includes(user.uid));

                // Recharts specific data structure
                const chartData = poll.options.map(o => ({
                  name: o.text,
                  票数: o.votes.length
                }));

                return (
                  <div key={poll.id} className="p-5 border border-slate-150 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">{poll.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{poll.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-semibold bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-150 dark:border-slate-800">
                        総投票数: {totalVotes} 票
                      </span>
                    </div>

                    {/* Voting selector options if user hasn't voted yet, or wants to edit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500">
                          {hasVotedAny ? "✓ 投票済み（クリックで変更）" : "選択肢を選んで投票してください:"}
                        </p>
                        <div className="space-y-2">
                          {poll.options.map(opt => {
                            const isUserSelection = opt.votes.includes(user.uid);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleVote(poll.id, opt.id)}
                                className={`w-full p-3 text-left text-xs font-bold rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                                  isUserSelection
                                    ? "bg-blue-50/60 dark:bg-blue-950/25 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <span>{opt.text}</span>
                                {isUserSelection && (
                                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                                    選択中
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dynamic Visual Graph utilizing Recharts (as requested!) */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-3 h-48">
                        <p className="text-[10px] font-bold text-slate-400 mb-2">投票結果グラフ（リアルタイム）</p>
                        
                        <ResponsiveContainer width="100%" height="80%">
                          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                            <Tooltip contentStyle={{ fontSize: 10 }} />
                            <Bar dataKey="票数" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={index % 2 === 0 ? "#2563eb" : "#10b981"} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-150 dark:border-slate-800">
                      <span>作成者: {poll.authorName}</span>
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        {poll.isAnonymous ? "匿名投票モード" : "記名投票モード"}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
