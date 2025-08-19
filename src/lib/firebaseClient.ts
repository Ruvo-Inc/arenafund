// src/lib/firebaseClient.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "arenafund",
  appId: "1:47542144158:web:c280855c07ec655d6e3f8f",
  storageBucket: "arenafund.firebasestorage.app",
  apiKey: "AIzaSyCSfXWMl_uSI17KU6ecWvd33IZXnMnOGrg",
  authDomain: "arenafund.firebaseapp.com",
  messagingSenderId: "47542144158",
};

export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage();

export const googleProvider = new GoogleAuthProvider();
