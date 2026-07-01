/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, CalendarEvent, UserRole } from "../types";
import { MOCK_CALENDAR_EVENTS } from "../data/mockData";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Tag
} from "lucide-react";

interface CalendarViewProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

export default function CalendarView({ user, isOnline, onAddNotification }: CalendarViewProps) {
  // Calendar State (Fixed on June 2026 for pristine presentation consistency)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, so 5 = June
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-15");

  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);

  
  // Create Event Form state
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<"exam" | "school_event" | "club" | "personal">("personal");

  // Get days in current month helper
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of week for current month (0: Sun, 1: Mon, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Create Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !selectedDate) return;

    const newEv: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: newEventTitle,
      description: newEventDesc,
      date: selectedDate,
      time: newEventTime || "終日",
      location: newEventLocation || "指定なし",
      className: newEventCategory === "personal" ? undefined : user.className,
      category: newEventCategory as any,
      type: newEventCategory as any,
      authorName: user.name
    };

    setEvents([...events, newEv]);
    setShowEventCreator(false);
    setNewEventTitle("");
    setNewEventDesc("");
    setNewEventTime("");
    setNewEventLocation("");

    onAddNotification("announcement", "スケジュールを追加しました", `カレンダーに「${newEventTitle}」を追加しました。`);
  };

  // Get events of a specific date
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr);
  };

  // Color helper for calendar categories
  const getCategoryColor = (cat: "exam" | "school_event" | "club" | "personal") => {
    switch (cat) {
      case "exam":
        return "bg-rose-500 text-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400";
      case "school_event":
        return "bg-blue-500 text-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
      case "club":
        return "bg-emerald-500 text-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
      case "personal":
        return "bg-purple-500 text-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400";
      default:
        return "bg-slate-500 text-slate-50 border-slate-200 dark:bg-slate-800";
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "exam": return "定期試験・模試";
      case "school_event": return "学校・クラス行事";
      case "club": return "部活動予定";
      case "personal": return "個人メモ・学習";
      default: return "その他";
    }
  };

  // Calendar render grid array builder
  const calendarCells = [];
  // Fill initial empty cells
  const emptyCellsCount = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Align to Monday first week
  for (let i = 0; i < emptyCellsCount; i++) {
    calendarCells.push(null);
  }
  // Fill dates of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const selectedDateEvents = getEventsForDate(selectedDate);
  const monthNames = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ];

  return (
    <div id="calendar-viewport" className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 md:p-6 pb-20 sm:pb-6">
      
      {/* LEFT COLUMN: SELECTED DATE DETAILS PANEL (Bento card styling) */}
      <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-xs flex flex-col justify-between h-fit min-h-[480px]">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400">SELECTED DATE</p>
              <h2 className="text-base font-extrabold text-slate-850 dark:text-slate-100">
                {new Date(selectedDate).toLocaleDateString("ja-JP", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
              </h2>
            </div>
            
            <button
              id="calendar-add-event-btn"
              type="button"
              onClick={() => setShowEventCreator(!showEventCreator)}
              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 cursor-pointer"
              title="予定を追加"
            >
              <Plus className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Quick inline Event creator */}
          {showEventCreator && (
            <form onSubmit={handleCreateEvent} className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-xl space-y-3.5 border text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">予定タイトル</label>
                <input
                  type="text"
                  required
                  placeholder="例: 数学の宿題復習"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-slate-850 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">時間</label>
                  <input
                    type="text"
                    placeholder="例: 13:00~"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-slate-850 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">場所</label>
                  <input
                    type="text"
                    placeholder="例: 図書室"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-slate-850"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">カテゴリー</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value as any)}
                  className="w-full text-xs p-2 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-900 rounded-lg text-slate-850"
                >
                  <option value="personal">個人メモ（自分専用）</option>
                  {(user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) && (
                    <>
                      <option value="exam">定期試験・模試</option>
                      <option value="school_event">学校・クラス行事</option>
                      <option value="club">部活動活動</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEventCreator(false)}
                  className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md"
                >
                  取り消す
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 bg-blue-600 text-white rounded-md font-bold"
                >
                  登録
                </button>
              </div>
            </form>
          )}

          {/* List of events on Selected Date */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">この日の予定はありません</p>
                <p className="text-[10px] text-slate-400">クラス学習や個人タスクを追加しましょう。</p>
              </div>
            ) : (
              selectedDateEvents.map(ev => {
                const cat = ev.category || ev.type || "personal";
                return (
                  <div key={ev.id} className="p-3 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2 text-xs hover:border-slate-300 transition-colors bg-slate-50/40 dark:bg-slate-850">
                    <div className="flex justify-between items-start gap-1">
                      <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{ev.title}</p>
                      <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-sm shrink-0 whitespace-nowrap ${getCategoryColor(cat)}`}>
                        {getCategoryLabel(cat)}
                      </span>
                    </div>
                    {ev.description && <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{ev.description}</p>}
                    
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-0.5">⏱️ {ev.time || "終日"}</span>
                      <span className="flex items-center gap-0.5">📍 {ev.location || "指定なし"}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Categories Color Legends */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[10px]">
          <p className="font-bold text-slate-400 mb-1">カレンダー凡例</p>
          <div className="grid grid-cols-2 gap-2 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-rose-500" />
              定期試験・模試
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-blue-500" />
              学校・クラス行事
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
              部活動予定
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-xs bg-purple-500" />
              個人用メモ
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: INTERACTIVE MONTHLY CALENDAR GRID */}
      <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 shadow-xs">
        
        {/* Month selector header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <h2 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
              {currentYear}年 {monthNames[currentMonth]}
            </h2>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Calendar days headers */}
        <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-extrabold text-slate-400">
          <span>月</span>
          <span>火</span>
          <span>水</span>
          <span>木</span>
          <span>金</span>
          <span className="text-blue-500">土</span>
          <span className="text-red-500">日</span>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 gap-1.5 mt-2">
          {calendarCells.map((day, cellIndex) => {
            if (day === null) {
              return <div key={`empty-${cellIndex}`} className="h-20 bg-slate-50/20 dark:bg-transparent rounded-lg" />;
            }

            // Pad day to date string
            const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === formattedDate;
            const dateEvents = getEventsForDate(formattedDate);

            // Weekend indicators
            const isSaturday = (cellIndex % 7) === 5;
            const isSunday = (cellIndex % 7) === 6;

            return (
              <div
                key={`day-${day}`}
                id={`calendar-date-${formattedDate}`}
                onClick={() => setSelectedDate(formattedDate)}
                className={`h-20 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-500"
                    : "border-slate-150 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750"
                }`}
              >
                {/* Date Number top left */}
                <span className={`text-[11px] font-extrabold ${
                  isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-slate-600 dark:text-slate-300"
                }`}>
                  {day}
                </span>

                {/* Event indicators/dots in bottom area of grid cell */}
                <div className="space-y-0.5 max-h-[48px] overflow-hidden">
                  {dateEvents.slice(0, 2).map(ev => {
                    const cat = ev.category || ev.type || "personal";
                    return (
                      <div
                        key={ev.id}
                        className={`text-[8px] font-extrabold px-1 py-0.2 rounded-sm truncate ${
                          cat === "exam"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                            : (cat === "school" || cat === "school_event")
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                            : cat === "club"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400"
                        }`}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {dateEvents.length > 2 && (
                    <p className="text-[7px] text-slate-400 font-bold text-center">他 {dateEvents.length - 2} 件...</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
