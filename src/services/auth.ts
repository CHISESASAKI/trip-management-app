import { 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}

// 匿名認証
export const signInAnonymous = async (): Promise<AuthUser> => {
  try {
    const userCredential = await signInAnonymously(auth);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      isAnonymous: userCredential.user.isAnonymous
    };
  } catch (error) {
    console.error('Anonymous sign in failed:', error);
    throw error;
  }
};

// メール・パスワードでサインイン
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      isAnonymous: userCredential.user.isAnonymous
    };
  } catch (error) {
    console.error('Email sign in failed:', error);
    throw error;
  }
};

// メール・パスワードでサインアップ
export const signUpWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      isAnonymous: userCredential.user.isAnonymous
    };
  } catch (error) {
    console.error('Email sign up failed:', error);
    throw error;
  }
};

// サインアウト
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out failed:', error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous
      });
    } else {
      callback(null);
    }
  });
};

// 現在のユーザーを取得
export const getCurrentUser = (): AuthUser | null => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      isAnonymous: user.isAnonymous
    };
  }
  return null;
};