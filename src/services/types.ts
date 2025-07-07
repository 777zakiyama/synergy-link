
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export interface UserProfile {
  fullName: string;
  companyName: string;
  position: string;
  profileImageUrl: string;
  bio: string;
  tags: string[]; // 例: ["#AI活用", "#サウナ"]
}

export interface OpenInnovation {
  needs: string; // 探していること
  seeds: string; // 提供できること
}

export interface User {
  email: string;
  createdAt: FirestoreTimestamp;
  status: 'pending_review' | 'approved' | 'rejected';
  businessCardImageUrl: string;
  profile: UserProfile;
  openInnovation: OpenInnovation;
}

export type SwipeAction = 'like' | 'pass';

export interface Swipe {
  swiperUid: string; // スワイプしたユーザーのID
  swipedOnUid: string; // スワイプされたユーザーのID
  action: SwipeAction;
  createdAt: FirestoreTimestamp;
}

export interface Match {
  userIds: [string, string]; // マッチングした2名のユーザーID（配列は必ず2要素）
  createdAt: FirestoreTimestamp;
}

export interface ChatMessage {
  _id: string; // メッセージの一意なID
  text: string; // メッセージ本文
  createdAt: FirestoreTimestamp;
  user: {
    _id: string; // 送信者のuid
    name: string; // 送信者の氏名
    avatar?: string; // 送信者のプロフィール写真URL
  };
}

export const COLLECTIONS = {
  USERS: 'users',
  SWIPES: 'swipes',
  MATCHES: 'matches',
  MESSAGES: 'messages', // サブコレクション: matches/{matchId}/messages
} as const;

export type UserDocument = User & { uid: string };
export type SwipeDocument = Swipe & { id: string };
export type MatchDocument = Match & { id: string };
