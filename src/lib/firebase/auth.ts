import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './client';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, provider);
    await upsertUserProfile(result.user);
    return result.user;
  } catch {
    throw new Error('Gagal masuk dengan Google.');
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function upsertUserProfile(user: User): Promise<void> {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? null,
      currency: 'IDR',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}
