
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
        return { success: true, uid: user.uid, redirect: 'MainApp' };
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

export const getDiscoverUsers = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const swipesQuery = query(
      collection(firestore, COLLECTIONS.SWIPES),
      where('swiperUid', '==', currentUser.uid)
    );
    const swipesSnapshot = await getDocs(swipesQuery);
    const swipedUserIds = swipesSnapshot.docs.map(docSnap => docSnap.data().swipedOnUid);
    
    const usersQuery = query(
      collection(firestore, COLLECTIONS.USERS),
      where('status', '==', 'approved')
    );
    const usersSnapshot = await getDocs(usersQuery);
    
    const users = usersSnapshot.docs
      .map(docSnap => ({ uid: docSnap.id, ...docSnap.data() } as User & { uid: string }))
      .filter(user => 
        user.uid !== currentUser.uid && 
        !swipedUserIds.includes(user.uid) &&
        user.profile?.fullName // Only users with complete profiles
      );
    
    return { success: true, users };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const saveSwipeAction = async (swipedOnUid: string, action: 'like' | 'pass') => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    const { addDoc, collection, query, where, getDocs } = await import('firebase/firestore');
    
    await addDoc(collection(firestore, COLLECTIONS.SWIPES), {
      swiperUid: currentUser.uid,
      swipedOnUid,
      action,
      createdAt: serverTimestamp(),
    });
    
    let isMatch = false;
    let matchId = null;
    if (action === 'like') {
      const mutualLikeQuery = query(
        collection(firestore, COLLECTIONS.SWIPES),
        where('swiperUid', '==', swipedOnUid),
        where('swipedOnUid', '==', currentUser.uid),
        where('action', '==', 'like')
      );
      
      const mutualLikeSnapshot = await getDocs(mutualLikeQuery);
      
      if (!mutualLikeSnapshot.empty) {
        isMatch = true;
        
        const matchDoc = await addDoc(collection(firestore, COLLECTIONS.MATCHES), {
          userIds: [currentUser.uid, swipedOnUid],
          createdAt: serverTimestamp(),
        });
        matchId = matchDoc.id;
      }
    }
    
    return { success: true, isMatch, matchId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUserMatches = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    const { collection, query, where, getDocs, doc: firestoreDoc, getDoc } = await import('firebase/firestore');
    
    const matchesQuery = query(
      collection(firestore, COLLECTIONS.MATCHES),
      where('userIds', 'array-contains', currentUser.uid)
    );
    const matchesSnapshot = await getDocs(matchesQuery);
    
    const matches = [];
    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = matchDoc.data();
      const partnerUid = matchData.userIds.find((uid: string) => uid !== currentUser.uid);
      
      const partnerDocRef = firestoreDoc(firestore, COLLECTIONS.USERS, partnerUid);
      const partnerDoc = await getDoc(partnerDocRef);
      
      if (partnerDoc.exists()) {
        const partnerData = partnerDoc.data() as User;
        matches.push({
          matchId: matchDoc.id,
          partner: { uid: partnerUid, ...partnerData },
          createdAt: matchData.createdAt,
        });
      }
    }
    
    return { success: true, matches };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const sendMessage = async (matchId: string, messageText: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'ユーザーが認証されていません' };
    }

    const { addDoc, collection, doc: firestoreDoc, getDoc } = await import('firebase/firestore');
    
    const userDocRef = firestoreDoc(firestore, COLLECTIONS.USERS, currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'ユーザー情報が見つかりません' };
    }
    
    const userData = userDoc.data() as User;
    
    const messageData = {
      text: messageText,
      createdAt: serverTimestamp(),
      user: {
        _id: currentUser.uid,
        name: userData.profile?.fullName || 'Unknown',
        avatar: userData.profile?.profileImageUrl,
      },
    };
    
    const messagesRef = collection(firestore, COLLECTIONS.MATCHES, matchId, COLLECTIONS.MESSAGES);
    await addDoc(messagesRef, messageData);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getMessages = async (matchId: string) => {
  try {
    const { collection, query, orderBy, getDocs } = await import('firebase/firestore');
    
    const messagesQuery = query(
      collection(firestore, COLLECTIONS.MATCHES, matchId, COLLECTIONS.MESSAGES),
      orderBy('createdAt', 'desc')
    );
    const messagesSnapshot = await getDocs(messagesQuery);
    
    const messages = messagesSnapshot.docs.map(docSnapshot => ({
      _id: docSnapshot.id,
      ...docSnapshot.data(),
      createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
    }));
    
    return { success: true, messages };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const setupMessageListener = (matchId: string, callback: (messages: any[]) => void) => {
  const { collection, query, orderBy, onSnapshot } = require('firebase/firestore');
  
  const messagesQuery = query(
    collection(firestore, COLLECTIONS.MATCHES, matchId, COLLECTIONS.MESSAGES),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(messagesQuery, (snapshot: any) => {
    const messages = snapshot.docs.map((docSnapshot: any) => ({
      _id: docSnapshot.id,
      ...docSnapshot.data(),
      createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
    }));
    
    callback(messages);
  });
};

export default firebaseConfig;
