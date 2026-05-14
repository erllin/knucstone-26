import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Appcheck(X), AI Logic
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// FIREBASE 관련 환경변수
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Appcheck => X

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Ai 텍스트 모델 사용 (무료용, firebase Ai logic을 이용함.)
/* 
      gemini-2.5-flash      (일 최대 500회/ 분 15회)  << 좀 더 안정적으로 추천
      gemini-3.1-flash-lite (일 최대 1k회/ 분 15회)
*/
export const ai = getAI(app, {
  backend: new GoogleAIBackend()
});
export const geminiModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash"
});

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);