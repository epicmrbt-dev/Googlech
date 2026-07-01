import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  limit
} from "firebase/firestore";
import { Post, Comment, Timetable, ChatMessage } from "../types";

// Firebase configuration from config file
const firebaseConfig = {
  projectId: "nth-glass-495704-k5",
  appId: "1:26590233227:web:a629ebc0121bdbfd568a8e",
  apiKey: "AIzaSyDw9sODalUn5QezFyB3-dtosJH-s3S5BXE",
  authDomain: "nth-glass-495704-k5.firebaseapp.com",
  storageBucket: "nth-glass-495704-k5.firebasestorage.app",
  messagingSenderId: "26590233227"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID
export const db = getFirestore(
  app, 
  "ai-studio-googlecampus-01cb031e-bba4-4904-8119-df9a8400a7f7"
);

// --- POSTS SERVICE ---

export function subscribeToPosts(callback: (posts: Post[]) => void) {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
  return onSnapshot(postsQuery, (snapshot) => {
    const posts: Post[] = [];
    snapshot.forEach((docSnapshot) => {
      posts.push({ id: docSnapshot.id, ...docSnapshot.data() } as Post);
    });
    callback(posts);
  }, (error) => {
    console.error("Error subscribing to posts:", error);
  });
}

export async function addPost(post: Omit<Post, "id"> & { id?: string }) {
  try {
    const postData = {
      ...post,
      createdAt: post.createdAt || new Date().toISOString()
    };
    if (post.id) {
      await setDoc(doc(db, "posts", post.id), postData);
      return post.id;
    } else {
      const docRef = await addDoc(collection(db, "posts"), postData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding post:", error);
    throw error;
  }
}

export async function updatePost(postId: string, updates: Partial<Post>) {
  try {
    await updateDoc(doc(db, "posts", postId), updates);
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
}

export async function deletePost(postId: string) {
  try {
    await deleteDoc(doc(db, "posts", postId));
    // Also try to delete comments for this post
    const commentsSnapshot = await getDocs(query(collection(db, "comments"), where("postId", "==", postId)));
    const deletePromises = commentsSnapshot.docs.map(docSnap => deleteDoc(doc(db, "comments", docSnap.id)));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// --- COMMENTS SERVICE ---

export function subscribeToComments(callback: (commentsMap: { [postId: string]: Comment[] }) => void) {
  const commentsQuery = query(collection(db, "comments"), orderBy("createdAt", "asc"));
  return onSnapshot(commentsQuery, (snapshot) => {
    const commentsMap: { [postId: string]: Comment[] } = {};
    snapshot.forEach((docSnapshot) => {
      const comment = { id: docSnapshot.id, ...docSnapshot.data() } as Comment;
      if (!commentsMap[comment.postId]) {
        commentsMap[comment.postId] = [];
      }
      commentsMap[comment.postId].push(comment);
    });
    callback(commentsMap);
  }, (error) => {
    console.error("Error subscribing to comments:", error);
  });
}

export async function addComment(comment: Omit<Comment, "id"> & { id?: string }) {
  try {
    const commentData = {
      ...comment,
      createdAt: comment.createdAt || new Date().toISOString()
    };
    
    let commentId = comment.id;
    if (commentId) {
      await setDoc(doc(db, "comments", commentId), commentData);
    } else {
      const docRef = await addDoc(collection(db, "comments"), commentData);
      commentId = docRef.id;
    }

    // Increment comment count in post doc
    const postRef = doc(db, "posts", comment.postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const currentCount = postSnap.data().commentsCount || 0;
      await updateDoc(postRef, { commentsCount: currentCount + 1 });
    }

    return commentId;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

export async function updateComment(commentId: string, updates: Partial<Comment>) {
  try {
    await updateDoc(doc(db, "comments", commentId), updates);
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
}

// --- TIMETABLES SERVICE ---

export function subscribeToTimetable(className: string, callback: (timetable: Timetable | null) => void) {
  return onSnapshot(doc(db, "timetables", className), (docSnapshot) => {
    if (docSnapshot.exists()) {
      callback(docSnapshot.data().timetable as Timetable);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Error subscribing to timetable:", error);
  });
}

export async function saveTimetable(className: string, timetable: Timetable) {
  try {
    await setDoc(doc(db, "timetables", className), { className, timetable });
  } catch (error) {
    console.error("Error saving timetable:", error);
    throw error;
  }
}

// --- CHAT MESSAGES SERVICE ---

export function subscribeToChats(channel: string, callback: (messages: ChatMessage[]) => void) {
  const chatsQuery = query(
    collection(db, "chats"), 
    where("channel", "==", channel),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(chatsQuery, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((docSnapshot) => {
      messages.push({ id: docSnapshot.id, ...docSnapshot.data() } as ChatMessage);
    });
    callback(messages);
  }, (error) => {
    console.error("Error subscribing to chats:", error);
  });
}

export async function addChatMessage(message: Omit<ChatMessage, "id"> & { id?: string; channel: string }) {
  try {
    const msgData = {
      ...message,
      createdAt: message.createdAt || new Date().toISOString()
    };
    if (message.id) {
      await setDoc(doc(db, "chats", message.id), msgData);
      return message.id;
    } else {
      const docRef = await addDoc(collection(db, "chats"), msgData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding chat message:", error);
    throw error;
  }
}
