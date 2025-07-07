
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth } from 'firebase/auth';
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { COLLECTIONS, User } from './types';

export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export const getCollectionPath = (collection: keyof typeof COLLECTIONS) => {
  return COLLECTIONS[collection];
};

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDoc: Omit<User, 'profile' | 'openInnovation'> = {
      email: user.email!,
      createdAt: serverTimestamp() as any,
      status: 'pending_review',
      businessCardImageUrl: '',
    };
    
    await setDoc(doc(firestore, COLLECTIONS.USERS, user.uid), userDoc);
    
    return { success: true, user, uid: user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const uploadBusinessCard = async (uid: string, imageUri: string) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `business_cards/${uid}/business_card.jpg`);
    
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    await updateDoc(doc(firestore, COLLECTIONS.USERS, uid), {
      businessCardImageUrl: downloadURL,
    });
    
    return { success: true, downloadURL };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const userDocRef = doc(firestore, COLLECTIONS.USERS, user.uid);
    const userDoc = await import('firebase/firestore').then(({ getDoc }) => getDoc(userDocRef));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'ユーザー情報が見つかりません' };
    }
    
    const userData = userDoc.data() as User;
    
    if (userData.status === 'pending_review') {
      return { success: true, uid: user.uid, redirect: 'PendingReview' };
    } else if (userData.status === 'approved') {
      if (!userData.profile?.fullName) {
        return { success: true, uid: user.uid, redirect: 'ProfileEdit' };
      } else {
        return { success: true, uid: user.uid, redirect: 'ProfileComplete' };
      }
    } else {
      return { success: false, error: 'アカウントの状態が不正です' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (profileData: any, profileImageUri?: string | null) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }
    
    let profileImageUrl = '';
    
    if (profileImageUri) {
      const response = await fetch(profileImageUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/profile.jpg`);
      await uploadBytes(storageRef, blob);
      profileImageUrl = await getDownloadURL(storageRef);
    }
    
    const userDocRef = doc(firestore, COLLECTIONS.USERS, currentUser.uid);
    await updateDoc(userDocRef, {
      profile: {
        fullName: profileData.fullName,
        companyName: profileData.companyName,
        position: profileData.position,
        profileImageUrl,
        bio: profileData.bio,
        tags: profileData.tags,
      },
      openInnovation: {
        needs: profileData.needs,
        seeds: profileData.seeds,
      },
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export default firebaseConfig;
