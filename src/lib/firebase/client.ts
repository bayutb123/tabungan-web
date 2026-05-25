import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

if (!apiKey) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_API_KEY belum diisi.');
if (!authDomain) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN belum diisi.');
if (!projectId) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID belum diisi.');
if (!storageBucket) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET belum diisi.');
if (!messagingSenderId) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID belum diisi.');
if (!appId) throw new Error('Environment variable NEXT_PUBLIC_FIREBASE_APP_ID belum diisi.');

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analyticsInitialized = false;

export async function initAnalytics(): Promise<void> {
  if (analyticsInitialized || globalThis.window === undefined) return;
  if (!measurementId) return;

  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (!(await isSupported())) return;

  getAnalytics(app);
  analyticsInitialized = true;
}
