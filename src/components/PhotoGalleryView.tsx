/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile, PhotoAlbum } from "../types";
import { MOCK_ALBUMS } from "../data/mockData";
import { 
  Plus, 
  Search, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  Download, 
  X, 
  Send,
  FolderClosed,
  AlertCircle
} from "lucide-react";

interface PhotoGalleryViewProps {
  user: UserProfile;
  isOnline: boolean;
  onAddNotification: (type: string, title: string, body: string) => void;
}

export default function PhotoGalleryView({ user, isOnline, onAddNotification }: PhotoGalleryViewProps) {
  // Albums State
  const [albums, setAlbums] = useState<PhotoAlbum[]>(MOCK_ALBUMS);
  const [activeAlbumId, setActiveAlbumId] = useState<string | null>(null);
  
  // Create Album form popup
  const [showAlbumCreator, setShowAlbumCreator] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [newAlbumCategory, setNewAlbumCategory] = useState("体育祭");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Lightbox overlay active photo state
  const [activePhoto, setActivePhoto] = useState<{
    albumId: string;
    photoId: string;
    url: string;
    uploadedBy: string;
    likes: string[];
    comments: { id: string; author: string; text: string; time: string }[];
  } | null>(null);

  // Quick photo comment input
  const [photoCommentText, setPhotoCommentText] = useState("");

  // Create Album
  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle) return;

    const newAlbum: PhotoAlbum = {
      id: `album_${Date.now()}`,
      title: newAlbumTitle,
      description: newAlbumDesc,
      coverUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80",
      category: newAlbumCategory,
      createdAt: new Date().toISOString(),
      photos: []
    };

    setAlbums([newAlbum, ...albums]);
    setShowAlbumCreator(false);
    setNewAlbumTitle("");
    setNewAlbumDesc("");

    onAddNotification("announcement", "新しい写真アルバムが作成されました", `「${newAlbumTitle}」アルバムが写真共有に追加されました。写真を投稿しましょう！`);
  };

  // Simulate uploading photo into current active album
  const handleUploadPhoto = () => {
    if (!activeAlbumId) return;

    const newPhoto = {
      id: `photo_${Date.now()}`,
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
      uploadedBy: user.name,
      createdAt: new Date().toISOString(),
      likes: [],
      commentsCount: 0
    };

    setAlbums(albums.map(alb => {
      if (alb.id === activeAlbumId) {
        return {
          ...alb,
          photos: [newPhoto, ...alb.photos]
        };
      }
      return alb;
    }));

    onAddNotification("post", "アルバムに写真を追加しました", "写真のアップロードが完了しました。他のクラスメイトも閲覧できます。");
  };

  // Like photo in active lightbox
  const handleLikePhoto = () => {
    if (!activePhoto) return;

    const isLiked = activePhoto.likes.includes(user.uid);
    const newLikes = isLiked
      ? activePhoto.likes.filter(uid => uid !== user.uid)
      : [...activePhoto.likes, user.uid];

    // Update active state
    setActivePhoto({ ...activePhoto, likes: newLikes });

    // Update main albums list
    setAlbums(albums.map(alb => {
      if (alb.id === activePhoto.albumId) {
        const updatedPhotos = alb.photos.map(p => {
          if (p.id === activePhoto.photoId) {
            return { ...p, likes: newLikes };
          }
          return p;
        });
        return { ...alb, photos: updatedPhotos };
      }
      return alb;
    }));
  };

  // Add Comment to active lightbox photo
  const handleAddPhotoComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePhoto || !photoCommentText.trim()) return;

    const newComment = {
      id: `p_comm_${Date.now()}`,
      author: user.name,
      text: photoCommentText,
      time: "今日"
    };

    const updatedComments = [...activePhoto.comments, newComment];
    setActivePhoto({
      ...activePhoto,
      comments: updatedComments
    });

    // Update main count
    setAlbums(albums.map(alb => {
      if (alb.id === activePhoto.albumId) {
        const updatedPhotos = alb.photos.map(p => {
          if (p.id === activePhoto.photoId) {
            return { ...p, commentsCount: p.commentsCount + 1 };
          }
          return p;
        });
        return { ...alb, photos: updatedPhotos };
      }
      return alb;
    }));

    setPhotoCommentText("");
  };

  // Trigger Lightbox open
  const handleOpenPhoto = (albumId: string, photo: PhotoAlbum["photos"][0]) => {
    setActivePhoto({
      albumId,
      photoId: photo.id,
      url: photo.url,
      uploadedBy: photo.uploadedBy,
      likes: photo.likes,
      comments: [
        { id: "1", author: "鈴木 翔太", text: "このシーン、リレーめっちゃ盛り上がったね！", time: "5日前" }
      ]
    });
  };

  const selectedAlbum = albums.find(a => a.id === activeAlbumId);

  // Filter albums by search query
  const filteredAlbums = albums.filter(alb => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = alb.title.toLowerCase().includes(q);
      const descMatch = alb.description.toLowerCase().includes(q);
      const categoryMatch = alb.category.toLowerCase().includes(q);
      return titleMatch || descMatch || categoryMatch;
    }
    return true;
  });

  return (
    <div id="photo-gallery-viewport" className="p-4 md:p-6 pb-20 sm:pb-6 space-y-6">
      
      {/* Banner design */}
      <div className="bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ImageIcon className="h-6 w-6 text-indigo-200" />
            <h1 className="text-2xl font-extrabold tracking-tight">新着写真・イベント共有</h1>
          </div>
          <p className="text-indigo-100 text-xs mt-1">体育祭、修学旅行、文化祭など、学校生活のイベントごとに作られたアルバムを閲覧・ダウンロードできます。</p>
        </div>

        <button
          id="gallery-create-album-btn"
          type="button"
          onClick={() => setShowAlbumCreator(!showAlbumCreator)}
          className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-50 cursor-pointer"
        >
          新規アルバム作成
        </button>
      </div>

      {/* Album Creator Modal Popover */}
      {showAlbumCreator && (
        <form onSubmit={handleCreateAlbum} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">アルバムのタイトル</label>
              <input
                type="text"
                required
                placeholder="例: 第24回 文化祭 (2A模擬店)"
                value={newAlbumTitle}
                onChange={(e) => setNewAlbumTitle(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">カテゴリー</label>
              <select
                value={newAlbumCategory}
                onChange={(e) => setNewAlbumCategory(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800"
              >
                <option value="体育祭">体育祭</option>
                <option value="文化祭">文化祭</option>
                <option value="修学旅行">修学旅行</option>
                <option value="校外学習">校外学習</option>
                <option value="クラス日常">クラス日常</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">アルバムの説明・詳細</label>
            <textarea
              rows={2}
              placeholder="何の写真を集めるアルバムかを記入してください"
              value={newAlbumDesc}
              onChange={(e) => setNewAlbumDesc(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAlbumCreator(false)}
              className="px-3 py-1.5 text-xs bg-slate-150 text-slate-600 rounded-lg"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-indigo-600 text-white rounded-lg font-bold"
            >
              作成する
            </button>
          </div>
        </form>
      )}

      {/* MAIN VIEW COMPONENT */}
      {!activeAlbumId ? (
        // ALBUM FOLDERS LIST VIEW
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">公開中アルバム一覧</h2>
            
            {/* Folder level Search bar */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="アルバムを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-xl focus:outline-hidden text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredAlbums.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 text-center py-6">該当するアルバムは見つかりませんでした</p>
            ) : (
              filteredAlbums.map(alb => (
                <div
                  key={alb.id}
                  id={`album-folder-${alb.id}`}
                  onClick={() => setActiveAlbumId(alb.id)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden group shadow-xs cursor-pointer hover:border-indigo-500/30 transition-all duration-200"
                >
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={alb.coverUrl}
                      alt={alb.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-101 transition-transform"
                    />
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {alb.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {alb.photos.length} 枚
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100 group-hover:text-indigo-600 truncate">{alb.title}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{alb.description}</p>
                    <span className="text-[9px] text-slate-350 dark:text-slate-600 block pt-1">作成日: {new Date(alb.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        // SINGLE ALBUM INSIDE / GRID OF IMAGES
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-150 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveAlbumId(null)}
                className="p-1 text-xs text-indigo-600 hover:underline flex items-center font-bold"
              >
                ← アルバム一覧に戻る
              </button>
              <div className="w-px h-4 bg-slate-300" />
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedAlbum?.title}</h2>
            </div>

            <button
              id="album-upload-photo-btn"
              type="button"
              onClick={handleUploadPhoto}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>このアルバムに写真を追加</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedAlbum?.photos.length === 0 ? (
              <div className="col-span-4 text-center py-12 bg-slate-50 rounded-2xl">
                <FolderClosed className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">写真はまだありません</p>
                <p className="text-[10px] text-slate-400">右上のボタンから1枚テストアップロードできます。</p>
              </div>
            ) : (
              selectedAlbum?.photos.map(p => (
                <div
                  key={p.id}
                  id={`album-photo-card-${p.id}`}
                  onClick={() => handleOpenPhoto(selectedAlbum.id, p)}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer border border-slate-150 dark:border-slate-800 h-44 bg-slate-50 shadow-xs"
                >
                  <img
                    src={p.url}
                    alt="Campus"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-150"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-slate-300 truncate">投稿: {p.uploadedBy}</p>
                    <div className="flex gap-3 text-white text-[10px] font-bold mt-1.5">
                      <span className="flex items-center gap-0.5">❤️ {p.likes.length}</span>
                      <span className="flex items-center gap-0.5">💬 {p.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX POPUP */}
      {activePhoto && (
        <div id="lightbox-overlay" className="fixed inset-0 z-50 bg-black/90 flex flex-col md:flex-row">
          
          {/* Close Lightbox Trigger */}
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 z-10 p-2.5 bg-black/40 text-white hover:bg-black/60 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Canvas: Main Photo view */}
          <div className="flex-1 flex items-center justify-center p-4 relative h-[60vh] md:h-full">
            <img
              src={activePhoto.url}
              alt="Lightbox"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Right Panel: Comments & details drawer */}
          <div className="w-full md:w-96 bg-white dark:bg-slate-900 h-[40vh] md:h-full flex flex-col justify-between p-4 md:p-6 divide-y divide-slate-150 dark:divide-slate-800">
            
            {/* Meta details */}
            <div className="pb-4 space-y-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                  Google Campus写真館
                </span>
                <p className="text-xs font-semibold text-slate-400 mt-1.5">投稿者: {activePhoto.uploadedBy}</p>
              </div>

              <div className="flex gap-2">
                {/* Liking photo inside lightbox */}
                <button
                  type="button"
                  onClick={handleLikePhoto}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    activePhoto.likes.includes(user.uid)
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${activePhoto.likes.includes(user.uid) ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>いいね ({activePhoto.likes.length})</span>
                </button>

                {/* Simulated Download */}
                <button
                  type="button"
                  onClick={() => onAddNotification("post", "写真保存", "写真データをカメラロールに保存しました。")}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>保存する</span>
                </button>
              </div>
            </div>

            {/* Comments List Feed inside photo */}
            <div className="flex-1 py-4 overflow-y-auto space-y-3 text-xs">
              <p className="font-bold text-slate-500">写真へのコメント ({activePhoto.comments.length})</p>
              <div className="space-y-2.5">
                {activePhoto.comments.map(c => (
                  <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div className="flex justify-between font-bold text-slate-700 dark:text-slate-200 mb-0.5">
                      <span>{c.author}</span>
                      <span className="text-[9px] text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Post Form */}
            <form onSubmit={handleAddPhotoComment} className="pt-4 flex gap-2">
              <input
                type="text"
                placeholder="コメントを残す..."
                value={photoCommentText}
                onChange={(e) => setPhotoCommentText(e.target.value)}
                className="flex-grow text-xs px-3.5 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 rounded-xl focus:outline-hidden"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}
